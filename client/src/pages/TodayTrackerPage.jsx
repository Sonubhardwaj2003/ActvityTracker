import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { logApi } from '../api/logApi';
import { activityApi } from '../api/activityApi';
import { Header } from '../components/layout/Header';
import { DateNavigator } from '../components/tracker/DateNavigator';
import { TrackerTable } from '../components/tracker/TrackerTable';
import { DailyJournalCard } from '../components/reflections/DailyJournalCard';
import { ActivityModal } from '../components/activities/ActivityModal';
import { TableSkeleton } from '../components/common/Skeleton';
import { getTodayDateKey, shiftDateKey } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export const TodayTrackerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDate = searchParams.get('date');
  const [selectedDate, setSelectedDate] = useState(urlDate || getTodayDateKey());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const { success, error } = useToast();

  // Keep URL in sync with date
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSearchParams({ date: newDate });
  };

  // Keyboard navigation for dates (ArrowLeft, ArrowRight, 't' for today, 'n' for new activity)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowLeft') {
        handleDateChange(shiftDateKey(selectedDate, -1));
      } else if (e.key === 'ArrowRight') {
        handleDateChange(shiftDateKey(selectedDate, 1));
      } else if (e.key === 't' || e.key === 'T') {
        handleDateChange(getTodayDateKey());
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsActivityModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate]);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await logApi.getLogsByDate(selectedDate);
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (err) {
      error('Failed to load tracking logs.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Handle single log inline update
  const handleUpdateLog = async (activityId, logData) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.activity._id === activityId) {
          return {
            ...item,
            log: { ...item.log, ...logData, dateKey: selectedDate },
          };
        }
        return item;
      })
    );

    try {
      await logApi.upsertLog({
        activityId,
        dateKey: selectedDate,
        ...logData,
      });

      // Check if all are now completed for celebratory confetti
      const isAllDone = items.every((i) =>
        i.activity._id === activityId
          ? logData.status === 'completed'
          : i.log.status === 'completed'
      );
      if (isAllDone && items.length > 0) {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      error('Failed to save log entry.');
      loadLogs();
    }
  };

  const handleBatchUpdate = async (logs) => {
    try {
      await logApi.batchUpsertLogs(logs);
      success('All activities updated.');
      loadLogs();
    } catch (err) {
      error('Failed to sync batch updates.');
    }
  };

  const handleCreateActivity = async (payload) => {
    try {
      const res = await activityApi.createActivity(payload);
      if (res.success) {
        success('Activity defined successfully.');
        setIsActivityModalOpen(false);
        loadLogs();
      }
    } catch (err) {
      error(err.message || 'Failed to create activity.');
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Calendar-Based Activity Tracker"
        subtitle="Manage daily habits with Notion/Excel-style inline data entry"
      />

      {/* Date Navigation Bar */}
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Main Tracking Spreadsheet */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <TrackerTable
          items={items}
          onUpdateLog={handleUpdateLog}
          onBatchUpdate={handleBatchUpdate}
          onCreateActivityClick={() => setIsActivityModalOpen(true)}
        />
      )}

      {/* Daily Reflection Journal for this specific calendar date */}
      <DailyJournalCard dateKey={selectedDate} />

      {/* New Activity Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSubmit={handleCreateActivity}
      />
    </div>
  );
};
