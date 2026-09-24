import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { Header } from '../components/layout/Header';
import { StatCard } from '../components/dashboard/StatCard';
import { DailyLineChart } from '../components/analytics/DailyLineChart';
import { CategoryDonutChart } from '../components/analytics/CategoryDonutChart';
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
  Calendar,
  CheckCircle2,
  Clock,
  Code,
  Flame,
  TrendingUp,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const MonthlyReviewPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState(null);
  const [prevMonthData, setPrevMonthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState('');
  const { success } = useToast();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

  // Previous month dates
  const prevMonthDate = new Date(year, month - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevM = prevMonthDate.getMonth();
  const prevStart = `${prevYear}-${String(prevM + 1).padStart(2, '0')}-01`;
  const prevLastDay = new Date(prevYear, prevM + 1, 0).getDate();
  const prevEnd = `${prevYear}-${String(prevM + 1).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [curRes, prevRes] = await Promise.all([
        analyticsApi.getRange(startOfMonth, endOfMonth),
        analyticsApi.getRange(prevStart, prevEnd),
      ]);

      if (curRes.success) setMonthlyData(curRes.analytics);
      if (prevRes.success) setPrevMonthData(prevRes.analytics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startOfMonth, endOfMonth, prevStart, prevEnd]);

  useEffect(() => {
    loadData();
    const saved = localStorage.getItem(`dailytrack_monthly_ref_${startOfMonth}`);
    if (saved) setReflection(saved);
    else setReflection('');
  }, [loadData, startOfMonth]);

  const handleSaveReflection = (e) => {
    e.preventDefault();
    localStorage.setItem(`dailytrack_monthly_ref_${startOfMonth}`, reflection);
    success('Monthly reflection saved.');
  };

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Rate delta comparison with last month
  const currentRate = monthlyData?.completionPercentage || 0;
  const prevRate = prevMonthData?.completionPercentage || 0;
  const rateDelta = currentRate - prevRate;

  return (
    <div className="space-y-6">
      <Header
        title="Monthly Productivity Review"
        subtitle="Macro-level habit performance and month-over-month growth analytics"
      />

      {/* Month Stepper */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-500" />
          <span className="text-sm font-bold text-surface-900 dark:text-surface-100">
            {monthLabel}
          </span>
          <span className="text-xs text-surface-400">
            ({startOfMonth} → {endOfMonth})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 text-surface-700 dark:text-surface-300"
          >
            Current Month
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <>
          {/* Monthly Stats with Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Monthly Completion Rate"
              value={`${currentRate}%`}
              subtext={
                rateDelta >= 0
                  ? `+${rateDelta}% vs previous month`
                  : `${rateDelta}% vs previous month`
              }
              icon={CheckCircle2}
              color="emerald"
            />

            <StatCard
              title="Total Deep Work Hours"
              value={`${monthlyData?.totalProductiveHours || 0}h`}
              subtext={`Across ${monthlyData?.daysCount || 0} calendar days`}
              icon={Clock}
              color="purple"
            />

            <StatCard
              title="Algorithms / DSA Solved"
              value={`${monthlyData?.totalCodingProblems || 0}`}
              subtext="Problems solved this month"
              icon={Code}
              color="brand"
            />

            <StatCard
              title="Most Consistent"
              value={monthlyData?.mostConsistent?.name || '—'}
              subtext={`${monthlyData?.mostConsistent?.rate || 0}% completion`}
              icon={TrendingUp}
              color="amber"
            />
          </div>

          {/* Daily Trend Across the Month */}
          <DailyLineChart
            data={monthlyData?.dailyBreakdown || []}
            title={`${monthLabel} Daily Trajectory`}
          />

          {/* Activity Breakdown Table */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-surface-200 dark:border-surface-800">
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
                Activity Performance Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-50 dark:bg-surface-850 border-b border-surface-200 dark:border-surface-800 text-surface-500 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-4">Activity</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Completed / Scheduled</th>
                    <th className="py-2.5 px-4">Success Rate</th>
                    <th className="py-2.5 px-4">Total Output</th>
                  </tr>
                </thead>
                <tbody>
                  {(monthlyData?.activityList || []).map((act) => {
                    const rate = act.scheduledDays > 0 ? Math.round((act.completedDays / act.scheduledDays) * 100) : 0;
                    return (
                      <tr key={act.id} className="border-b border-surface-200/50 dark:border-surface-800/50">
                        <td className="py-2.5 px-4 font-bold text-surface-900 dark:text-surface-100">
                          {act.name}
                        </td>
                        <td className="py-2.5 px-4 text-surface-500">{act.category}</td>
                        <td className="py-2.5 px-4">
                          {act.completedDays} / {act.scheduledDays} days
                        </td>
                        <td className="py-2.5 px-4 font-bold text-brand-500">{rate}%</td>
                        <td className="py-2.5 px-4">
                          {act.totalActual} {act.targetUnit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Monthly Reflection */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-1">
              Monthly Strategic Reflection
            </h3>
            <p className="text-xs text-surface-400 mb-3">
              Synthesize your macro achievements and set big-picture trajectory for next month.
            </p>
            <form onSubmit={handleSaveReflection} className="space-y-3">
              <textarea
                rows={3}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What major patterns emerged this month? What routine improvements had the highest leverage?..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <div className="flex justify-end">
                <Button size="sm" variant="primary" type="submit" leftIcon={<Check className="w-3.5 h-3.5" />}>
                  Save Monthly Reflection
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
};
