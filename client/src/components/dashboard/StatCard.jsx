import React from 'react';
import { Card } from '../common/Card';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'brand',
  trend = null,
}) => {
  const colorMap = {
    brand: 'text-brand-500 bg-brand-500/10 border-brand-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  const badgeClass = colorMap[color] || colorMap.brand;

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between" hoverEffect>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${badgeClass} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-1 flex items-center gap-1.5 font-medium">
            {subtext}
          </p>
        )}
      </div>
    </Card>
  );
};
