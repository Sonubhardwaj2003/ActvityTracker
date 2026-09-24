import React from 'react';
import { Card } from '../common/Card';
import { Target, CheckCircle2, Clock, Calendar, CheckSquare, Square, Trash2, Edit } from 'lucide-react';
import { formatDisplayDate, formatShortDate } from '../../utils/dateUtils';
import { getIconComponent } from '../../utils/formatters';

export const GoalCard = ({ goal, onToggleMilestone, onEdit, onDelete }) => {
  const completedMilestones = (goal.milestones || []).filter((m) => m.completed).length;
  const totalMilestones = (goal.milestones || []).length;

  return (
    <Card className="p-5 flex flex-col justify-between" hoverEffect>
      <div>
        {/* Top header: Category, Deadline, Actions */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            {goal.category}
          </span>

          <div className="flex items-center gap-1.5">
            {goal.deadline && (
              <span className="text-xs text-surface-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Target: {formatShortDate(goal.deadline)}
              </span>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(goal)}
                className="p-1 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(goal._id)}
                className="p-1 rounded-lg text-surface-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Goal Title & Description */}
        <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">
            {goal.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-surface-600 dark:text-surface-300">Overall Progress</span>
            <span className="text-brand-500">{goal.currentProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${goal.currentProgress}%` }}
            />
          </div>
        </div>

        {/* Linked Daily Activities */}
        {goal.relatedActivityIds && goal.relatedActivityIds.length > 0 && (
          <div className="mt-4 pt-3 border-t border-surface-200/60 dark:border-surface-800/60">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider block mb-2">
              Driven by Daily Habits:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {goal.relatedActivityIds.map((act) => (
                <div
                  key={act._id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700/80 text-xs font-medium text-surface-700 dark:text-surface-300"
                >
                  {getIconComponent(act.icon, { className: 'w-3 h-3 text-brand-500' })}
                  <span>{act.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestones checklist */}
        {totalMilestones > 0 && (
          <div className="mt-4 pt-3 border-t border-surface-200/60 dark:border-surface-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-surface-400 font-medium">
              <span>Milestones ({completedMilestones}/{totalMilestones})</span>
            </div>
            <div className="space-y-1.5">
              {goal.milestones.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => onToggleMilestone && onToggleMilestone(goal, idx)}
                  className="flex items-center gap-2 text-xs text-surface-700 dark:text-surface-300 cursor-pointer hover:text-brand-500 transition-colors"
                >
                  {m.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-surface-400 shrink-0" />
                  )}
                  <span className={m.completed ? 'line-through opacity-60' : ''}>
                    {m.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
