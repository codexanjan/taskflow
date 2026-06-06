import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

export default function CalendarView({ tasks, selectedDate, onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Get day of the week for the 1st of the month
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Create grid cells
  const cells = [];
  
  // Pad previous month days
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ day: null, date: null });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    cellDate.setHours(0, 0, 0, 0);
    cells.push({ day: d, date: cellDate });
  }

  // Group tasks by day (only include pending, non-deleted, non-archived tasks)
  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter((t) => {
      if (t.completed || t.isDeleted || t.isArchived || !t.dueDate) return false;
      const dDate = new Date(t.dueDate);
      return (
        dDate.getFullYear() === date.getFullYear() &&
        dDate.getMonth() === date.getMonth() &&
        dDate.getDate() === date.getDate()
      );
    });
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const handleDayClick = (date) => {
    if (!date) return;
    if (selectedDate && isSameDay(selectedDate, date)) {
      onSelectDate(null); // Clear filter if clicked again
    } else {
      onSelectDate(date);
    }
  };

  return (
    <div className="glass-card p-5 rounded-3xl border border-white/20 dark:border-slate-800/30 shadow-lg space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 dark:text-white text-base">
            {monthNames[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {selectedDate && (
            <button
              onClick={() => onSelectDate(null)}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl mr-2 transition-all cursor-pointer"
            >
              <span>Clear Filter</span>
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          const dayTasks = getTasksForDate(cell.date);
          const isSelected = selectedDate && isSameDay(selectedDate, cell.date);
          const isToday = isSameDay(new Date(), cell.date);

          return (
            <div key={index} className="aspect-square relative flex flex-col items-center justify-between p-1">
              {cell.day ? (
                <button
                  type="button"
                  onClick={() => handleDayClick(cell.date)}
                  className={`w-full h-full flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-105'
                      : isToday
                        ? 'border border-indigo-500/50 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span>{cell.day}</span>
                  
                  {/* Task Priority Indicator Dots */}
                  {dayTasks.length > 0 && !isSelected && (
                    <div className="flex gap-0.5 justify-center mt-1 absolute bottom-1.5 left-0 right-0">
                      {dayTasks.slice(0, 3).map((t, i) => {
                        let dotColor = 'bg-amber-500';
                        if (t.priority === 'High') dotColor = 'bg-rose-500';
                        if (t.priority === 'Low') dotColor = 'bg-emerald-500';
                        return (
                          <span
                            key={i}
                            className={`w-1 h-1 rounded-full ${dotColor} opacity-80`}
                          />
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <span className="w-1 h-1 rounded-full bg-slate-400 opacity-80" />
                      )}
                    </div>
                  )}
                </button>
              ) : (
                <div className="w-full h-full opacity-20" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
