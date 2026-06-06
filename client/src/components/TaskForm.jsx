import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlertCircle, Plus, Trash2, Clock, CheckSquare } from 'lucide-react';

export default function TaskForm({ isOpen, onClose, onSubmit, task = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [reminderTime, setReminderTime] = useState('');
  const [status, setStatus] = useState('To Do');
  
  // Subtasks State
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'Medium');
      setCategory(task.category || 'Work');
      setRecurrence(task.recurrence || 'none');
      setSubtasks(task.subtasks || []);
      
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setDueDate(`${year}-${month}-${day}`);
      } else {
        setDueDate('');
      }

      if (task.reminderTime) {
        const d = new Date(task.reminderTime);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        setReminderTime(`${year}-${month}-${day}T${hours}:${minutes}`);
      } else {
        setReminderTime('');
      }
      setStatus(task.status || (task.completed ? 'Completed' : 'To Do'));
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategory('Work');
      setDueDate('');
      setRecurrence('none');
      setReminderTime('');
      setStatus('To Do');
      setSubtasks([]);
    }
    setErrors({});
    setNewSubtaskTitle('');
  }, [task, isOpen]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { title: newSubtaskTitle.trim(), completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Task title is required' });
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate: dueDate || null,
      recurrence,
      reminderTime: reminderTime || null,
      subtasks,
      status,
      completed: status === 'Completed'
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full glass-panel shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {task ? 'Edit Task' : 'Add New Task'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form inputs */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors({});
                    }}
                    placeholder="What needs to be done?"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-950/20 backdrop-blur-sm text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm ${
                      errors.title
                        ? 'border-rose-500 ring-rose-500/20 ring-2'
                        : 'border-slate-200/60 dark:border-slate-800/60'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details about this task..."
                    rows="3"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/20 backdrop-blur-sm text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>

                {/* Category, Priority & Status Row */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/20 text-slate-850 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Design">Design</option>
                      <option value="Ideas">Ideas</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/20 text-slate-850 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/20 text-slate-850 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Due Date & Recurrence Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Due Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-450" />
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/20 text-slate-850 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  {/* Recurrence */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Recurrence
                    </label>
                    <select
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/20 text-slate-850 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="none">None</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Task Reminders */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-450" />
                    Reminder Alert
                  </label>
                  <input
                    type="datetime-local"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/20 text-slate-850 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* Checklist / Subtasks Section */}
                <div className="space-y-2.5 pt-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-450" />
                    Subtasks Checklist
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add a checklist item..."
                      className="flex-grow px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/20 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSubtask}
                      className="px-3 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer shadow-md shadow-indigo-600/10"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subtasks List */}
                  {subtasks.length > 0 && (
                    <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 bg-slate-100/50 dark:bg-slate-950/10 border border-slate-200/40 dark:border-slate-800/20 rounded-xl">
                      {subtasks.map((st, index) => (
                        <div key={index} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-1 border-b border-slate-200/20 last:border-0">
                          <span className="truncate">{st.title}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubtask(index)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 mt-6 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-105 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
              >
                {task ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
