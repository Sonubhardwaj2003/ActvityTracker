import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Plus, Trash2 } from 'lucide-react';

export const GoalModal = ({
  isOpen,
  onClose,
  onSubmit,
  activities = [],
  goal = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Career',
    deadline: '',
    relatedActivityIds: [],
    milestones: [],
  });

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
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Career',
        deadline: '',
        relatedActivityIds: [],
        milestones: [],
      });
    }
  }, [goal, isOpen]);

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
    onSubmit(formData);
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

        {/* Link Daily Habits */}
        <div>
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
            Link Supporting Activities:
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

        {/* Milestones list */}
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
