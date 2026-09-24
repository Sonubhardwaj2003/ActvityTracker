import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ICON_MAP } from '../../utils/formatters';
import { getTodayDateKey } from '../../utils/dateUtils';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#6366f1', // indigo
];

const PRESET_CATEGORIES = [
  'Coding',
  'Development',
  'Study',
  'Health',
  'Fitness',
  'Reading',
  'Career',
  'Personal',
  'Sleep',
  'Productivity',
];

export const ActivityModal = ({
  isOpen,
  onClose,
  onSubmit,
  activity = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Coding',
    type: 'numeric',
    targetValue: 3,
    targetUnit: 'questions',
    frequency: 'daily',
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    priority: 'medium',
    color: '#3b82f6',
    icon: 'Code',
    reminderTime: '09:00',
    startDate: getTodayDateKey(),
    endDate: '',
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name || '',
        description: activity.description || '',
        category: activity.category || 'General',
        type: activity.type || 'boolean',
        targetValue: activity.targetValue ?? 1,
        targetUnit: activity.targetUnit || '',
        frequency: activity.frequency || 'daily',
        activeDays: activity.activeDays || [0, 1, 2, 3, 4, 5, 6],
        priority: activity.priority || 'medium',
        color: activity.color || '#3b82f6',
        icon: activity.icon || 'CheckCircle',
        reminderTime: activity.reminderTime || '',
        startDate: activity.startDate || getTodayDateKey(),
        endDate: activity.endDate || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'Coding',
        type: 'numeric',
        targetValue: 3,
        targetUnit: 'questions',
        frequency: 'daily',
        activeDays: [0, 1, 2, 3, 4, 5, 6],
        priority: 'medium',
        color: '#3b82f6',
        icon: 'Code',
        reminderTime: '09:00',
        startDate: getTodayDateKey(),
        endDate: '',
      });
    }
  }, [activity, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayNum) => {
    setFormData((prev) => {
      const exists = prev.activeDays.includes(dayNum);
      const nextDays = exists
        ? prev.activeDays.filter((d) => d !== dayNum)
        : [...prev.activeDays, dayNum];
      return { ...prev, activeDays: nextDays.sort() };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      ...formData,
      targetValue:
        formData.type === 'boolean'
          ? true
          : formData.type === 'numeric' || formData.type === 'duration'
          ? parseFloat(formData.targetValue) || 1
          : formData.targetValue,
      endDate: formData.endDate ? formData.endDate : null,
      reminderTime: formData.reminderTime ? formData.reminderTime : null,
    };

    onSubmit(payload);
  };

  const daysLabels = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' },
    { num: 0, label: 'Sun' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Activity' : 'Define New Activity'}
      subtitle="Activities are created once and scheduled dynamically across calendar dates"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
            Activity Name *
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. DSA Practice, Software Development, Wake Up"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
            Description / Context
          </label>
          <input
            type="text"
            name="description"
            placeholder="e.g. Sliding window, dynamic programming, and tree problems"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Category & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
              Category
            </label>
            <input
              type="text"
              name="category"
              list="categories-list"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Coding"
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
            <datalist id="categories-list">
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
              Measurement Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="boolean">Boolean (Done / Undone)</option>
              <option value="numeric">Numeric (Questions, Pages, Count)</option>
              <option value="duration">Duration (Hours, Minutes)</option>
              <option value="time">Time (e.g. Before 7:00 AM)</option>
              <option value="rating">Rating (1 to 5 Stars)</option>
              <option value="text">Text Entry</option>
            </select>
          </div>
        </div>

        {/* Target Value & Unit */}
        {formData.type !== 'boolean' && formData.type !== 'text' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                Target Value
              </label>
              <input
                type={formData.type === 'numeric' || formData.type === 'duration' ? 'number' : 'text'}
                step={formData.type === 'duration' ? '0.1' : '1'}
                name="targetValue"
                value={formData.targetValue}
                onChange={handleChange}
                placeholder={formData.type === 'time' ? 'e.g. 07:00 AM' : '3'}
                className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                Unit / Label
              </label>
              <input
                type="text"
                name="targetUnit"
                value={formData.targetUnit}
                onChange={handleChange}
                placeholder="e.g. questions, hours, minutes, pages"
                className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>
        )}

        {/* Frequency & Active Days */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
            Frequency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { val: 'daily', label: 'Every Day' },
              { val: 'weekdays', label: 'Weekdays' },
              { val: 'weekends', label: 'Weekends' },
              { val: 'specific_days', label: 'Specific Days' },
            ].map((f) => (
              <button
                key={f.val}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, frequency: f.val }))}
                className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  formData.frequency === f.val
                    ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                    : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {formData.frequency === 'specific_days' && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {daysLabels.map((d) => {
                const active = formData.activeDays.includes(d.num);
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => handleDayToggle(d.num)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      active
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30'
                        : 'bg-surface-50 dark:bg-surface-800 text-surface-400 border-surface-200 dark:border-surface-700'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Priority & Reminder Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
              Daily Reminder (HH:MM)
            </label>
            <input
              type="time"
              name="reminderTime"
              value={formData.reminderTime}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
        </div>

        {/* Icon & Color Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Theme Color
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, color: c }))}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    formData.color === c ? 'scale-125 ring-2 ring-offset-2 ring-brand-500' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Icon
            </label>
            <select
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              {Object.keys(ICON_MAP).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
              Optional End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-800">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {activity ? 'Save Changes' : 'Create Activity'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
