import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbrqudkfyayblsainrzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNicnF1ZGtmeWF5YmxzYWlucnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MzE4MDUsImV4cCI6MjA5NjIwNzgwNX0.0zFASREuz7HTMDFsPeAL04CqCS1hP0InxYbokkfyjFo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Maintain online status for UI components
export const checkBackendHealth = async () => {
  return true;
};

export const isOnline = () => true;

// --- Database Object Mapping Helpers ---

export const mapTaskFromDb = (task) => {
  if (!task) return null;
  return {
    _id: task.id,
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'Medium',
    category: task.category || 'Work',
    dueDate: task.due_date || null,
    completed: task.completed || false,
    status: task.status || (task.completed ? 'Completed' : 'To Do'),
    orderIndex: task.order_index || 0,
    subtasks: task.subtasks || [],
    recurrence: task.recurrence || 'none',
    isArchived: task.is_archived || false,
    isDeleted: task.is_deleted || false,
    deletedAt: task.deleted_at || null,
    reminderTime: task.reminder_time || null,
    createdAt: task.created_at || null,
  };
};

export const mapTaskToDb = (task, userId) => {
  if (!task) return null;
  const status = task.status || (task.completed ? 'Completed' : 'To Do');
  const completed = status === 'Completed' ? true : (task.completed || false);
  const mapped = {
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'Medium',
    category: task.category || 'Work',
    due_date: task.dueDate || null,
    completed: completed,
    status: status,
    order_index: task.orderIndex || 0,
    subtasks: task.subtasks || [],
    recurrence: task.recurrence || 'none',
    is_archived: task.isArchived || false,
    is_deleted: task.isDeleted || false,
    deleted_at: task.deletedAt || null,
    reminder_time: task.reminderTime || null,
  };
  if (userId) {
    mapped.user_id = userId;
  }
  return mapped;
};

const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

const getUserProfile = async (userId, email) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    return {
      id: userId,
      email: email,
      name: email ? email.split('@')[0] : 'User',
      profilePicture: null,
    };
  }
  return {
    id: data.id,
    email: data.email,
    name: data.name || (data.email ? data.email.split('@')[0] : 'User'),
    profilePicture: data.profile_picture || null,
  };
};

// --- LocalStorage Fallback Helper ---
const getLocalTasks = () => {
  const tasks = localStorage.getItem('guest_tasks');
  return tasks ? JSON.parse(tasks) : [];
};

const saveLocalTasks = (tasks) => {
  localStorage.setItem('guest_tasks', JSON.stringify(tasks));
};

const getLocalHabits = () => {
  const habits = localStorage.getItem('guest_habits');
  return habits ? JSON.parse(habits) : [];
};

const saveLocalHabits = (habits) => {
  localStorage.setItem('guest_habits', JSON.stringify(habits));
};

const getLocalGoals = () => {
  const goals = localStorage.getItem('guest_goals');
  return goals ? JSON.parse(goals) : [];
};

const saveLocalGoals = (goals) => {
  localStorage.setItem('guest_goals', JSON.stringify(goals));
};

const getLocalLogs = () => {
  const logs = localStorage.getItem('guest_logs');
  return logs ? JSON.parse(logs) : [];
};

const saveLocalLogs = (logs) => {
  localStorage.setItem('guest_logs', JSON.stringify(logs));
};

const addLocalLog = (action) => {
  const logs = getLocalLogs();
  logs.unshift({
    id: `log-${Date.now()}`,
    action,
    created_at: new Date().toISOString(),
  });
  saveLocalLogs(logs.slice(0, 100)); // cap at 100
};

// Streak Calculation Helper
const calculateStreak = (completedDays) => {
  if (!completedDays || completedDays.length === 0) return 0;
  
  const dates = [...new Set(completedDays)]
    .map(d => new Date(d))
    .sort((a, b) => b - a);
    
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const latestDate = new Date(dates[0]);
  latestDate.setHours(0, 0, 0, 0);
  
  if (latestDate < yesterday && latestDate.getTime() !== today.getTime()) {
    return 0;
  }
  
  let streak = 0;
  let currentCheck = latestDate.getTime() === today.getTime() ? today : yesterday;
  
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    d.setHours(0, 0, 0, 0);
    
    if (d.getTime() === currentCheck.getTime()) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1);
    } else if (d.getTime() < currentCheck.getTime()) {
      break;
    }
  }
  return streak;
};

