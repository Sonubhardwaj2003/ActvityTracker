import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { getMonthGrid, getTodayDateKey } from '../../utils/dateUtils';

export const MonthlyCalendarView = ({ heatmapData }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const gridDays = getMonthGrid(year, month, 1); // 1 = Monday start
  const todayKey = getTodayDateKey();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getTileStyle = (rate, isCurrentMonth) => {
    if (!isCurrentMonth) {
      return 'opacity-30 bg-surface-50 dark:bg-surface-900 border-dashed';
    }
    if (rate >= 80) return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-100';
    if (rate >= 50) return 'bg-sky-500/15 border-sky-500/40 text-sky-950 dark:text-sky-100';
    if (rate > 0) return 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-100';
    return 'bg-white dark:bg-surface-850/60 border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300';
  };

  return (
    <Card className="p-5 flex flex-col">
      {/* Month Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
            <CalIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">
              {monthName}
            </h2>
            <p className="text-xs text-surface-400">
              Monthly activity consistency & completion intensity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 text-surface-700 dark:text-surface-300 transition-colors"
          >
            Current Month
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-surface-400">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {gridDays.map((item) => {
          const log = heatmapData?.[item.dateKey] || { rate: 0, completed: 0, total: 0 };
          const isTodayTile = item.dateKey === todayKey;

          return (
            <button
              key={item.dateKey}
              type="button"
              onClick={() => navigate(`/tracker?date=${item.dateKey}`)}
              className={`min-h-[72px] sm:min-h-[85px] p-2 rounded-xl border flex flex-col justify-between text-left transition-all hover:scale-[1.02] hover:shadow-sm cursor-pointer ${getTileStyle(
                log.rate,
                item.isCurrentMonth
              )} ${isTodayTile ? 'ring-2 ring-brand-500 font-bold' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-bold ${isTodayTile ? 'text-brand-500' : ''}`}>
                  {item.day}
                </span>
                {isTodayTile && (
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-brand-500 text-white font-extrabold">
                    Today
                  </span>
                )}
              </div>

              {item.isCurrentMonth && log.total > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-surface-500 dark:text-surface-400">
                    <span>{log.completed}/{log.total}</span>
                    <span className="font-bold">{log.rate}%</span>
                  </div>
                  <div className="w-full h-1 bg-surface-200 dark:bg-surface-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        log.rate >= 80 ? 'bg-emerald-500' : log.rate >= 50 ? 'bg-sky-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${log.rate}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-surface-400 opacity-60">
                  {item.isCurrentMonth ? 'No logs' : ''}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
};
