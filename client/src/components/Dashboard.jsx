import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, supabase } from '../utils/api';
import TaskStats from './TaskStats';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import CalendarView from './CalendarView';
import KanbanBoard from './KanbanBoard';
import ProductivityCentre from './ProductivityCentre';
import { useTheme } from '../context/ThemeContext';
import { 
  Plus, Search, Filter, ArrowUpDown, Info, FolderOpen, 
  Calendar as CalendarIcon, Download, Trash, Archive, 
  Globe, LayoutGrid, KanbanSquare, Target, Settings, Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
  en: {
    dashboard: 'TaskFlow Dashboard',
    listView: 'List View',
    kanbanBoard: 'Kanban Board',
    productivityHub: 'Productivity Centre',
    activeTasks: 'Active Tasks',
    archived: 'Archived',
    trash: 'Trash Bin',
    searchPlaceholder: 'Search tasks...',
    addTask: 'Add Task',
    themeLabel: 'Theme',
    langLabel: 'Lang',
    wallpaperLabel: 'Wallpaper',
    emptyTrash: 'Empty Trash',
    clearFilter: 'Clear Calendar Filter',
    manualOrder: 'Manual Order',
    dueSoon: 'Due Date (Soonest)',
    dueLatest: 'Due Date (Latest)',
    prioritySort: 'Priority',
    categoriesLabel: 'All Categories'
  },
  es: {
    dashboard: 'Panel TaskFlow',
    listView: 'Vista de Lista',
    kanbanBoard: 'Tablero Kanban',
    productivityHub: 'Centro Productividad',
    activeTasks: 'Tareas Activas',
    archived: 'Archivadas',
    trash: 'Papelera',
    searchPlaceholder: 'Buscar tareas...',
    addTask: 'Añadir Tarea',
    themeLabel: 'Tema',
    langLabel: 'Idioma',
    wallpaperLabel: 'Fondo',
    emptyTrash: 'Vaciar Papelera',
    clearFilter: 'Borrar Filtro de Calendario',
    manualOrder: 'Orden Manual',
    dueSoon: 'Fecha de Vencimiento (Próxima)',
    dueLatest: 'Fecha de Vencimiento (Última)',
    prioritySort: 'Prioridad',
    categoriesLabel: 'Todas las Categorías'
  },
  hi: {
    dashboard: 'टास्कफ्लो डैशबोर्ड',
    listView: 'सूची दृश्य',
    kanbanBoard: 'कानबान बोर्ड',
    productivityHub: 'उत्पादकता केंद्र',
    activeTasks: 'सक्रिय कार्य',
    archived: 'अभिलेखागार',
    trash: 'कचरा पेटी',
    searchPlaceholder: 'खोजें...',
    addTask: 'कार्य जोड़ें',
    themeLabel: 'थीम',
    langLabel: 'भाषा',
    wallpaperLabel: 'पृष्ठभूमि',
    emptyTrash: 'कचरा खाली करें',
    clearFilter: 'कैलेंडर फ़िल्टर साफ़ करें',
    manualOrder: 'मैनुअल क्रम',
    dueSoon: 'नियत तारीख (जल्द)',
    dueLatest: 'नियत तारीख (देर)',
    prioritySort: 'प्राथमिकता',
    categoriesLabel: 'सभी श्रेणियां'
  },
  fr: {
    dashboard: 'Tableau TaskFlow',
    listView: 'Vue Liste',
    kanbanBoard: 'Tableau Kanban',
    productivityHub: 'Centre de Productivité',
    activeTasks: 'Tâches Actives',
    archived: 'Archivé',
    trash: 'Corbeille',
    searchPlaceholder: 'Rechercher...',
    addTask: 'Ajouter Tâche',
    themeLabel: 'Thème',
    langLabel: 'Langue',
    wallpaperLabel: 'Arrière-plan',
    emptyTrash: 'Vider la Corbeille',
    clearFilter: 'Effacer le filtre',
    manualOrder: 'Ordre manuel',
    dueSoon: 'Date d\'échéance (Proche)',
    dueLatest: 'Date d\'échéance (Tardive)',
    prioritySort: 'Priorité',
    categoriesLabel: 'Toutes les Catégories'
  }
};