// Roll forward due dates for recurring items
const rollLocalRecurringTask = (task) => {
  if (!task.recurrence || task.recurrence === 'none') {
    task.completed = true;
    task.status = 'Completed';
    return task;
  }

  const date = task.dueDate ? new Date(task.dueDate) : new Date();
  if (task.recurrence === 'daily') {
    date.setDate(date.getDate() + 1);
  } else if (task.recurrence === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (task.recurrence === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  }

  task.dueDate = date.toISOString();
  task.completed = false; // Reset completed status
  task.status = 'To Do';
  
  // Reset subtasks
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks = task.subtasks.map((st) => ({ ...st, completed: false }));
  }
  return task;
};

// --- API Exports ---

export const authAPI = {
  register: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    
    const profile = await getUserProfile(data.user.id, data.user.email);
    await logsAPI.create(`Registered new account: ${email}`, false);
    return {
      token: data.session?.access_token || 'supabase-session',
      user: profile,
    };
  },
  
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    const profile = await getUserProfile(data.user.id, data.user.email);
    await logsAPI.create(`Signed in with email: ${email}`, false);
    return {
      token: data.session?.access_token || 'supabase-session',
      user: profile,
    };
  },
  
  getMe: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    const profile = await getUserProfile(user.id, user.email);
    return profile;
  },

  forgotPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });
    if (error) throw error;
    return { message: 'Password reset link sent to your email!' };
  },

  resetPassword: async (token, password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    await logsAPI.create(`Reset account password`, false);
    return { message: 'Password updated successfully!' };
  }
};

