import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { formatDisplayDate, shiftDateKey, formatDateKey } from '../../utils/dateUtils';

export const HeatmapGrid = ({ heatmapData, year, onSelectDate }) => {
  const navigate = useNavigate();

  // Generate 52-week array of dates for the year
  const { weeks, monthLabels } = useMemo(() => {
    const targetYear = parseInt(year) || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    // Align to Sunday/Monday
    const dayOfWeek = startDate.getDay();
    const startOffset = dayOfWeek === 0 ? 0 : -dayOfWeek;

    let current = new Date(targetYear, 0, 1 + startOffset);
    const weeksArr = [];
    const monthsArr = [];
    let currentMonth = -1;

    for (let w = 0; w < 53; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dKey = formatDateKey(current);
        const log = heatmapData?.[dKey] || { level: 0, completed: 0, total: 0, rate: 0 };

        if (d === 0) {
          const m = current.getMonth();
          if (m !== currentMonth && current.getFullYear() === targetYear) {
            monthsArr.push({
              weekIndex: w,
              label: current.toLocaleDateString('en-US', { month: 'short' }),
            });
            currentMonth = m;
          }
        }

        days.push({
          dateKey: dKey,
          isInYear: current.getFullYear() === targetYear,
          ...log,
        });

        current.setDate(current.getDate() + 1);
      }
      weeksArr.push(days);
    }

    return { weeks: weeksArr, monthLabels: monthsArr };
  }, [heatmapData, year]);

  const levelColors = [
    'bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700/50', // 0
    'bg-emerald-200 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800',  // 1: 1-25%
    'bg-emerald-300 dark:bg-emerald-800/80 border-emerald-400 dark:border-emerald-700',  // 2: 26-50%
    'bg-emerald-400 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-500',     // 3: 51-75%
    'bg-emerald-500 dark:bg-emerald-500 border-emerald-600 dark:border-emerald-400',     // 4: 76-100%
  ];

  const handleDayClick = (dKey) => {
    if (onSelectDate) {
      onSelectDate(dKey);
    } else {
      navigate(`/tracker?date=${dKey}`);
    }
  };

  return (
    <Card className="p-5 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
            Productivity Heatmap ({year})
          </h3>
          <p className="text-xs text-surface-400">
            GitHub-style activity consistency grid. Click any date to open tracking.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <span>Less</span>
          {levelColors.map((colorClass, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-xs border ${colorClass}`}
              title={`Level ${idx}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Matrix with horizontal scroll if needed */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {/* Month labels header */}
          <div className="flex text-[10px] text-surface-400 font-semibold mb-1 pl-6">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                style={{
                  position: 'relative',
                  left: `${m.weekIndex * 15}px`,
                  marginRight: '20px',
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Weekday indicators */}
            <div className="flex flex-col gap-1 pr-1 text-[9px] font-semibold text-surface-400 select-none justify-between h-[98px]">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => {
                    if (!day.isInYear) {
                      return <div key={day.dateKey} className="w-3 h-3 opacity-0" />;
                    }

                    const title = `${day.dateKey}: ${day.rate}% completed (${day.completed}/${day.total} activities)`;

                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        onClick={() => handleDayClick(day.dateKey)}
                        className={`w-3 h-3 rounded-xs border transition-transform hover:scale-125 hover:z-10 cursor-pointer ${
                          levelColors[day.level || 0]
                        }`}
                        title={title}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