export default function Dashboard() {
  const { guestMode, user } = useAuth();
  const { customTheme, setCustomTheme, wallpaper, setWallpaper } = useTheme();
  
  // Custom navigation views: 'list' | 'board' | 'productivity'
  const [mainView, setMainView] = useState('list');
  const [lang, setLang] = useState('en');

  // Translations selector helper
  const t = translations[lang] || translations.en;

  // Tasks States
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskView, setTaskView] = useState('active'); // active, archived, trash

  // Filters & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Active, Completed
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('manual');

  // Calendar States
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Drag State
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Notifications State
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Fetch tasks based on active tab
  const fetchTasks = async () => {
    setLoading(true);
    try {
      let data = [];
      if (taskView === 'active') {
        data = await tasksAPI.getAll(guestMode);
      } else if (taskView === 'archived') {
        data = await tasksAPI.getArchived(guestMode);
      } else if (taskView === 'trash') {
        data = await tasksAPI.getDeleted(guestMode);
      }
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => setNotificationPermission(perm));
      }
    }
  }, [taskView, guestMode, user]);

  // Supabase Real-time Sync subscription
  useEffect(() => {
    if (guestMode) return;

    const channel = supabase
      .channel('tasks-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('Supabase Postgres database change synced:', payload);
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guestMode]);

  // Task Reminder Poll (Checks every 30s)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach((t) => {
        if (t.completed || t.isDeleted || !t.reminderTime) return;
        const reminderDate = new Date(t.reminderTime);
        if (reminderDate <= now && !t.reminded) {
          if (Notification.permission === 'granted') {
            new Notification('Task Reminder Alert! ⏰', {
              body: `Don't forget: "${t.title}" is due.`,
              icon: '/icon.png',
              tag: t._id,
            });
          }
          t.reminded = true;
          tasksAPI.update(t._id, { reminderTime: null }, guestMode).catch(console.error);
        }
      });
    };

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Operations
  const handleToggleComplete = async (id, completed) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, completed, status: completed ? 'Completed' : 'To Do' } : t))
      );
      await tasksAPI.update(id, { completed, status: completed ? 'Completed' : 'To Do' }, guestMode);
      fetchTasks();
    } catch (err) {
      console.error('Error toggling complete:', err);
      fetchTasks();
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, ...taskData } : t))
      );
      await tasksAPI.update(id, taskData, guestMode);
      fetchTasks();
    } catch (err) {
      console.error('Error updating task properties:', err);
      fetchTasks();
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingTask) {
        const updated = await tasksAPI.update(editingTask._id, formData, guestMode);
        setTasks((prev) =>
          prev.map((t) => (t._id === editingTask._id ? updated : t))
        );
      } else {
        const created = await tasksAPI.create(formData, guestMode);
        setTasks((prev) => [...prev, created]);
      }
      fetchTasks();
    } catch (err) {
      console.error('Error saving task:', err);
    }
    setEditingTask(null);
  };

  const handleSoftDelete = async (id) => {
    try {
      setTasks((prev) => prev.filter((t) => t._id !== id));
      await tasksAPI.softDelete(id, guestMode);
      fetchTasks();
    } catch (err) {
      console.error('Error soft deleting task:', err);
      fetchTasks();
    }
  };

  const handleArchive = async (id, isArchived) => {
    try {
      setTasks((prev) => prev.filter((t) => t._id !== id));
      await tasksAPI.archive(id, isArchived, guestMode);
      fetchTasks();
    } catch (err) {
      console.error('Error archiving task:', err);
      fetchTasks();
    }
  };

  const handleRestore = async (id) => {
    try {
      setTasks((prev) => prev.filter((t) => t._id !== id));
      await tasksAPI.restore(id, guestMode);
      fetchTasks();
    } catch (err) {
      console.error('Error restoring task:', err);
      fetchTasks();
    }
  };

  const handleDeletePermanent = async (id) => {
    try {
      setTasks((prev) => prev.filter((t) => t._id !== id));
      await tasksAPI.deletePermanent(id, guestMode);
      fetchTasks();
    } catch (err) {
      console.error('Error permanent deleting task:', err);
      fetchTasks();
    }
  };

  const handlePurgeTrash = async () => {
    if (window.confirm('Are you sure you want to permanently delete all items in the Trash? This cannot be undone.')) {
      setLoading(true);
      try {
        await tasksAPI.purgeTrash(guestMode);
        setTasks([]);
      } catch (err) {
        console.error('Error purging trash:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Drag and Drop (List swap)
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || sortBy !== 'manual') return;

    const updated = [...tasks];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setTasks(updated);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    if (sortBy !== 'manual') return;
    try {
      await tasksAPI.reorder(tasks, guestMode);
    } catch (err) {
      console.error('Failed to sync reordered tasks:', err);
    }
  };

  // Filters & Sorters
  const getFilteredTasks = () => {
    let result = [...tasks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    if (taskView === 'active' && statusFilter !== 'All') {
      if (statusFilter === 'Active') {
        result = result.filter((t) => t.status === 'To Do' || t.status === 'In Progress');
      } else if (statusFilter === 'Completed') {
        result = result.filter((t) => t.status === 'Completed');
      }
    }

    if (priorityFilter !== 'All') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    if (selectedCalendarDate) {
      result = result.filter((t) => {
        if (!t.dueDate) return false;
        const dDate = new Date(t.dueDate);
        return (
          dDate.getFullYear() === selectedCalendarDate.getFullYear() &&
          dDate.getMonth() === selectedCalendarDate.getMonth() &&
          dDate.getDate() === selectedCalendarDate.getDate()
        );
      });
    }

    if (sortBy === 'dateAsc') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sortBy === 'dateDesc') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      });
    } else if (sortBy === 'priority') {
      const priorityMap = { High: 3, Medium: 2, Low: 1 };
      result.sort((a, b) => (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0));
    }

    return result;
  };

  const displayedTasks = getFilteredTasks();

  return (
    <div className="max-w-6xl w-full mx-auto px-4 pb-16 space-y-6">
      
      {/* Configuration Header Bar (i18n, Theme, Wallpapers) */}
      <div className="glass-panel p-4 rounded-2xl border border-white/20 dark:border-slate-800/30 flex flex-wrap gap-4 items-center justify-between shadow-md">
        <h3 className="text-md font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase select-none">
          {t.dashboard}
        </h3>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* i18n Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/20 rounded-xl">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-600 dark:text-slate-350 focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="hi">हिंदी</option>
              <option value="fr">Français</option>
            </select>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/20 rounded-xl">
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-600 dark:text-slate-350 focus:outline-none cursor-pointer"
            >
              <option value="slate">Classic Theme</option>
              <option value="cyberpunk">Cyberpunk Neon</option>
              <option value="sunset">Sunset Glow</option>
              <option value="forest">Emerald Forest</option>
              <option value="lavender">Lavender Fields</option>
            </select>
          </div>

          {/* Wallpaper Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/20 rounded-xl">
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={wallpaper}
              onChange={(e) => setWallpaper(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-600 dark:text-slate-350 focus:outline-none cursor-pointer"
            >
              <option value="default">Default BG</option>
              <option value="nebula">Dark Nebula</option>
              <option value="cyber">Matrix Grid</option>
              <option value="warm">Sunset Sky</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View navigation tabs */}
      <div className="flex bg-white/20 dark:bg-slate-950/10 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/20 max-w-lg mx-auto">
        {[
          { id: 'list', label: t.listView, icon: LayoutGrid },
          { id: 'board', label: t.kanbanBoard, icon: KanbanSquare },
          { id: 'productivity', label: t.productivityHub, icon: Target }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setMainView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mainView === tab.id
                  ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-md scale-105'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Statistics view */}
      <TaskStats tasks={tasks} />

      {/* RENDER ACTIVE VIEWS */}
      <div className="w-full">
        {mainView === 'productivity' && (
          <ProductivityCentre tasks={tasks} onTaskImported={fetchTasks} guestMode={guestMode} />
        )}

        {mainView === 'board' && (
          <KanbanBoard 
            tasks={tasks} 
            onUpdateTask={handleUpdateTask} 
            onEditClick={handleEditClick} 
            onDeleteClick={handleSoftDelete} 
          />
        )}

        {mainView === 'list' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Side: Calendar Panel */}
            <div className={`lg:col-span-1 space-y-4 ${showCalendar ? 'block' : 'hidden lg:block'}`}>
              <CalendarView
                tasks={tasks}
                selectedDate={selectedCalendarDate}
                onSelectDate={setSelectedCalendarDate}
              />
            </div>

            {/* Right Side: Task Lists */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/20 dark:border-slate-800/30 shadow-xl space-y-6">
              
              {/* Category tabs */}
              <div className="flex border-b border-slate-200/50 dark:border-slate-850/50 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                {[
                  { id: 'active', label: t.activeTasks, count: tasks.filter((t) => !t.isDeleted && !t.isArchived).length },
                  { id: 'archived', label: t.archived, count: tasks.filter((t) => !t.isDeleted && t.isArchived).length },
                  { id: 'trash', label: t.trash, count: tasks.filter((t) => t.isDeleted).length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setTaskView(tab.id);
                      setSelectedCalendarDate(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-extrabold transition-all cursor-pointer ${
                      taskView === tab.id
                        ? 'border-indigo-500 text-indigo-650 dark:text-indigo-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/20 font-bold">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/20 dark:bg-slate-950/10 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm animate-fade-in"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="lg:hidden p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/20 dark:bg-slate-950/10 text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </button>

                  {taskView === 'trash' && tasks.length > 0 && (
                    <button
                      onClick={handlePurgeTrash}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      <span>{t.emptyTrash}</span>
                    </button>
                  )}

                  {taskView === 'active' && (
                    <div className="flex p-0.5 bg-slate-100 dark:bg-slate-850/30 rounded-xl border border-slate-200/50 dark:border-slate-800/20">
                      {['All', 'Active', 'Completed'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            statusFilter === s
                              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-white/20 dark:bg-slate-950/10 border border-slate-200/60 dark:border-slate-800/60 rounded-xl">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-355 focus:outline-none cursor-pointer"
                    >
                      <option value="All">{t.categoriesLabel}</option>
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Design">Design</option>
                      <option value="Ideas">Ideas</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-white/20 dark:bg-slate-950/10 border border-slate-200/60 dark:border-slate-800/60 rounded-xl">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-355 focus:outline-none cursor-pointer"
                    >
                      <option value="manual">{t.manualOrder}</option>
                      <option value="dateAsc">{t.dueSoon}</option>
                      <option value="dateDesc">{t.dueLatest}</option>
                      <option value="priority">{t.prioritySort}</option>
                    </select>
                  </div>

                  {taskView === 'active' && (
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setIsFormOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.addTask}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Day filter indicator */}
              {selectedCalendarDate && (
                <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Showing tasks due on: **{selectedCalendarDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}**
                  </span>
                  <button
                    onClick={() => setSelectedCalendarDate(null)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {t.clearFilter}
                  </button>
                </div>
              )}

              {/* Drag warning */}
              {taskView === 'active' && sortBy !== 'manual' && displayedTasks.length > 1 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/25 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold max-w-max">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Manual drag-and-drop reordering is locked while custom sorting is active.</span>
                </div>
              )}

              {/* Task Cards Lists */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-slate-400 dark:text-slate-550">Retrieving items...</span>
                </div>
              ) : displayedTasks.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-4 bg-slate-50/20 dark:bg-slate-900/10">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-600">
                    <FolderOpen className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-700 dark:text-slate-350">No tasks found</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-505 max-w-sm mx-auto">
                      {searchQuery || priorityFilter !== 'All' || categoryFilter !== 'All' || selectedCalendarDate
                        ? 'Adjust your query, category settings, or calendar filters to locate items.'
                        : taskView === 'archived'
                          ? 'No items archived. Swipe active tasks to archiving to view them here.'
                          : taskView === 'trash'
                            ? 'Trash bin is empty.'
                            : 'Begin task flows by clicking the "Add Task" button!'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {displayedTasks.map((t, index) => (
                      <TaskCard
                        key={t._id}
                        task={t}
                        index={index}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditClick}
                        onDelete={handleSoftDelete}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedIndex === index}
                        onArchive={handleArchive}
                        onRestore={handleRestore}
                        onDeletePermanent={handleDeletePermanent}
                        onUpdateTask={handleUpdateTask}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdate}
        task={editingTask}
      />
    </div>
  );
}
