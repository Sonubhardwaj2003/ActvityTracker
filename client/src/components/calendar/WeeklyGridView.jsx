import React from 'react';
import { Card } from '../common/Card';
import { getIconComponent } from '../../utils/formatters';
import { Check, X, Clock, CircleDashed } from 'lucide-react';
import { formatDayOfWeek, formatShortDate, isToday } from '../../utils/dateUtils';

export const WeeklyGridView = ({ weekDates, activities, logsByDateActivity }) => {
  const getCellStatus = (actId, dKey) => {
    return logsByDateActivity?.[`${actId}_${dKey}`]?.status || 'pending';
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        );
      case 'partial':
        return (
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
          </div>
        );
      case 'missed':
        return (
          <div className="w-6 h-6 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center border border-red-500/30">
            <X className="w-3.5 h-3.5" />
          </div>
        );
      case 'skipped':
        return (
          <div className="w-6 h-6 rounded-lg bg-surface-200 dark:bg-surface-800 text-surface-400 flex items-center justify-center">
            <span className="text-[10px] font-bold">—</span>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-lg border border-dashed border-surface-300 dark:border-surface-700 flex items-center justify-center opacity-40">
            <CircleDashed className="w-3 h-3 text-surface-400" />
          </div>
        );
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-surface-200 dark:border-surface-800">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
          Weekly Activity Grid
        </h3>
        <p className="text-xs text-surface-400">
          Cross-tabular view of activities across the 7 days of the week
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-850 text-xs font-semibold text-surface-600 dark:text-surface-400">
              <th className="py-3 px-4 min-w-[180px]">Activity</th>
              {weekDates.map((dKey) => (
                <th
                  key={dKey}
                  className={`py-3 px-3 text-center whitespace-nowrap min-w-[70px] ${
                    isToday(dKey) ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : ''
                  }`}
                >
                  <div>{formatDayOfWeek(dKey)}</div>
                  <div className="text-[10px] opacity-75">{formatShortDate(dKey)}</div>
                </th>
              ))}
              <th className="py-3 px-4 text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => {
              let doneInWeek = 0;
              weekDates.forEach((d) => {
                if (getCellStatus(act._id, d) === 'completed') doneInWeek++;
              });

              return (
                <tr
                  key={act._id}
                  className="border-b border-surface-200/60 dark:border-surface-800/60 hover:bg-surface-50/50 dark:hover:bg-surface-850/30 transition-colors"
                >
                  <td className="py-2.5 px-4 font-semibold text-xs text-surface-900 dark:text-surface-100">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${act.color || '#3b82f6'}15`,
                          color: act.color || '#3b82f6',
                        }}
                      >
                        {getIconComponent(act.icon, { className: 'w-3.5 h-3.5' })}
                      </div>
                      <span className="truncate">{act.name}</span>
                    </div>
                  </td>

                  {weekDates.map((dKey) => (
                    <td key={dKey} className="py-2.5 px-3 text-center">
                      <div className="flex justify-center">
                        {renderStatusIcon(getCellStatus(act._id, dKey))}
                      </div>
                    </td>
                  ))}

                  <td className="py-2.5 px-4 text-center font-bold text-xs text-brand-500">
                    {doneInWeek} / 7
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