export const tasksAPI = {
  getAll: async (useGuestMode = false) => {
    if (useGuestMode) {
      return getLocalTasks().filter((t) => !t.isDeleted && !t.isArchived).sort((a, b) => a.orderIndex - b.orderIndex);
    }
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .eq('is_archived', false)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data.map(mapTaskFromDb);
  },

  getArchived: async (useGuestMode = false) => {
    if (useGuestMode) {
      return getLocalTasks().filter((t) => !t.isDeleted && t.isArchived).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .eq('is_archived', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(mapTaskFromDb);
  },

  getDeleted: async (useGuestMode = false) => {
    if (useGuestMode) {
      return getLocalTasks().filter((t) => t.isDeleted).sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    }
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false });
    
    if (error) throw error;
    return data.map(mapTaskFromDb);
  },

  create: async (taskData, useGuestMode = false) => {
    if (useGuestMode) {
      const tasks = getLocalTasks();
      const newTask = {
        _id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'Medium',
        category: taskData.category || 'Work',
        dueDate: taskData.dueDate || null,
        recurrence: taskData.recurrence || 'none',
        reminderTime: taskData.reminderTime || null,
        subtasks: taskData.subtasks || [],
        completed: false,
        status: taskData.status || 'To Do',
        isArchived: false,
        isDeleted: false,
        orderIndex: tasks.filter((t) => !t.isDeleted && !t.isArchived).length,
        createdAt: new Date().toISOString(),
      };
      tasks.push(newTask);
      saveLocalTasks(tasks);
      addLocalLog(`Created local task: "${taskData.title}"`);
      return newTask;
    }

    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    // Get order index
    const { count, error: countErr } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .eq('is_archived', false);
    
    const orderIndex = countErr ? 0 : (count || 0);

    const dbTask = mapTaskToDb({ ...taskData, orderIndex }, userId);
    const { data, error } = await supabase
      .from('tasks')
      .insert([dbTask])
      .select()
      .single();
    
    if (error) throw error;
    await logsAPI.create(`Created task: "${taskData.title}"`, false);
    return mapTaskFromDb(data);
  },

  update: async (id, taskData, useGuestMode = false) => {
    if (useGuestMode || String(id).startsWith('local-')) {
      const tasks = getLocalTasks();
      const idx = tasks.findIndex((t) => t._id === id);
      if (idx !== -1) {
        let updatedTask = { ...tasks[idx], ...taskData };
        if (taskData.status === 'Completed' || taskData.completed === true) {
          updatedTask = rollLocalRecurringTask(updatedTask);
        }
        tasks[idx] = updatedTask;
        saveLocalTasks(tasks);
        addLocalLog(`Updated local task: "${updatedTask.title}"`);
        return updatedTask;
      }
      throw new Error('Local task not found');
    }

    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    let finalTaskData = { ...taskData };

    if (taskData.status === 'Completed' || taskData.completed === true) {
      const { data: currentTask, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!fetchError && currentTask && currentTask.recurrence && currentTask.recurrence !== 'none') {
        const mappedCurrent = mapTaskFromDb(currentTask);
        const rolled = rollLocalRecurringTask({ ...mappedCurrent, ...taskData });
        finalTaskData = {
          ...finalTaskData,
          dueDate: rolled.dueDate,
          completed: rolled.completed,
          status: rolled.status,
          subtasks: rolled.subtasks,
        };
      }
    }

    const dbTask = mapTaskToDb(finalTaskData);
    const { data, error } = await supabase
      .from('tasks')
      .update(dbTask)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    await logsAPI.create(`Updated task: "${data.title}"`, false);
    return mapTaskFromDb(data);
  },

  softDelete: async (id, useGuestMode = false) => {
    return tasksAPI.update(id, { isDeleted: true, deletedAt: new Date().toISOString() }, useGuestMode);
  },

  restore: async (id, useGuestMode = false) => {
    return tasksAPI.update(id, { isDeleted: false, isArchived: false, deletedAt: null }, useGuestMode);
  },

  archive: async (id, isArchived, useGuestMode = false) => {
    return tasksAPI.update(id, { isArchived }, useGuestMode);
  },

  deletePermanent: async (id, useGuestMode = false) => {
    if (useGuestMode || String(id).startsWith('local-')) {
      let tasks = getLocalTasks();
      const item = tasks.find((t) => t._id === id);
      tasks = tasks.filter((t) => t._id !== id);
      saveLocalTasks(tasks);
      addLocalLog(`Permanently deleted local task: "${item?.title || 'Unknown'}"`);
      return { message: 'Task deleted permanently' };
    }
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Task deleted permanently' };
  },

  purgeTrash: async (useGuestMode = false) => {
    if (useGuestMode) {
      let tasks = getLocalTasks();
      tasks = tasks.filter((t) => !t.isDeleted);
      saveLocalTasks(tasks);
      addLocalLog(`Purged local trash bin`);
      return { message: 'Local trash bin empty' };
    }
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId)
      .eq('is_deleted', true);
    
    if (error) throw error;
    await logsAPI.create(`Empty trash bin`, false);
    return { message: 'Trash bin empty' };
  },

  reorder: async (reorderedTasks, useGuestMode = false) => {
    if (useGuestMode) {
      const currentTasks = getLocalTasks();
      const updated = currentTasks.map((t) => {
        const match = reorderedTasks.find((rt) => rt._id === t._id);
        if (match) {
          t.orderIndex = reorderedTasks.indexOf(match);
        }
        return t;
      });
      saveLocalTasks(updated);
      return { message: 'Local tasks reordered' };
    }

    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('Not authenticated');

      const promises = reorderedTasks.map((t, idx) => {
        return supabase
          .from('tasks')
          .update({ order_index: idx })
          .eq('id', t._id);
      });
      await Promise.all(promises);
      return { message: 'Tasks reordered successfully' };
    } catch (err) {
      console.error('Failed to sync reorder, falling back to LocalStorage reorder', err);
      const currentTasks = getLocalTasks();
      const updated = currentTasks.map((t) => {
        const match = reorderedTasks.find((rt) => rt._id === t._id);
        if (match) {
          t.orderIndex = reorderedTasks.indexOf(match);
        }
        return t;
      });
      saveLocalTasks(updated);
      return { message: 'Local reorder complete' };
    }
  },
};

