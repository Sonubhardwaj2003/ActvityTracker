import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../api/analyticsApi';
import { logApi } from '../api/logApi';
import { Header } from '../components/layout/Header';
import { ProgressRing } from '../components/dashboard/ProgressRing';
import { StatCard } from '../components/dashboard/StatCard';
import { InsightBanner } from '../components/dashboard/InsightBanner';
import { TrackerTable } from '../components/tracker/TrackerTable';
import { DailyLineChart } from '../components/analytics/DailyLineChart';
import { CategoryDonutChart } from '../components/analytics/CategoryDonutChart';
import { Card } from '../components/common/Card';
import { CardSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { getTodayDateKey, formatDisplayDate } from '../utils/dateUtils';
import {
  Flame,
  CheckCircle2,
  Clock,
  Code,
  Terminal,
  CalendarCheck,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [scheduledItems, setScheduledItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayKey = getTodayDateKey();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, logsRes] = await Promise.all([
        analyticsApi.getDashboard(todayKey),
        logApi.getLogsByDate(todayKey),
      ]);

      if (dashRes.success) setMetrics(dashRes.metrics);
      if (logsRes.success) setScheduledItems(logsRes.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [todayKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle single log inline update
  const handleUpdateLog = async (activityId, logData) => {
    // Optimistic UI update
    setScheduledItems((prev) =>
      prev.map((item) => {
        if (item.activity._id === activityId) {
          return {
            ...item,
            log: { ...item.log, ...logData, dateKey: todayKey },
          };
        }
        return item;
      })
    );

    try {
      await logApi.upsertLog({
        activityId,
        dateKey: todayKey,
        ...logData,
      });

      // Refresh dashboard KPI calculations in background
      const dashRes = await analyticsApi.getDashboard(todayKey);
      if (dashRes.success) {
        setMetrics(dashRes.metrics);
        if (dashRes.metrics.completionPercentage === 100) {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        }
      }
    } catch (err) {
      console.error(err);
      loadData(); // rollback on failure
    }
  };

  const handleBatchUpdate = async (logs) => {
    try {
      await logApi.batchUpsertLogs(logs);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const categoryChartData = Object.entries(metrics?.categoryBreakdown || {}).map(
    ([name, info]) => ({
      name,
      value: info.completed,
      total: info.total,
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title={`${getGreeting()}, ${user?.name || 'Sonu'} 👋`}
        subtitle={`${formatDisplayDate(todayKey)} — Daily Productivity Overview`}
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={5} />
        </div>
      ) : (
        <>
          {/* Top KPI Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Progress Card with Ring */}
            <Card className="p-4 sm:p-5 flex items-center justify-between" hoverEffect>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-surface-400">
                  Today's Progress
                </span>
                <div className="text-2xl font-extrabold text-surface-900 dark:text-white">
                  {metrics?.completedCount || 0} / {metrics?.totalScheduled || 0}
                </div>
                <span className="text-xs text-surface-500 flex items-center gap-1 font-medium">
                  {metrics?.pendingCount || 0} pending
                </span>
              </div>
              <div className="scale-75 sm:scale-90 -mr-2">
                <ProgressRing
                  percentage={metrics?.completionPercentage || 0}
                  size={95}
                  strokeWidth={9}
                  label=""
                />
              </div>
            </Card>

            {/* Current Streak */}
            <StatCard
              title="Active Streak"
              value={`${metrics?.currentStreak || 0} Days`}
              subtext={`Best Record: ${metrics?.longestStreak || 0} Days`}
              icon={Flame}
              color="amber"
            />

            {/* Productive Hours */}
            <StatCard
              title="Deep Work & Time"
              value={`${metrics?.totalProductiveHours || 0}h`}
              subtext="Focus & learning logged today"
              icon={Clock}
              color="purple"
            />

            {/* Coding Problems */}
            <StatCard
              title="Coding & Problems"
              value={`${metrics?.codingProblemsCount || 0}`}
              subtext="Algorithms & questions solved"
              icon={Code}
              color="brand"
            />
          </div>

          {/* Smart Rule-Based Insights */}
          {metrics?.insights && metrics.insights.length > 0 && (
            <InsightBanner insights={metrics.insights} />
          )}

          {/* Central Notion/Excel-Style Tracking Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                Today's Scheduled Activities
              </h2>
            </div>
            <TrackerTable
              items={scheduledItems}
              onUpdateLog={handleUpdateLog}
              onBatchUpdate={handleBatchUpdate}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <DailyLineChart
                data={metrics?.weeklyTrend || []}
                title="7-Day Consistency Trend"
              />
            </div>
            <div>
              <CategoryDonutChart
                data={categoryChartData}
                title="Category Breakdown"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
