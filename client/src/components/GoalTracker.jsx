import React, { useState, useEffect } from 'react';
import { goalsAPI } from '../utils/api';
import { Plus, Target, CheckCircle2, Circle, Trash2, Calendar, Award, ShieldAlert } from 'lucide-react';

export default function GoalTracker({ tasks, guestMode }) {
  const [goals, setGoals] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newCategory, setNewCategory] = useState('Work');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await goalsAPI.getAll(guestMode);
      setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
      setError(err.message || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [guestMode]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await goalsAPI.create({
        title: newTitle.trim(),
        description: newDesc.trim(),
        target_date: newTargetDate || null
      }, guestMode);
      setGoals(prev => [created, ...prev]);
      setNewTitle('');
      setNewDesc('');
      setNewTargetDate('');
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (goal) => {
    const nextStatus = goal.status === 'Completed' ? 'In Progress' : 'Completed';
    try {
      // Optimistic
      setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, status: nextStatus } : g));
      await goalsAPI.update(goal.id, { status: nextStatus }, guestMode);
    } catch (err) {
      console.error(err);
      fetchGoals();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await goalsAPI.delete(id, guestMode);
        setGoals(prev => prev.filter(g => g.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Calculate matching tasks progress (based on title keywords or categories)
  const getGoalProgress = (goal) => {
    if (goal.status === 'Completed') return 100;
    
    // Look for tasks that match goal title keywords
    const keywords = goal.title.toLowerCase().split(' ').filter(w => w.length > 3);
    if (keywords.length === 0) return 0;
    
    const matchingTasks = tasks.filter(t => 
      !t.isDeleted && !t.isArchived &&
      keywords.some(word => t.title.toLowerCase().includes(word) || t.description?.toLowerCase().includes(word))
    );
    
    if (matchingTasks.length === 0) return 0;
    
    const completed = matchingTasks.filter(t => t.completed).length;
    return Math.round((completed / matchingTasks.length) * 100);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-slate-800/30 shadow-xl space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-850/50">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
          <Target className="w-4.5 h-4.5 text-indigo-500" />
          <span>Long Term Goals</span>
        </h4>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          {isOpen ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {/* Add Goal Collapse Form */}
      {isOpen && (
        <form onSubmit={handleCreate} className="space-y-3 p-4 bg-slate-100/30 dark:bg-slate-900/10 rounded-2xl border border-slate-200/50 dark:border-slate-800/20">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Goal Title (e.g. Learn React)..."
            required
            className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-950/10 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Short description..."
            rows="2"
            className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-950/10 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Target Date</label>
              <input
                type="date"
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-950/10 text-xs text-slate-800 dark:text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="mt-5 px-4 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goals List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="glass-card p-4 rounded-2xl border border-white/45 dark:border-slate-800/10 space-y-3 animate-pulse">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-250/50 dark:bg-slate-800/30 mt-0.5"></div>
                <div className="space-y-2 flex-grow">
                  <div className="h-4 bg-slate-250/50 dark:bg-slate-800/30 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-250/50 dark:bg-slate-800/30 rounded w-2/3"></div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-3 bg-slate-250/50 dark:bg-slate-800/30 rounded w-1/4"></div>
                <div className="h-3 bg-slate-250/50 dark:bg-slate-800/30 rounded w-1/5"></div>
              </div>
              <div className="w-full h-1 bg-slate-250/35 dark:bg-slate-800/20 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-card p-6 rounded-2xl border border-rose-500/20 dark:border-rose-550/10 bg-rose-500/5 text-center space-y-3 flex flex-col items-center justify-center animate-fade-in">
          <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-rose-600 dark:text-rose-455">Failed to load goals</h5>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchGoals}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-md cursor-pointer transition-all hover:scale-105"
          >
            Retry Connection
          </button>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-8 text-slate-400 dark:text-slate-550 border border-dashed border-slate-200/30 dark:border-slate-800/20 rounded-2xl animate-fade-in">
          <p className="text-xs font-bold">No goals created yet. Set one above!</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal);
            const isCompleted = goal.status === 'Completed';

            return (
              <div key={goal.id} className="glass-card p-4 rounded-2xl border border-white/45 dark:border-slate-800/10 flex flex-col gap-3 relative overflow-hidden">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => handleToggleStatus(goal)}
                      className={`text-slate-400 hover:text-indigo-500 transition-colors mt-0.5 cursor-pointer`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="space-y-0.5">
                      <h5 className={`text-xs font-bold text-slate-700 dark:text-slate-250 leading-snug ${isCompleted ? 'line-through opacity-50' : ''}`}>
                        {goal.title}
                      </h5>
                      {goal.description && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-505 leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1 text-slate-350 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Date and Progress */}
                <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-450 dark:text-slate-500">
                  {goal.target_date ? (
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-800/10">
                      <Calendar className="w-3 h-3 text-indigo-500" />
                      {new Date(goal.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  ) : (
                    <span />
                  )}

                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-indigo-500" />
                    {progress}% Progress
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