export const habitsAPI = {
  getAll: async (useGuestMode = false) => {
    if (useGuestMode) {
      return getLocalHabits();
    }
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  create: async (title, useGuestMode = false) => {
    if (useGuestMode) {
      const habits = getLocalHabits();
      const newHabit = {
        id: `habit-${Date.now()}`,
        title,
        completed_days: [],
        streak: 0,
        created_at: new Date().toISOString()
      };
      habits.push(newHabit);
      saveLocalHabits(habits);
      addLocalLog(`Created local habit: "${title}"`);
      return newHabit;
    }
    
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('habits')
      .insert([{ user_id: userId, title, completed_days: [] }])
      .select()
      .single();
      
    if (error) throw error;
    await logsAPI.create(`Created habit: "${title}"`, false);
    return data;
  },

  toggleDay: async (id, dateStr, useGuestMode = false) => {
    if (useGuestMode) {
      const habits = getLocalHabits();
      const idx = habits.findIndex(h => h.id === id);
      if (idx !== -1) {
        const habit = habits[idx];
        const days = habit.completed_days || [];
        const dayIdx = days.indexOf(dateStr);
        
        if (dayIdx !== -1) {
          days.splice(dayIdx, 1);
        } else {
          days.push(dateStr);
        }
        
        habit.completed_days = days;
        habit.streak = calculateStreak(days);
        habits[idx] = habit;
        saveLocalHabits(habits);
        addLocalLog(`Toggled habit "${habit.title}" for ${dateStr}`);
        return habit;
      }
      throw new Error('Habit not found');
    }
    
    // Cloud database toggle
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    
    // Fetch habit first
    const { data: habit, error: fetchErr } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchErr) throw fetchErr;
    
    const days = habit.completed_days || [];
    const dayIdx = days.indexOf(dateStr);
    
    if (dayIdx !== -1) {
      days.splice(dayIdx, 1);
    } else {
      days.push(dateStr);
    }
    
    const streak = calculateStreak(days);
    
    const { data: updated, error: updateErr } = await supabase
      .from('habits')
      .update({ completed_days: days, streak })
      .eq('id', id)
      .select()
      .single();
      
    if (updateErr) throw updateErr;
    await logsAPI.create(`Logged habit completion: "${updated.title}"`, false);
    return updated;
  },

  delete: async (id, useGuestMode = false) => {
    if (useGuestMode) {
      let habits = getLocalHabits();
      const item = habits.find(h => h.id === id);
      habits = habits.filter(h => h.id !== id);
      saveLocalHabits(habits);
      addLocalLog(`Deleted local habit: "${item?.title || 'Unknown'}"`);
      return { message: 'Habit deleted' };
    }
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Habit deleted' };
  }
};

export const goalsAPI = {
  getAll: async (useGuestMode = false) => {
    if (useGuestMode) {
      return getLocalGoals();
    }
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  create: async (goalData, useGuestMode = false) => {
    if (useGuestMode) {
      const goals = getLocalGoals();
      const newGoal = {
        id: `goal-${Date.now()}`,
        title: goalData.title,
        description: goalData.description || '',
        target_date: goalData.target_date || null,
        status: 'In Progress',
        created_at: new Date().toISOString()
      };
      goals.push(newGoal);
      saveLocalGoals(goals);
      addLocalLog(`Created local goal: "${goalData.title}"`);
      return newGoal;
    }
    
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: userId,
        title: goalData.title,
        description: goalData.description || '',
        target_date: goalData.target_date || null,
        status: 'In Progress'
      }])
      .select()
      .single();
      
    if (error) throw error;
    await logsAPI.create(`Created goal: "${goalData.title}"`, false);
    return data;
  },

  update: async (id, goalData, useGuestMode = false) => {
    if (useGuestMode) {
      const goals = getLocalGoals();
      const idx = goals.findIndex(g => g.id === id);
      if (idx !== -1) {
        const updated = { ...goals[idx], ...goalData };
        goals[idx] = updated;
        saveLocalGoals(goals);
        addLocalLog(`Updated local goal: "${updated.title}"`);
        return updated;
      }
      throw new Error('Goal not found');
    }
    
    const { data, error } = await supabase
      .from('goals')
      .update({
        title: goalData.title,
        description: goalData.description,
        target_date: goalData.target_date,
        status: goalData.status
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    await logsAPI.create(`Updated goal: "${data.title}"`, false);
    return data;
  },

  delete: async (id, useGuestMode = false) => {
    if (useGuestMode) {
      let goals = getLocalGoals();
      const item = goals.find(g => g.id === id);
      goals = goals.filter(g => g.id !== id);
      saveLocalGoals(goals);
      addLocalLog(`Deleted local goal: "${item?.title || 'Unknown'}"`);
      return { message: 'Goal deleted' };
    }
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Goal deleted' };
  }
};

export const logsAPI = {
  getAll: async (useGuestMode = false) => {
    if (useGuestMode) {
      return getLocalLogs();
    }
    const userId = await getCurrentUserId();
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) return [];
    return data;
  },

  create: async (action, useGuestMode = false) => {
    if (useGuestMode) {
      addLocalLog(action);
      return;
    }
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;
      
      await supabase
        .from('activity_logs')
        .insert([{ user_id: userId, action }]);
    } catch (err) {
      console.warn('Failed to save cloud activity log', err);
    }
  }
};
