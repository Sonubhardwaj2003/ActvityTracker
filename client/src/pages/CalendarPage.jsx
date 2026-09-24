import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { activityApi } from '../api/activityApi';
import { logApi } from '../api/logApi';
import { Header } from '../components/layout/Header';
import { MonthlyCalendarView } from '../components/calendar/MonthlyCalendarView';
import { WeeklyGridView } from '../components/calendar/WeeklyGridView';
import { HeatmapGrid } from '../components/analytics/HeatmapGrid';
import { CardSkeleton } from '../components/common/Skeleton';
import { getWeekDates, getTodayDateKey } from '../utils/dateUtils';
import { Calendar, Grid, Flame } from 'lucide-react';

export const CalendarPage = () => {
  const [activeTab, setActiveTab] = useState('monthly'); // 'monthly' | 'weekly' | 'yearly'
  const [heatmapData, setHeatmapData] = useState({});
  const [activities, setActivities] = useState([]);
  const [weeklyLogsMap, setWeeklyLogsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const todayKey = getTodayDateKey();
  const currentYear = new Date().getFullYear();
  const currentWeekDates = getWeekDates(todayKey, 1);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [heatRes, actRes, logsRes] = await Promise.all([
        analyticsApi.getHeatmap(currentYear),
        activityApi.getActivities({ isArchived: false }),
        logApi.getLogsRange(currentWeekDates[0], currentWeekDates[6]),
      ]);

      if (heatRes.success) setHeatmapData(heatRes.heatmap?.data || {});
      if (actRes.success) setActivities(actRes.activities || []);

      if (logsRes.success && logsRes.logs) {
        const map = {};
        logsRes.logs.forEach((log) => {
          const actId = log.activityId?._id || log.activityId;
          map[`${actId}_${log.dateKey}`] = log;
        });
        setWeeklyLogsMap(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentWeekDates]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <Header
        title="Calendar Views"
        subtitle="Visual calendar layouts, weekly habit matrix, and annual intensity grid"
      />

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-surface-100 dark:bg-surface-850 max-w-md">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'monthly'
              ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
              : 'text-surface-500 hover:text-surface-800 dark:hover:text-surface-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Monthly View</span>
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'weekly'
              ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
              : 'text-surface-500 hover:text-surface-800 dark:hover:text-surface-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Weekly Grid</span>
        </button>

        <button
          onClick={() => setActiveTab('yearly')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'yearly'
              ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
              : 'text-surface-500 hover:text-surface-800 dark:hover:text-surface-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Yearly Heatmap</span>
        </button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <>
          {activeTab === 'monthly' && (
            <MonthlyCalendarView heatmapData={heatmapData} />
          )}

          {activeTab === 'weekly' && (
            <WeeklyGridView
              weekDates={currentWeekDates}
              activities={activities}
              logsByDateActivity={weeklyLogsMap}
            />
          )}

          {activeTab === 'yearly' && (
            <HeatmapGrid heatmapData={heatmapData} year={currentYear} />
          )}
        </>
      )}
    </div>
  );
};
