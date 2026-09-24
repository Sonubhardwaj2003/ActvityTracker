import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrackerRow } from './TrackerRow';
import { Search, Filter, CheckCircle2, RotateCcw, Plus } from 'lucide-react';
import { Button } from '../common/Button';

export const TrackerTable = ({
  items,
  onUpdateLog,
  onBatchUpdate,
  onCreateActivityClick,
  disabled = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const searchInputRef = useRef(null);

  // Focus search when pressing '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set(['All']);
    items.forEach((item) => {
      if (item.activity?.category) set.add(item.activity.category);
    });
    return Array.from(set);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const act = item.activity;
      const log = item.log;

      // Search match
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = act.name.toLowerCase().includes(q);
        const matchesCat = act.category.toLowerCase().includes(q);
        const matchesRemark = (log.remark || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesRemark) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && act.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'completed' && log.status !== 'completed') return false;
        if (statusFilter === 'pending' && log.status !== 'pending') return false;
        if (statusFilter === 'partial' && log.status !== 'partial') return false;
        if (statusFilter === 'high_priority' && act.priority !== 'high') return false;
      }

      return true;
    });
  }, [items, search, selectedCategory, statusFilter]);

  // Quick statistics
  const total = items.length;
  const completedCount = items.filter((i) => i.log.status === 'completed').length;
  const partialCount = items.filter((i) => i.log.status === 'partial').length;
  const percentage = total > 0 ? Math.round(((completedCount + partialCount * 0.5) / total) * 100) : 0;

  // Bulk complete all
  const handleMarkAllDone = () => {
    const updates = items.map((i) => ({
      activityId: i.activity._id,
      dateKey: i.log.dateKey,
      status: 'completed',
      actualValue: i.activity.targetValue,
      remark: i.log.remark,
    }));
    onBatchUpdate(updates);
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative min-w-[200px] sm:min-w-[260px]">
          <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search activities or remarks... (/)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Quick status pills */}
          <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
            {['all', 'pending', 'completed', 'high_priority'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-xs'
                    : 'text-surface-500 hover:text-surface-800 dark:hover:text-surface-200'
                }`}
              >
                {st === 'all'
                  ? 'All'
                  : st === 'pending'
                  ? 'Pending'
                  : st === 'completed'
                  ? 'Done'
                  : 'High Priority'}
              </button>
            ))}
          </div>

          {/* Bulk Mark Done */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllDone}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            title="Mark all activities for this day as completed"
          >
            Mark All
          </Button>

          {onCreateActivityClick && (
            <Button
              size="sm"
              variant="primary"
              onClick={onCreateActivityClick}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Activity
            </Button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/60 dark:bg-surface-850/50 text-surface-500 dark:text-surface-400 text-[11px] uppercase font-bold tracking-wider">
              <th className="py-3 px-4">Activity & Category</th>
              <th className="py-3 px-4">Target</th>
              <th className="py-3 px-4">Actual Entry</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Daily Remark</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto text-surface-400">
                      <Filter className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                      No activities match the selected criteria
                    </p>
                    <p className="text-xs text-surface-400">
                      Adjust your search query or filters, or add a new activity.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <TrackerRow
                  key={item.activity._id}
                  item={item}
                  onUpdateLog={onUpdateLog}
                  disabled={disabled}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Summary Footer */}
      <div className="p-3.5 bg-surface-50 dark:bg-surface-850/50 border-t border-surface-200 dark:border-surface-800 flex flex-wrap items-center justify-between gap-3 text-xs text-surface-500 dark:text-surface-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-surface-800 dark:text-surface-200">
            {completedCount} of {total} activities completed
          </span>
          <span>({percentage}%)</span>
        </div>

        {/* Progress bar line */}
        <div className="w-48 h-2 rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
