import React, { useState } from 'react';
import HabitTracker from './HabitTracker';
import GoalTracker from './GoalTracker';
import PomodoroTimer from './PomodoroTimer';
import SecurityConsole from './SecurityConsole';
import ImportExportManager from './ImportExportManager';
import { Target, Clock, ShieldAlert, Award, FileText } from 'lucide-react';

export default function ProductivityCentre({ tasks, onTaskImported, guestMode }) {
  const [subTab, setSubTab] = useState('focus'); // focus, habits, security

  return (
    <div className="w-full space-y-6">
      
      {/* Sub tabs selector */}
      <div className="flex bg-white/20 dark:bg-slate-950/10 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/30 max-w-md mx-auto">
        {[
          { id: 'focus', label: 'Pomodoro Focus', icon: Clock },
          { id: 'habits', label: 'Habits & Goals', icon: Target },
          { id: 'security', label: 'Data & Security', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-550 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render sub tabs */}
      <div className="w-full">
        {subTab === 'focus' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2">
              <PomodoroTimer />
            </div>
            
            {/* Interactive Focus Tips panel */}
            <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-slate-800/30 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5 border-b border-slate-200/50 dark:border-slate-850/50 pb-2">
                <Award className="w-4.5 h-4.5 text-indigo-500" />
                <span>Focus Guidelines</span>
              </h4>
              
              <ul className="space-y-3.5 text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Choose one high-priority task to tackle during your 25-minute Pomodoro block.</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Enable the **rain oscillator** white noise slider to filter out room acoustics.</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>When working, hide dashboard cards entirely using the **Eye icon** Focus mode toggle.</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Take short 5-minute break intervals to move around, stretch, or grab water.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {subTab === 'habits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <HabitTracker guestMode={guestMode} />
            <GoalTracker tasks={tasks} guestMode={guestMode} />
          </div>
        )}

        {subTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <SecurityConsole guestMode={guestMode} />
            <ImportExportManager tasks={tasks} onTaskImported={onTaskImported} guestMode={guestMode} />
          </div>
        )}
      </div>

    </div>
  );
}
