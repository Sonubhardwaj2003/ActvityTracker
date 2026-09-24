import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  Clock,
  X,
  FastForward,
  CircleDashed,
  ChevronDown,
} from 'lucide-react';

export const StatusSelector = ({ status, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const options = [
    {
      value: 'completed',
      label: 'Done',
      icon: Check,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      value: 'partial',
      label: 'Partial',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      value: 'pending',
      label: 'Pending',
      icon: CircleDashed,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    {
      value: 'missed',
      label: 'Missed',
      icon: X,
      color: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30',
    },
    {
      value: 'skipped',
      label: 'Skipped',
      icon: FastForward,
      color: 'text-surface-500 dark:text-surface-400 bg-surface-500/10 border-surface-500/30',
    },
  ];

  const currentOption = options.find((o) => o.value === status) || options[2];
  const Icon = currentOption.icon;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${currentOption.color} hover:brightness-105 active:scale-95 disabled:opacity-50`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{currentOption.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-36 glass-dropdown rounded-xl border border-surface-200 dark:border-surface-800 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => {
            const OptIcon = opt.icon;
            const isSelected = opt.value === status;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-brand-500/10 font-bold text-brand-600 dark:text-brand-400'
                    : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
              >
                <OptIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
