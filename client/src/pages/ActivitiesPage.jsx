import React, { useState, useEffect, useCallback } from 'react';
import { activityApi } from '../api/activityApi';
import { Header } from '../components/layout/Header';
import { ActivityCard } from '../components/activities/ActivityCard';
import { ActivityModal } from '../components/activities/ActivityModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Button } from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Filter, Archive, CheckCircle } from 'lucide-react';

export const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showArchived, setShowArchived] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingActivity, setDeletingActivity] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await activityApi.getActivities({
        isArchived: showArchived,
      });
      if (res.success) {
        setActivities(res.activities || []);
      }
    } catch (err) {
      error(err.message || 'Failed to load activities.');
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingActivity) {
        const res = await activityApi.updateActivity(editingActivity._id, formData);
        if (res.success) {
          success('Activity updated.');
          setIsModalOpen(false);
          setEditingActivity(null);
          loadActivities();
        }
      } else {
        const res = await activityApi.createActivity(formData);
        if (res.success) {
          success('Activity created.');
          setIsModalOpen(false);
          loadActivities();
        }
      }
    } catch (err) {
      error(err.message || 'Operation failed.');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await activityApi.duplicateActivity(id);
      if (res.success) {
        success('Activity duplicated.');
        loadActivities();
      }
    } catch (err) {
      error(err.message || 'Duplicate failed.');
    }
  };

  const handleArchive = async (id) => {
    try {
      const res = await activityApi.archiveActivity(id);
      if (res.success) {
        success(res.message);
        loadActivities();
      }
    } catch (err) {
      error(err.message || 'Failed to toggle archive.');
    }
  };

  const handleToggleActive = async (activity) => {
    try {
      const res = await activityApi.updateActivity(activity._id, {
        isActive: !activity.isActive,
      });
      if (res.success) {
        success(activity.isActive ? 'Activity paused.' : 'Activity resumed.');
        loadActivities();
      }
    } catch (err) {
      error('Failed to update status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingActivity) return;
    try {
      setIsDeleting(true);
      const res = await activityApi.deleteActivity(deletingActivity._id, true);
      if (res.success) {
        success(res.message);
        setDeletingActivity(null);
        loadActivities();
      }
    } catch (err) {
      error(err.message || 'Failed to delete activity.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Distinct categories
  const categories = ['All', ...new Set(activities.map((a) => a.category).filter(Boolean))];

  const filteredActivities = activities.filter((act) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = act.name.toLowerCase().includes(q) || act.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedCategory !== 'All' && act.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Header
        title="Activity Management"
        subtitle="Define, organize, configure targets, and control habit lifecycles"
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setEditingActivity(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Activity
          </Button>
        }
      />

      {/* Toolbar & Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Archived Toggle */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              showArchived
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Viewing Archived' : 'Active Only'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Activity Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800">
          <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto text-surface-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-surface-800 dark:text-surface-200">
            No activities found
          </h3>
          <p className="text-xs text-surface-400 max-w-sm mx-auto">
            {showArchived
              ? 'No archived activities present.'
              : 'Create your first recurring activity to begin tracking.'}
          </p>
          {!showArchived && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setEditingActivity(null);
                setIsModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Activity
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              onEdit={(act) => {
                setEditingActivity(act);
                setIsModalOpen(true);
              }}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onToggleActive={handleToggleActive}
              onDelete={(act) => setDeletingActivity(act)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
        }}
        onSubmit={handleCreateOrUpdate}
        activity={editingActivity}
      />

      {/* Confirm Permanent Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingActivity}
        onClose={() => setDeletingActivity(null)}
        onConfirm={handleConfirmDelete}
        title={`Permanently delete "${deletingActivity?.name}"?`}
        message="This action will delete the activity definition AND all historical calendar tracking records permanently. If you simply want to hide it, choose Archive instead."
        confirmText="Delete Permanently"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
