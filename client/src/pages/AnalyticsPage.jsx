import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { Header } from '../components/layout/Header';
import { StatCard } from '../components/dashboard/StatCard';
import { DailyLineChart } from '../components/analytics/DailyLineChart';
import { TargetActualBarChart } from '../components/analytics/TargetActualBarChart';
import { CategoryDonutChart } from '../components/analytics/CategoryDonutChart';
import { Card } from '../components/common/Card';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  getDateRangePresets,
  getTodayDateKey,
  shiftDateKey,
  formatDisplayDate,
} from '../utils/dateUtils';
import {
  CheckCircle2,
  Clock,
  Code,
  TrendingUp,
  Award,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

export const AnalyticsPage = () => {
  const presets = getDateRangePresets();
  const [selectedPreset, setSelectedPreset] = useState('Last 30 Days');
  const [startDate, setStartDate] = useState(presets[4].start); // Last 30 Days
  const [endDate, setEndDate] = useState(presets[4].end);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRangeData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getRange(startDate, endDate);
      if (res.success) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadRangeData();
  }, [loadRangeData]);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.label);
    setStartDate(preset.start);
    setEndDate(preset.end);
  };

  const targetActualChartData = (analytics?.activityList || [])
    .filter((a) => a.totalTarget > 0)
    .map((a) => ({
      name: a.name,
      totalTarget: a.totalTarget,
      totalActual: a.totalActual,
      unit: a.targetUnit,
    }));

  return (
    <div className="space-y-6">
      <Header
        title="Productivity & Range Analytics"
        subtitle="Deep multi-interval insights, target achievements, and habit consistency"
      />

      {/* Preset Pills & Custom Date Selectors */}
      <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-3">
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                selectedPreset === p.label
                  ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                  : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Date inputs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-surface-100 dark:border-surface-800/80 text-xs">
          <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
            <Calendar className="w-4 h-4 text-brand-500" />
            <span>
              Analyzing {analytics?.daysCount || 0} calendar days ({startDate} to {endDate})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-surface-400">Custom Range:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setSelectedPreset('Custom');
                setStartDate(e.target.value);
              }}
              className="px-2 py-1 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700"
            />
            <span className="text-surface-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setSelectedPreset('Custom');
                setEndDate(e.target.value);
              }}
              className="px-2 py-1 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700"
            />
          </div>
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
          {/* Key Analytics Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Completion Percentage"
              value={`${analytics?.completionPercentage || 0}%`}
              subtext={`${analytics?.completedCount || 0} of ${analytics?.totalScheduled || 0} scheduled`}
              icon={CheckCircle2}
              color="emerald"
            />

            <StatCard
              title="Avg Daily Tasks Done"
              value={`${analytics?.avgDailyCompletion || 0}`}
              subtext="Activities marked done per day"
              icon={TrendingUp}
              color="brand"
            />

            <StatCard
              title="Total Deep Work Hours"
              value={`${analytics?.totalProductiveHours || 0}h`}
              subtext="Logged in duration tasks"
              icon={Clock}
              color="purple"
            />

            <StatCard
              title="Coding Problems Solved"
              value={`${analytics?.totalCodingProblems || 0}`}
              subtext="DSA & LeetCode cumulative count"
              icon={Code}
              color="amber"
            />
          </div>

          {/* Consistency Extremes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics?.mostConsistent && (
              <Card className="p-4 sm:p-5 flex items-center justify-between" hoverEffect>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                    <Award className="w-4 h-4" />
                    <span>Most Consistent Routine</span>
                  </div>
                  <h4 className="text-base font-bold text-surface-900 dark:text-surface-100">
                    {analytics.mostConsistent.name}
                  </h4>
                  <p className="text-xs text-surface-400">
                    {analytics.mostConsistent.completed} of {analytics.mostConsistent.total} scheduled days
                  </p>
                </div>
                <div className="text-2xl font-black text-emerald-500">
                  {analytics.mostConsistent.rate}%
                </div>
              </Card>
            )}

            {analytics?.leastConsistent && (
              <Card className="p-4 sm:p-5 flex items-center justify-between" hoverEffect>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Area Needing Focus</span>
                  </div>
                  <h4 className="text-base font-bold text-surface-900 dark:text-surface-100">
                    {analytics.leastConsistent.name}
                  </h4>
                  <p className="text-xs text-surface-400">
                    {analytics.leastConsistent.completed} of {analytics.leastConsistent.total} scheduled days
                  </p>
                </div>
                <div className="text-2xl font-black text-amber-500">
                  {analytics.leastConsistent.rate}%
                </div>
              </Card>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DailyLineChart
              data={analytics?.dailyBreakdown || []}
              title="Daily Completion Progress"
            />
            <TargetActualBarChart
              data={targetActualChartData}
              title="Cumulative Target vs Actual Output"
            />
          </div>
        </>
      )}
    </div>
  );
};
