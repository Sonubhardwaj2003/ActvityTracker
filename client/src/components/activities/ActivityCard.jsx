import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { PriorityBadge } from '../common/Badge';
import { getIconComponent, getCategoryBadgeStyle } from '../../utils/formatters';
import {
  MoreVertical,
  Edit2,
  Copy,
  Archive,
  Trash2,
  BarChart2,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';

export const ActivityCard = ({
  activity,
  onEdit,
  onDuplicate,
  onArchive,
  onToggleActive,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between relative group" hoverEffect>
      <div>
        {/* Top row: Icon, Category & Actions menu */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs"
              style={{
                backgroundColor: `${activity.color || '#3b82f6'}15`,
                borderColor: `${activity.color || '#3b82f6'}30`,
                color: activity.color || '#3b82f6',
              }}
            >
              {getIconComponent(activity.icon, { className: 'w-5 h-5' })}
            </div>
            <div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(
                  activity.category
                )}`}
              >
                {activity.category}
              </span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-30 w-44 glass-dropdown rounded-xl border border-surface-200 dark:border-surface-800 shadow-xl py-1 text-xs"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(activity);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Definition</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate(activity._id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleActive(activity);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                >
                  {activity.isActive ? (
                    <>
                      <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pause Activity</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Resume Activity</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onArchive(activity._id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{activity.isArchived ? 'Unarchive' : 'Archive'}</span>
                </button>

                <div className="border-t border-surface-200 dark:border-surface-800 my-1" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(activity, true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Permanent Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Name and Description */}
        <Link
          to={`/activities/${activity._id}`}
          className="text-base font-bold text-surface-900 dark:text-surface-100 hover:text-brand-500 dark:hover:text-brand-400 transition-colors block"
        >
          {activity.name}
        </Link>
        {activity.description && (
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">
            {activity.description}
          </p>
        )}
      </div>

      {/* Target & Meta Footer */}
      <div className="mt-4 pt-3 border-t border-surface-200/70 dark:border-surface-800/70 flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
        <div>
          <span className="font-semibold text-surface-800 dark:text-surface-200">
            {activity.type === 'boolean'
              ? 'Daily Check'
              : `${activity.targetValue} ${activity.targetUnit}`}
          </span>
          <span className="block text-[11px] text-surface-400 capitalize">
            {activity.frequency.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={activity.priority} />
          <Link
            to={`/activities/${activity._id}`}
            className="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-brand-500/10 hover:text-brand-500 text-surface-600 dark:text-surface-300 transition-colors"
            title="View Analytics"
          >
            <BarChart2 className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
