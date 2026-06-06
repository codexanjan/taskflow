import React, { useState, useEffect } from 'react';
import { habitsAPI } from '../utils/api';
import { Plus, Check, Flame, Trash2, Calendar, Target, ShieldAlert } from 'lucide-react';

export default function HabitTracker({ guestMode }) {
  const [habits, setHabits] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate the last 7 dates for logging
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Format as YYYY-MM-DD
      const dateStr = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString(undefined, { weekday: 'narrow' });
      days.push({ dateStr, weekday, rawDate: d });
    }
    return days;
  };

  const daysList = getLast7Days();

  const fetchHabits = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await habitsAPI.getAll(guestMode);
      setHabits(data);
    } catch (err) {
      console.error('Failed to load habits:', err);
      setError(err.message || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [guestMode]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await habitsAPI.create(newTitle.trim(), guestMode);
      setHabits(prev => [...prev, created]);
      setNewTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDay = async (habitId, dateStr) => {
    try {
      // Optimistic Update
      setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          const completed = h.completed_days || [];
          const idx = completed.indexOf(dateStr);
          const nextDays = [...completed];
          if (idx !== -1) {
            nextDays.splice(idx, 1);
          } else {
            nextDays.push(dateStr);
          }
          // Simple streak recalculation locally
          return { ...h, completed_days: nextDays };
        }
        return h;
      }));
      
      const updated = await habitsAPI.toggleDay(habitId, dateStr, guestMode);
      // Replace with official calculation
      setHabits(prev => prev.map(h => h.id === habitId ? updated : h));
    } catch (err) {
      console.error(err);
      fetchHabits();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this habit?')) {
      try {
        await habitsAPI.delete(id, guestMode);
        setHabits(prev => prev.filter(h => h.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-slate-800/30 shadow-xl space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-850/50">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
          <Target className="w-4.5 h-4.5 text-indigo-500" />
          <span>Daily Habits</span>
        </h4>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold border border-slate-200/50 dark:border-slate-800/20">
          Streak Logs
        </span>
      </div>

      {/* Create Habit Form */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New habit (e.g. Read 15 mins)..."
          className="flex-grow px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/20 dark:bg-slate-950/10 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Habit Lists */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card p-4 rounded-2xl border border-white/45 dark:border-slate-800/10 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
              <div className="space-y-2 max-w-xs w-full">
                <div className="h-4 bg-slate-250/50 dark:bg-slate-800/30 rounded w-2/3"></div>
                <div className="h-3 bg-slate-250/50 dark:bg-slate-800/30 rounded w-1/3"></div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <div key={d} className="flex flex-col items-center gap-1">
                    <div className="h-2 w-3 bg-slate-250/40 dark:bg-slate-800/20 rounded"></div>
                    <div className="w-7 h-7 rounded-xl bg-slate-250/50 dark:bg-slate-800/30"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-card p-6 rounded-2xl border border-rose-500/20 dark:border-rose-550/10 bg-rose-500/5 text-center space-y-3 flex flex-col items-center justify-center animate-fade-in">
          <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-rose-600 dark:text-rose-455">Failed to load habits</h5>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchHabits}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-md cursor-pointer transition-all hover:scale-105"
          >
            Retry Connection
          </button>
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-8 text-slate-400 dark:text-slate-505 border border-dashed border-slate-200/30 dark:border-slate-800/20 rounded-2xl animate-fade-in">
          <p className="text-xs font-bold">No habits registered. Register one above!</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {habits.map((habit) => (
            <div key={habit.id} className="glass-card p-4 rounded-2xl border border-white/45 dark:border-slate-800/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Habit Meta */}
              <div className="space-y-1 max-w-xs">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-250 leading-tight">
                    {habit.title}
                  </h5>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="p-1 text-slate-350 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {/* Streak count */}
                <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-500">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{habit.streak || 0} Day Streak</span>
                </div>
              </div>

              {/* Grid 7 Days checkmarks */}
              <div className="flex items-center gap-2">
                {daysList.map((day) => {
                  const isCompleted = habit.completed_days?.includes(day.dateStr);
                  
                  return (
                    <div key={day.dateStr} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-extrabold text-slate-450 dark:text-slate-500 select-none">
                        {day.weekday}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleDay(habit.id, day.dateStr)}
                        className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 text-white border-transparent shadow-sm shadow-emerald-500/20 scale-105'
                            : 'border-slate-200/60 dark:border-slate-800/60 hover:border-slate-350 dark:hover:border-slate-600 text-transparent bg-white/20 dark:bg-slate-900/10'
                        }`}
                        title={day.dateStr}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
