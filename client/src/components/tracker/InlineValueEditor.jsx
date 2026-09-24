import React from 'react';
import { Check, Star, Plus, Minus } from 'lucide-react';

export const InlineValueEditor = ({
  activity,
  value,
  status,
  onChange,
  onStatusChange,
  disabled = false,
}) => {
  const type = activity.type || 'boolean';

  // 1. BOOLEAN TYPE
  if (type === 'boolean') {
    const isDone = status === 'completed';
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          const next = !isDone;
          onChange(next);
          onStatusChange(next ? 'completed' : 'pending');
        }}
        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
          isDone
            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
            : 'border-2 border-surface-300 dark:border-surface-700 hover:border-brand-500 dark:hover:border-brand-400 text-transparent'
        }`}
        title={isDone ? 'Mark uncompleted' : 'Mark completed'}
      >
        <Check className={`w-4 h-4 stroke-[3] ${isDone ? 'block' : 'opacity-0'}`} />
      </button>
    );
  }

  // 2. NUMERIC TYPE
  if (type === 'numeric') {
    const numVal = parseFloat(value) || 0;
    const targetVal = parseFloat(activity.targetValue) || 1;

    const handleIncrement = (delta) => {
      const nextVal = Math.max(0, numVal + delta);
      onChange(nextVal);
      if (nextVal >= targetVal) onStatusChange('completed');
      else if (nextVal > 0) onStatusChange('partial');
      else onStatusChange('pending');
    };

    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={disabled || numVal <= 0}
          onClick={() => handleIncrement(-1)}
          className="w-6 h-6 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 flex items-center justify-center disabled:opacity-40"
        >
          <Minus className="w-3 h-3" />
        </button>

        <input
          type="number"
          min="0"
          value={value ?? ''}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value === '' ? 0 : parseFloat(e.target.value);
            onChange(v);
            if (v >= targetVal) onStatusChange('completed');
            else if (v > 0) onStatusChange('partial');
            else onStatusChange('pending');
          }}
          className="w-14 px-2 py-1 text-center font-mono text-xs font-semibold rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleIncrement(1)}
          className="w-6 h-6 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 flex items-center justify-center"
        >
          <Plus className="w-3 h-3" />
        </button>

        {activity.targetUnit && (
          <span className="text-[11px] text-surface-400 font-medium">
            {activity.targetUnit}
          </span>
        )}
      </div>
    );
  }

  // 3. DURATION TYPE
  if (type === 'duration') {
    const val = value ?? '';
    const targetVal = parseFloat(activity.targetValue) || 1;

    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          step="0.1"
          min="0"
          value={val}
          disabled={disabled}
          placeholder="0"
          onChange={(e) => {
            const v = e.target.value === '' ? 0 : parseFloat(e.target.value);
            onChange(v);
            if (v >= targetVal) onStatusChange('completed');
            else if (v > 0) onStatusChange('partial');
            else onStatusChange('pending');
          }}
          className="w-16 px-2 py-1 text-center font-mono text-xs font-semibold rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
        <span className="text-[11px] text-surface-400 font-medium">
          {activity.targetUnit || 'hrs'}
        </span>
      </div>
    );
  }

  // 4. TIME TYPE (e.g. 06:45 AM)
  if (type === 'time') {
    return (
      <input
        type="text"
        value={value || ''}
        disabled={disabled}
        placeholder="e.g. 06:45 AM"
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value.trim().length > 0) {
            onStatusChange('completed');
          }
        }}
        className="w-24 px-2 py-1 text-xs font-mono rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:ring-1 focus:ring-brand-500 focus:outline-none"
      />
    );
  }

  // 5. RATING TYPE (1 to 5)
  if (type === 'rating') {
    const rating = parseInt(value) || 0;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange(star);
              onStatusChange('completed');
            }}
            className="p-0.5 text-surface-300 dark:text-surface-700 hover:text-amber-400 transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-surface-300 dark:text-surface-700'
              }`}
            />
          </button>
        ))}
      </div>
    );
  }

  // 6. TEXT TYPE
  return (
    <input
      type="text"
      value={value || ''}
      disabled={disabled}
      placeholder="Entry..."
      onChange={(e) => {
        onChange(e.target.value);
        if (e.target.value.trim()) onStatusChange('completed');
      }}
      className="w-28 px-2 py-1 text-xs rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:ring-1 focus:ring-brand-500 focus:outline-none"
    />
  );
};
