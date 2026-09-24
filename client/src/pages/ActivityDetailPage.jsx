import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyticsApi } from '../api/analyticsApi';
import { Header } from '../components/layout/Header';
import { StatCard } from '../components/dashboard/StatCard';
import { Card } from '../components/common/Card';
import { CardSkeleton } from '../components/common/Skeleton';
import { getIconComponent, getCategoryBadgeStyle } from '../utils/formatters';
import {
  ArrowLeft,
  Flame,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { shiftDateKey, getTodayDateKey, formatDisplayDate } from '../utils/dateUtils';

export const ActivityDetailPage = () => {
  const { id } = useParams();
  const todayKey = getTodayDateKey();
  const [dateRange, setDateRange] = useState({
    start: shiftDateKey(todayKey, -24),
    end: todayKey,
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadActivityStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getActivityAnalytics(id, dateRange.start, dateRange.end);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, dateRange]);

  useEffect(() => {
    loadActivityStats();
  }, [loadActivityStats]);

  const activity = data?.activity;
  const stats = data?.stats;
  const dailyChart = data?.dailyChart || [];

  return (
    <div className="space-y-6">
      {/* Back button & Page Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/activities"
          className="p-2 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">
              {activity?.name || 'Activity Analytics'}
            </h1>
            {activity && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(
                  activity.category
                )}`}
              >
                {activity.category}
              </span>
            )}
          </div>
          <p className="text-xs text-surface-400 mt-0.5">
            Historical actuals vs target performance and consistency metrics
          </p>
        </div>
      </div>

      {/* Date Range Selector Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-500" />
          <span className="font-semibold text-surface-700 dark:text-surface-300">
            Analysis Period: {dateRange.start} → {dateRange.end}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
            className="px-2 py-1 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700"
          />
          <span className="text-surface-400">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
            className="px-2 py-1 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Completion Rate"
              value={`${stats?.completionRate || 0}%`}
              subtext={`${stats?.completedDays || 0} of ${stats?.scheduledDays || 0} scheduled days`}
              icon={CheckCircle}
              color="emerald"
            />
            <StatCard
              title="Active Streak"
              value={`${stats?.currentStreak || 0} Days`}
              subtext={`Longest: ${stats?.longestStreak || 0} Days`}
              icon={Flame}
              color="amber"
            />
            <StatCard
              title="Total Output vs Target"
              value={`${stats?.totalActual || 0} / ${stats?.totalTarget || 0}`}
              subtext={`Average: ${stats?.avgPerDay || 0} ${activity?.targetUnit}/day`}
              icon={TrendingUp}
              color="brand"
            />
            <StatCard
              title="Peak Performance Day"
              value={`${stats?.bestDay?.actual || 0} ${activity?.targetUnit || ''}`}
              subtext={`Recorded on: ${stats?.bestDay?.date || '-'}`}
              icon={Award}
              color="purple"
            />
          </div>

          {/* Daily Actual vs Target Bar Chart */}
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
                Daily Output: Actual vs Target
              </h3>
              <p className="text-xs text-surface-400">
                Comparison of daily achieved output against target threshold
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    stroke="#64748b"
                    opacity={0.4}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    stroke="#64748b"
                    opacity={0.4}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="glass-panel p-2.5 rounded-xl text-xs space-y-1 shadow-lg">
                            <p className="font-bold text-surface-900 dark:text-surface-100">
                              {item.dateKey}
                            </p>
                            <p className="text-surface-400">
                              Target: {item.target} {activity?.targetUnit}
                            </p>
                            <p className="text-emerald-500 font-semibold">
                              Actual: {item.actual} {activity?.targetUnit} ({item.status})
                            </p>
                            {item.remark && (
                              <p className="text-surface-400 italic">
                                Remark: "{item.remark}"
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="target" name="Target" fill="#64748b" opacity={0.5} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
