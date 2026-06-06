import React from 'react';
import { CheckCircle2, Circle, AlertTriangle, Calendar, Layers } from 'lucide-react';

export default function TaskStats({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Priority counts
  const high = tasks.filter((t) => t.priority === 'High' && !t.completed).length;
  const medium = tasks.filter((t) => t.priority === 'Medium' && !t.completed).length;
  const low = tasks.filter((t) => t.priority === 'Low' && !t.completed).length;

  // Overdue count
  const overdue = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  // SVG Radial properties
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Radial Progress Card */}
      <div className="glass-card p-6 rounded-2xl flex items-center justify-between col-span-1 md:col-span-2">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Task Completion Rate
          </h3>
          <p className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {completionRate}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {completed} of {total} tasks completed
          </p>
        </div>
        <div className="relative flex items-center justify-center w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Foreground Ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-1000 ease-out"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {completionRate}%
          </span>
        </div>
      </div>

      {/* Basic Metrics Card */}
      <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tasks Overview</span>
          <Layers className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500">Active</span>
            <div className="flex items-center gap-1.5">
              <Circle className="w-4 h-4 text-amber-500 fill-amber-500/10" />
              <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{pending}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500">Completed</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
              <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{completed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Priority & Overdue Card */}
      <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Critical Alerts</span>
          {overdue > 0 ? (
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />
          ) : (
            <Calendar className="w-5 h-5 text-emerald-500" />
          )}
        </div>
        <div className="mt-4 space-y-2">
          {overdue > 0 ? (
            <div className="flex items-center justify-between p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-glow-red">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Overdue Tasks</span>
              <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">{overdue}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">On Track</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">No overdue items</span>
            </div>
          )}
          
          <div className="flex gap-2 justify-between pt-1">
            <div className="text-center flex-1 py-1 rounded bg-rose-500/10 dark:bg-rose-950/20">
              <div className="text-xs font-bold text-rose-500">{high}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">High</div>
            </div>
            <div className="text-center flex-1 py-1 rounded bg-amber-500/10 dark:bg-amber-950/20">
              <div className="text-xs font-bold text-amber-500">{medium}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">Medium</div>
            </div>
            <div className="text-center flex-1 py-1 rounded bg-emerald-500/10 dark:bg-emerald-950/20">
              <div className="text-xs font-bold text-emerald-500">{low}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">Low</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
