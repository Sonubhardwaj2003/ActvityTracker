import React from 'react';

export const ProgressRing = ({
  percentage = 0,
  size = 140,
  strokeWidth = 12,
  label = "Today's Progress",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  let strokeColor = '#3b82f6'; // brand-500
  if (percentage >= 80) strokeColor = '#10b981'; // emerald-500
  else if (percentage >= 50) strokeColor = '#0ea5e9'; // sky-500
  else if (percentage > 0) strokeColor = '#f59e0b'; // amber-500

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-surface-100 dark:text-surface-800"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Centered label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            {percentage}%
          </span>
          <span className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">
            Done
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-semibold text-surface-600 dark:text-surface-400 mt-2">
          {label}
        </span>
      )}
    </div>
  );
};
