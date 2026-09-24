import React from 'react';
import { Link } from 'react-router-dom';
import { InlineValueEditor } from './InlineValueEditor';
import { StatusSelector } from './StatusSelector';
import { PriorityBadge } from '../common/Badge';
import { getIconComponent, getCategoryBadgeStyle } from '../../utils/formatters';
import { ExternalLink, MessageSquare } from 'lucide-react';

export const TrackerRow = ({
  item,
  onUpdateLog,
  disabled = false,
}) => {
  const { activity, log } = item;

  const handleStatusChange = (newStatus) => {
    onUpdateLog(activity._id, {
      status: newStatus,
      actualValue: log.actualValue,
      remark: log.remark,
    });
  };

  const handleValueChange = (newVal) => {
    onUpdateLog(activity._id, {
      status: log.status,
      actualValue: newVal,
      remark: log.remark,
    });
  };

  const handleRemarkChange = (e) => {
    onUpdateLog(activity._id, {
      status: log.status,
      actualValue: log.actualValue,
      remark: e.target.value,
    });
  };

  return (
    <tr className="border-b border-surface-200/80 dark:border-surface-800/80 hover:bg-surface-50/70 dark:hover:bg-surface-850/40 transition-colors group">
      {/* 1. Activity Name & Category */}
      <td className="py-3 px-4 min-w-[220px]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${activity.color || '#3b82f6'}15`,
              borderColor: `${activity.color || '#3b82f6'}30`,
              color: activity.color || '#3b82f6',
            }}
          >
            {getIconComponent(activity.icon, { className: 'w-4 h-4' })}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/activities/${activity._id}`}
                className="font-semibold text-sm text-surface-900 dark:text-surface-100 hover:text-brand-500 dark:hover:text-brand-400 transition-colors truncate"
              >
                {activity.name}
              </Link>
              <Link
                to={`/activities/${activity._id}`}
                className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-brand-500 transition-opacity"
                title="View Analytics"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(
                  activity.category
                )}`}
              >
                {activity.category}
              </span>
              <PriorityBadge priority={activity.priority} />
            </div>
          </div>
        </div>
      </td>

      {/* 2. Target */}
      <td className="py-3 px-4 text-xs font-medium text-surface-600 dark:text-surface-400 whitespace-nowrap">
        {activity.type === 'boolean' ? (
          <span className="text-surface-500">Complete</span>
        ) : (
          <span>
            {activity.targetValue} {activity.targetUnit}
          </span>
        )}
      </td>

      {/* 3. Actual Inline Input */}
      <td className="py-3 px-4 whitespace-nowrap">
        <InlineValueEditor
          activity={activity}
          value={log.actualValue}
          status={log.status}
          onChange={handleValueChange}
          onStatusChange={handleStatusChange}
          disabled={disabled}
        />
      </td>

      {/* 4. Status Selector */}
      <td className="py-3 px-4 whitespace-nowrap">
        <StatusSelector
          status={log.status}
          onChange={handleStatusChange}
          disabled={disabled}
        />
      </td>

      {/* 5. Remarks */}
      <td className="py-3 px-4 min-w-[200px]">
        <div className="relative flex items-center">
          <MessageSquare className="w-3.5 h-3.5 text-surface-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Add remark..."
            value={log.remark || ''}
            onChange={handleRemarkChange}
            disabled={disabled}
            className="w-full pl-8 pr-3 py-1 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-transparent hover:border-surface-200 dark:hover:border-surface-700 focus:border-brand-500/50 focus:bg-white dark:focus:bg-surface-900 focus:outline-none text-surface-800 dark:text-surface-200 transition-colors"
          />
        </div>
      </td>
    </tr>
  );
};
