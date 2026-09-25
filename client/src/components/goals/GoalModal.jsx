import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Plus, Trash2, Zap, ListChecks } from 'lucide-react';

const emptyForm = {
  title: '',
  description: '',
  category: 'Career',
  deadline: '',
  relatedActivityIds: [],
  milestones: [],
  trackingMode: 'manual',
  targetValue: '',
  targetUnit: '',
};

export const GoalModal = ({
  isOpen,
  onClose,
  onSubmit,
  activities = [],
  goal = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState(emptyForm);

  const [newMilestoneText, setNewMilestoneText] = useState('');

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'Career',
        deadline: goal.deadline || '',
        relatedActivityIds: (goal.relatedActivityIds || []).map((a) => a._id || a),
        milestones: goal.milestones || [],
        trackingMode: goal.trackingMode === 'auto' ? 'auto' : 'manual',
        targetValue: goal.targetValue ?? '',
        targetUnit: goal.targetUnit || '',
      });
    } else {
      setFormData(emptyForm);
    }
  }, [goal, isOpen]);

  const isAuto = formData.trackingMode === 'auto';

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { title: newMilestoneText.trim(), completed: false }],
    }));
    setNewMilestoneText('');
  };

  const handleRemoveMilestone = (index) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const handleActivityToggle = (actId) => {
    setFormData((prev) => {
      const exists = prev.relatedActivityIds.includes(actId);
      const nextList = exists
        ? prev.relatedActivityIds.filter((id) => id !== actId)
        : [...prev.relatedActivityIds, actId];
      return { ...prev, relatedActivityIds: nextList };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (isAuto && (!formData.targetValue || Number(formData.targetValue) <= 0)) return;
    if (isAuto && formData.relatedActivityIds.length === 0) return;

    onSubmit({
      ...formData,
      targetValue: isAuto ? Number(formData.targetValue) : null,
      targetUnit: isAuto ? formData.targetUnit : '',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal ? 'Edit Goal' : 'Create Long-Term Goal'}
      subtitle="Connect daily habits with high-impact objectives"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
            Goal Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Become Interview-Ready & Crack Product Companies"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
            Description / Motivation
          </label>
          <textarea
            rows={2}
            placeholder="Complete 300 DSA problems and ship 2 high-impact fullstack applications..."
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              placeholder="e.g. Career, Health"
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
              Target Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
        </div>

        {/* Tracking Mode */}
        <div>
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
            How should progress update?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, trackingMode: 'auto' }))}
              className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${
                isAuto
                  ? 'bg-brand-500/10 border-brand-500 text-brand-700 dark:text-brand-300'
                  : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <span className="block text-xs font-semibold">Auto-track</span>
                <span className="block text-[10px] opacity-80 leading-tight mt-0.5">
                  From daily activity logs
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, trackingMode: 'manual' }))}
              className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${
                !isAuto
                  ? 'bg-brand-500/10 border-brand-500 text-brand-700 dark:text-brand-300'
                  : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300'
              }`}
            >
              <ListChecks className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <span className="block text-xs font-semibold">Manual / Milestones</span>
                <span className="block text-[10px] opacity-80 leading-tight mt-0.5">
                  Check off milestones yourself
                </span>
              </span>
            </button>
          </div>
        </div>

        {isAuto && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-brand-500/5 border border-brand-500/20">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                Target Value *
              </label>
              <input
                type="number"
                min="1"
                required={isAuto}
                placeholder="100"
                value={formData.targetValue}
                onChange={(e) => setFormData((p) => ({ ...p, targetValue: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                Unit
              </label>
              <input
                type="text"
                placeholder="questions"
                value={formData.targetUnit}
                onChange={(e) => setFormData((p) => ({ ...p, targetUnit: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <p className="col-span-2 text-[11px] text-surface-500 dark:text-surface-400 leading-relaxed">
              Every day's logged value for the activities you link below gets added up. Once the
              total reaches your target, this goal marks itself complete automatically.
            </p>
          </div>
        )}

        {/* Link Daily Habits */}
        <div>
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
            {isAuto ? 'Link Activities to Track *' : 'Link Supporting Activities:'}
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
            {activities.map((act) => {
              const selected = formData.relatedActivityIds.includes(act._id);
              return (
                <button
                  key={act._id}
                  type="button"
                  onClick={() => handleActivityToggle(act._id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                    selected
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-700'
                  }`}
                >
                  {act.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Milestones list — manual-tracking goals only; auto-tracked goals
            derive progress from daily logs instead. */}
        {!isAuto && (
        <div>
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
            Milestones
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. Master Sliding Window and Two Pointers"
              value={newMilestoneText}
              onChange={(e) => setNewMilestoneText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMilestone();
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Button size="sm" type="button" variant="secondary" onClick={handleAddMilestone}>
              Add
            </Button>
          </div>

          <div className="space-y-1 max-h-28 overflow-y-auto">
            {formData.milestones.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-50 dark:bg-surface-800 text-xs"
              >
                <span className="text-surface-800 dark:text-surface-200 truncate">{m.title}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(idx)}
                  className="text-surface-400 hover:text-red-500 p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-800">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {goal ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
