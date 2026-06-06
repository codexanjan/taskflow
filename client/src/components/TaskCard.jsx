import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit3, Calendar, Check, AlertTriangle, GripVertical, ChevronDown, ChevronUp, Archive, RotateCcw, ShieldX } from 'lucide-react';

export default function TaskCard({
  task,
  index,
  onToggleComplete,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  // New props for expanded features
  onArchive,
  onRestore,
  onDeletePermanent,
  onUpdateTask,
}) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (dateString, completed) => {
    if (completed || !dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    const userTimezoneOffset = due.getTimezoneOffset() * 60000;
    const adjustedDue = new Date(due.getTime() + userTimezoneOffset);
    adjustedDue.setHours(0, 0, 0, 0);
    return adjustedDue < today;
  };

  const overdue = isOverdue(task.dueDate, task.completed);

  // Category badge styles
  const categoryStyles = {
    Work: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    Personal: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    Shopping: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Fitness: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    Design: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    Ideas: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  };

  const categoryClass = categoryStyles[task.category] || categoryStyles.Work;

  const priorityStyles = {
    High: {
      bg: 'bg-rose-500/10 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
      glow: task.completed ? '' : 'animate-glow-red',
    },
    Medium: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
      glow: '',
    },
    Low: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      glow: '',
    },
  };

  const priorityStyle = priorityStyles[task.priority] || priorityStyles.Medium;

  // Subtask progress
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleSubtaskToggle = async (subIndex) => {
    const updatedSubtasks = task.subtasks.map((st, idx) => {
      if (idx === subIndex) {
        return { ...st, completed: !st.completed };
      }
      return st;
    });
    
    // Call update task handler
    if (onUpdateTask) {
      await onUpdateTask(task._id, { subtasks: updatedSubtasks });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ 
        opacity: isDragging ? 0.4 : 1,
        y: 0,
        scale: isDragging ? 0.98 : 1,
        rotate: isDragging ? -1 : 0
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className={`glass-card rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        task.completed 
          ? 'opacity-65 border-slate-200/50 dark:border-slate-800/30 shadow-none' 
          : overdue 
            ? 'border-rose-500/40 glow-hover-red' 
            : 'border-slate-200/80 dark:border-slate-800/50 glow-hover'
      }`}
    >
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          {/* Drag Grip (Locked if deleted/archived/custom sorted) */}
          {!task.isDeleted && !task.isArchived && onDragStart && (
            <div 
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnd={onDragEnd}
              className="text-slate-300 dark:text-slate-650 cursor-grab active:cursor-grabbing hover:text-slate-500 transition-colors p-1"
              title="Drag to reorder"
            >
              <GripVertical className="w-4.5 h-4.5" />
            </div>
          )}

          {/* Complete Checkbox */}
          {!task.isDeleted && (
            <button
              onClick={() => onToggleComplete(task._id, !task.completed)}
              className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 focus:outline-none shrink-0 ${
                task.completed
                  ? 'bg-emerald-500 border-emerald-500 text-white scale-105 shadow-md shadow-emerald-500/20'
                  : overdue
                    ? 'border-rose-500 hover:bg-rose-500/10'
                    : 'border-slate-350 dark:border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/5'
              }`}
            >
              {task.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </motion.div>
              )}
            </button>
          )}

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h4
                onClick={() => totalSubtasks > 0 && setExpanded(!expanded)}
                className={`font-semibold text-slate-800 dark:text-slate-100 truncate text-base leading-snug cursor-pointer hover:underline ${
                  task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                }`}
              >
                {task.title}
              </h4>
              
              {/* Expand Toggle */}
              {totalSubtasks > 0 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {task.description && (
              <p
                className={`text-xs text-slate-500 dark:text-slate-400 line-clamp-1 ${
                  task.completed ? 'line-through text-slate-400/80 dark:text-slate-550' : ''
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Checklist progress bar */}
            {totalSubtasks > 0 && (
              <div className="space-y-1 pt-1.5 max-w-xs">
                <div className="flex justify-between text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">
                  <span>Subtasks</span>
                  <span>{completedSubtasks}/{totalSubtasks} ({subtaskProgress}%)</span>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-500"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side metadata controls */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Metadata Badges */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Category */}
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${categoryClass}`}>
              {task.category}
            </span>

            {/* Priority */}
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${priorityStyle.bg} ${priorityStyle.glow}`}>
              {task.priority}
            </span>

            {/* Recurrence Indicator */}
            {task.recurrence && task.recurrence !== 'none' && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-indigo-500/10 text-indigo-600 border-indigo-500/20 capitalize">
                ↻ {task.recurrence}
              </span>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                  task.completed
                    ? 'bg-slate-100 dark:bg-slate-800/30 text-slate-400 dark:text-slate-650 border-slate-200/30'
                    : overdue
                      ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 animate-pulse'
                      : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                }`}
              >
                {overdue ? <AlertTriangle className="w-3 h-3 text-rose-500" /> : <Calendar className="w-3 h-3" />}
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {/* Contextual Actions */}
          <div className="flex items-center gap-1.5">
            {task.isDeleted ? (
              // Actions inside Trash
              <>
                <button
                  onClick={() => onRestore(task._id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                  title="Restore task"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeletePermanent(task._id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                  title="Delete permanently"
                >
                  <ShieldX className="w-4 h-4" />
                </button>
              </>
            ) : (
              // Active actions
              <>
                <button
                  onClick={() => onArchive(task._id, !task.isArchived)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    task.isArchived
                      ? 'text-indigo-650 hover:text-indigo-700 bg-indigo-500/10'
                      : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                  title={task.isArchived ? 'Unarchive task' : 'Archive task'}
                >
                  <Archive className="w-4 h-4" />
                </button>
                {!task.isArchived && (
                  <button
                    onClick={() => onEdit(task)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                    title="Edit task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(task._id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                  title="Move to Trash"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Subtask Checklist section */}
      <AnimatePresence>
        {expanded && totalSubtasks > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200/50 dark:border-slate-850/50 bg-slate-50/50 dark:bg-slate-950/10"
          >
            <div className="p-4 pl-12 space-y-2.5">
              <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Checklist Items</h5>
              <div className="space-y-2">
                {task.subtasks.map((st, sIdx) => (
                  <div key={st._id || sIdx} className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSubtaskToggle(sIdx)}
                      className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 ${
                        st.completed
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'border-slate-350 dark:border-slate-700 hover:border-indigo-500'
                      }`}
                    >
                      {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span 
                      onClick={() => handleSubtaskToggle(sIdx)}
                      className={`text-xs text-slate-650 dark:text-slate-300 cursor-pointer select-none hover:text-slate-900 ${
                        st.completed ? 'line-through text-slate-400 dark:text-slate-550' : ''
                      }`}
                    >
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
