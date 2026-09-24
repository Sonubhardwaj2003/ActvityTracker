import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
} from 'lucide-react';
import {
  formatDisplayDate,
  formatShortDate,
  shiftDateKey,
  getTodayDateKey,
  isToday,
} from '../../utils/dateUtils';
import { Button } from '../common/Button';

export const DateNavigator = ({ selectedDate, onDateChange }) => {
  const todayKey = getTodayDateKey();
  const isCurrentToday = isToday(selectedDate);

  const handlePrevDay = () => {
    onDateChange(shiftDateKey(selectedDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(shiftDateKey(selectedDate, 1));
  };

  const handleTodayJump = () => {
    onDateChange(todayKey);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
      {/* Date Stepper Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-xl text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          title="Previous day (←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleTodayJump}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isCurrentToday
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
          }`}
          title="Jump to today (T)"
        >
          Today
        </button>

        <button
          onClick={handleNextDay}
          className="p-2 rounded-xl text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          title="Next day (→)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="h-4 w-[1px] bg-surface-200 dark:bg-surface-800 mx-1 hidden sm:block" />

        {/* Selected date formatted text */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-brand-500 hidden sm:block" />
          <span className="text-sm sm:text-base font-bold text-surface-900 dark:text-surface-100">
            {formatDisplayDate(selectedDate)}
          </span>
          {isCurrentToday && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Active Date
            </span>
          )}
        </div>
      </div>

      {/* Date Picker Input Jump */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="date-picker-input"
          className="text-xs text-surface-500 dark:text-surface-400 hidden sm:inline"
        >
          Jump to:
        </label>
        <input
          id="date-picker-input"
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
          className="px-2.5 py-1.5 text-xs font-medium rounded-xl bg-surface-50 dark:bg-surface-800 text-surface-800 dark:text-surface-200 border border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer"
        />
      </div>
    </div>
  );
};
