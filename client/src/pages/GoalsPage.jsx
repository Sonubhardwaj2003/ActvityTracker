import React, { useState, useEffect, useCallback } from 'react';
import { goalApi } from '../api/goalApi';
import { activityApi } from '../api/activityApi';
import { Header } from '../components/layout/Header';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { Button } from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { Target, Plus } from 'lucide-react';

export const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const { success, error } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [goalsRes, actRes] = await Promise.all([
        goalApi.getGoals(),
        activityApi.getActivities({ isArchived: false }),
      ]);
      if (goalsRes.success) setGoals(goalsRes.goals || []);
      if (actRes.success) setActivities(actRes.activities || []);
    } catch (err) {
      error('Failed to load goals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingGoal) {
        const res = await goalApi.updateGoal(editingGoal._id, formData);
        if (res.success) {
          success('Goal updated.');
          setIsModalOpen(false);
          setEditingGoal(null);
          loadData();
        }
      } else {
        const res = await goalApi.createGoal(formData);
        if (res.success) {
          success('Goal created.');
          setIsModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      error(err.message || 'Operation failed.');
    }
  };

  const handleToggleMilestone = async (goal, milestoneIndex) => {
    const nextMilestones = [...goal.milestones];
    nextMilestones[milestoneIndex].completed = !nextMilestones[milestoneIndex].completed;

    try {
      const res = await goalApi.updateGoal(goal._id, {
        milestones: nextMilestones,
      });
      if (res.success) {
        loadData();
      }
    } catch (err) {
      error('Failed to update milestone.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      const res = await goalApi.deleteGoal(id);
      if (res.success) {
        success('Goal deleted.');
        loadData();
      }
    } catch (err) {
      error('Failed to delete goal.');
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Long-Term Goals & Milestones"
        subtitle="Connect daily habits to career, health, and personal milestones"
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Goal
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : goals.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800">
          <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto text-surface-400">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-surface-800 dark:text-surface-200">
            No goals defined yet
          </h3>
          <p className="text-xs text-surface-400 max-w-sm mx-auto">
            Create long-term objectives and connect your daily habits to track progress towards meaningful milestones.
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Set New Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onToggleMilestone={handleToggleMilestone}
              onEdit={(g) => {
                setEditingGoal(g);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={handleCreateOrUpdate}
        activities={activities}
        goal={editingGoal}
      />
    </div>
  );
};
