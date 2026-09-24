import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { Header } from '../components/layout/Header';
import { StatCard } from '../components/dashboard/StatCard';
import { DailyLineChart } from '../components/analytics/DailyLineChart';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import {
  formatDateKey,
  shiftDateKey,
  getTodayDateKey,
} from '../utils/dateUtils';
import {
  CalendarRange,
  CheckCircle2,
  Award,
  AlertTriangle,
  Clock,
  Code,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const WeeklyReviewPage = () => {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week
  const todayKey = getTodayDateKey();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState({
    wentWell: '',
    friction: '',
    nextWeekPlan: '',
  });

  const { success } = useToast();

  // Compute 7-day interval
  const endD = shiftDateKey(todayKey, weekOffset * 7);
  const startD = shiftDateKey(endD, -6);

  const loadWeeklyData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getRange(startD, endD);
      if (res.success) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startD, endD]);

  useEffect(() => {
    loadWeeklyData();
    // Load local stored weekly reflection
    const saved = localStorage.getItem(`dailytrack_weekly_ref_${startD}`);
    if (saved) {
      try {
        setReflection(JSON.parse(saved));
      } catch (e) {}
    } else {
      setReflection({ wentWell: '', friction: '', nextWeekPlan: '' });
    }
  }, [loadWeeklyData, startD]);

  const handleSaveWeeklyReflection = (e) => {
    e.preventDefault();
    localStorage.setItem(`dailytrack_weekly_ref_${startD}`, JSON.stringify(reflection));
    success('Weekly retrospective saved.');
  };

  return (
    <div className="space-y-6">
      <Header
        title="Weekly Retrospective & Review"
        subtitle="Automated weekly performance synthesis and deliberate habit adjustments"
      />

      {/* Week Navigator Stepper */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-brand-500" />
          <span className="text-sm font-bold text-surface-900 dark:text-surface-100">
            {weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : `Week (${startD} to ${endD})`}
          </span>
          <span className="text-xs text-surface-400">
            ({startD} → {endD})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 text-surface-700 dark:text-surface-300"
          >
            Current
          </button>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            disabled={weekOffset >= 0}
            className="p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 disabled:opacity-30"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <>
          {/* Automated Weekly Stats Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Weekly Completion"
              value={`${analytics?.completionPercentage || 0}%`}
              subtext={`${analytics?.completedCount || 0} / ${analytics?.totalScheduled || 0} activities completed`}
              icon={CheckCircle2}
              color="emerald"
            />

            <StatCard
              title="Total Deep Work Hours"
              value={`${analytics?.totalProductiveHours || 0}h`}
              subtext="Development & core focus time"
              icon={Clock}
              color="purple"
            />

            <StatCard
              title="Coding Problems"
              value={`${analytics?.totalCodingProblems || 0}`}
              subtext="Solved in algorithmic practice"
              icon={Code}
              color="brand"
            />

            <StatCard
              title="Best Activity"
              value={analytics?.mostConsistent?.name || '—'}
              subtext={`${analytics?.mostConsistent?.rate || 0}% completion`}
              icon={Award}
              color="amber"
            />
          </div>

          {/* 7-Day Chart */}
          <DailyLineChart
            data={analytics?.dailyBreakdown || []}
            title="Day-by-Day Consistency"
          />

          {/* Structured Weekly Retrospective Form */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-1">
              Weekly Reflection Journal
            </h3>
            <p className="text-xs text-surface-400 mb-4">
              Calibrate your routine for the upcoming week based on objective data
            </p>

            <form onSubmit={handleSaveWeeklyReflection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  ✨ What went well this week?
                </label>
                <textarea
                  rows={2}
                  value={reflection.wentWell}
                  onChange={(e) => setReflection((p) => ({ ...p, wentWell: e.target.value }))}
                  placeholder="Maintained morning routine consistently, made significant headway in full stack code..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-red-500 dark:text-red-400 mb-1">
                  ⚠️ What didn't go well / what friction was encountered?
                </label>
                <textarea
                  rows={2}
                  value={reflection.friction}
                  onChange={(e) => setReflection((p) => ({ ...p, friction: e.target.value }))}
                  placeholder="Skipped reading twice due to evening fatigue..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">
                  🎯 What will I deliberately improve next week?
                </label>
                <textarea
                  rows={2}
                  value={reflection.nextWeekPlan}
                  onChange={(e) => setReflection((p) => ({ ...p, nextWeekPlan: e.target.value }))}
                  placeholder="Shift reading to immediately before bedtime, prepare LeetCode problem set in advance..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Save Weekly Review
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
};
