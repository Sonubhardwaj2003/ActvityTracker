import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${
        glass
          ? 'glass-panel'
          : 'bg-white dark:bg-surface-900 border border-surface-200/90 dark:border-surface-800/90 shadow-sm'
      } ${hoverEffect ? 'hover:shadow-md hover:border-surface-300 dark:hover:border-surface-700' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
