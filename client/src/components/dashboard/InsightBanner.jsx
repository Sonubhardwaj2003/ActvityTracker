import React from 'react';
import { Flame, TrendingUp, Clock, Code, Sparkles } from 'lucide-react';

export const InsightBanner = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  const iconMap = {
    Flame,
    TrendingUp,
    Clock,
    Code,
    Sparkles,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {insights.map((insight) => {
        const Icon = iconMap[insight.icon] || Sparkles;
        return (
          <div
            key={insight.id}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-surface-50 to-white dark:from-surface-900 dark:to-surface-850 border border-surface-200/80 dark:border-surface-800/80 shadow-xs"
          >
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5 border border-brand-500/20">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-surface-900 dark:text-surface-100">
                {insight.title}
              </h4>
              <p className="text-xs text-surface-600 dark:text-surface-400 mt-0.5 leading-relaxed">
                {insight.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
