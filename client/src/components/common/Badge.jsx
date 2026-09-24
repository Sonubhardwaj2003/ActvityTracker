import React from 'react';
import { Check, Clock, X, FastForward, CircleDashed } from 'lucide-react';

export const StatusBadge = ({ status, size = 'sm', className = '', showIcon = true }) => {
  const configs = {
    completed: {
      label: 'Done',
      icon: Check,
      classes:
        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    partial: {
      label: 'Partial',
      icon: Clock,
      classes:
        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    missed: {
      label: 'Missed',
      icon: X,
      classes:
        'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    },
    skipped: {
      label: 'Skipped',
      icon: FastForward,
      classes:
        'bg-surface-500/10 text-surface-600 dark:text-surface-400 border-surface-500/20',
    },
    pending: {
      label: 'Pending',
      icon: CircleDashed,
      classes:
        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  const sizeClass = size === 'xs' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClass} ${config.classes} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};

export const PriorityBadge = ({ priority, size = 'xs', className = '' }) => {
  const configs = {
    high: {
      label: 'High',
      classes: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      dot: 'bg-red-500',
    },
    medium: {
      label: 'Med',
      classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500',
    },
    low: {
      label: 'Low',
      classes: 'bg-surface-500/10 text-surface-600 dark:text-surface-400 border-surface-500/20',
      dot: 'bg-surface-400',
    },
  };

  const config = configs[priority] || configs.medium;
  const sizeClass = size === 'xs' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClass} ${config.classes} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
