import express from 'express';
import Task from '../models/Task.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate next recurring date
const getNextRecurringDate = (dateString, recurrence) => {
  const date = dateString ? new Date(dateString) : new Date();
  if (recurrence === 'daily') {
    date.setDate(date.getDate() + 1);
  } else if (recurrence === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (recurrence === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  }
  return date;
};

// @route   GET api/tasks
// @desc    Get all active user tasks (excluding archived and deleted)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
      isDeleted: false,
      isArchived: false,
    }).sort({ orderIndex: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// @route   GET api/tasks/archive
// @desc    Get all archived user tasks
// @access  Private
router.get('/archive', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
      isDeleted: false,
      isArchived: true,
    }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching archived tasks' });
  }
});

// @route   GET api/tasks/trash
// @desc    Get all soft-deleted user tasks
// @access  Private
router.get('/trash', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
      isDeleted: true,
    }).sort({ deletedAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching deleted tasks' });
  }
});

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, priority, category, dueDate, recurrence, reminderTime, subtasks } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  try {
    const count = await Task.countDocuments({ user: req.user.id, isDeleted: false, isArchived: false });

    const newTask = new Task({
      user: req.user.id,
      title,
      description: description || '',
      priority: priority || 'Medium',
      category: category || 'Work',
      dueDate: dueDate || null,
      recurrence: recurrence || 'none',
      reminderTime: reminderTime || null,
      subtasks: subtasks || [],
      orderIndex: count,
    });

    const task = await newTask.save();
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating task' });
  }
});

// @route   PUT api/tasks/reorder
// @desc    Reorder multiple tasks (batch update)
// @access  Private
router.put('/reorder', authMiddleware, async (req, res) => {
  const { tasks } = req.body; // Array of { id, orderIndex }

  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ message: 'Missing or invalid tasks array' });
  }

  try {
    const bulkOperations = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t.id, user: req.user.id },
        update: { orderIndex: t.orderIndex },
      },
    }));

    if (bulkOperations.length > 0) {
      await Task.bulkWrite(bulkOperations);
    }
    
    res.json({ message: 'Tasks reordered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during batch reordering' });
  }
});

// @route   DELETE api/tasks/trash/purge
// @desc    Permanently delete all soft-deleted tasks
// @access  Private
router.delete('/trash/purge', authMiddleware, async (req, res) => {
  try {
    await Task.deleteMany({ user: req.user.id, isDeleted: true });
    res.json({ message: 'Trash bin purged successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error purging trash' });
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task (incorporating subtasks & recurrence roll)
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, priority, category, dueDate, completed, recurrence, reminderTime, subtasks, isArchived, isDeleted } = req.body;

  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    // Update direct fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (recurrence !== undefined) task.recurrence = recurrence;
    if (reminderTime !== undefined) task.reminderTime = reminderTime;
    if (subtasks !== undefined) task.subtasks = subtasks;
    if (isArchived !== undefined) task.isArchived = isArchived;
    
    // Soft Delete / Restore handling
    if (isDeleted !== undefined) {
      task.isDeleted = isDeleted;
      task.deletedAt = isDeleted ? new Date() : null;
    }

    // Handle completed / Recurring Tasks Roll-Forward logic
    if (completed === true) {
      if (task.recurrence && task.recurrence !== 'none') {
        // Compute next due date
        task.dueDate = getNextRecurringDate(task.dueDate || new Date(), task.recurrence);
        task.completed = false; // reset active
        // Reset subtasks completion
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks = task.subtasks.map((st) => {
            st.completed = false;
            return st;
          });
        }
      } else {
        task.completed = true;
      }
    } else if (completed === false) {
      task.completed = false;
    } else if (dueDate !== undefined) {
      task.dueDate = dueDate;
    }

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating task' });
  }
});

// @route   DELETE api/tasks/:id/permanent
// @desc    Permanently delete a task
// @access  Private
router.delete('/:id/permanent', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }
    res.json({ message: 'Task removed permanently' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting task permanently' });
  }
});

export default router;
