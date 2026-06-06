import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, CheckCircle2, Circle, Clock, CheckSquare, Edit, Trash2 } from 'lucide-react';

const columns = [
  { id: 'To Do', label: 'To Do', color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' },
  { id: 'In Progress', label: 'In Progress', color: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' },
  { id: 'Completed', label: 'Completed', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' }
];

export default function KanbanBoard({ tasks, onUpdateTask, onEditClick, onDeleteClick }) {
  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (status) => {
    if (!draggedTask) return;
    if (draggedTask.status !== status) {
      await onUpdateTask(draggedTask._id, { status, completed: status === 'Completed' });
    }
    setDraggedTask(null);
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    if (priority === 'Medium') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.id && !t.isDeleted && !t.isArchived);
        
        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.id)}
            className="glass-panel p-5 rounded-3xl border border-white/20 dark:border-slate-800/30 flex flex-col min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-850/50">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${col.color}`}>
                {col.label}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/20 font-bold">
                {colTasks.length}
              </span>
            </div>

            {/* Tasks List */}
            <div className="flex-grow space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {colTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 dark:text-slate-650 border-2 border-dashed border-slate-200/30 dark:border-slate-800/20 rounded-2xl">
                  <span className="text-xs font-bold">Drag tasks here</span>
                </div>
              ) : (
                colTasks.map((task) => {
                  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
                  const totalSubtasks = task.subtasks?.length || 0;
                  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

                  return (
                    <motion.div
                      layout
                      key={task._id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      className="glass-card p-4 rounded-2xl border border-white/45 dark:border-slate-800/20 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                    >
                      {/* Drag Grip Accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditClick(task)}
                            className="p-1 text-slate-450 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteClick(task._id)}
                            className="p-1 text-slate-450 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-450 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h5 className={`text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug mb-1 ${task.completed ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                      </h5>

                      {/* Description */}
                      {task.description && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-505 line-clamp-2 mb-3 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks Progress */}
                      {totalSubtasks > 0 && (
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-450 dark:text-slate-500">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3" />
                              {completedSubtasks}/{totalSubtasks} Subtasks
                            </span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-slate-800/10 text-[9px] font-extrabold text-slate-450 dark:text-slate-500">
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/10">
                          {task.category}
                        </span>
                        
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
