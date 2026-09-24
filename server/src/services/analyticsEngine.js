import { DailyLog } from '../models/DailyLog.js';
import { Activity } from '../models/Activity.js';
import { getScheduledActivitiesForDate, isActivityScheduledForDate } from './scheduleResolver.js';
import { calculateOverallStreak, calculateActivityStreak, formatDateKey, shiftDateKey } from './streakEngine.js';

/**
 * Calculates dashboard metrics for today
 */
export const getDashboardMetrics = async (userId, customDateKey = null) => {
  const targetDate = customDateKey || formatDateKey(new Date());

  // 1. Get today's scheduled activities with merged logs
  const scheduledItems = await getScheduledActivitiesForDate(userId, targetDate);

  const totalScheduled = scheduledItems.length;
  let completedCount = 0;
  let partialCount = 0;
  let missedCount = 0;
  let skippedCount = 0;
  let pendingCount = 0;

  let totalProductiveMinutes = 0;
  let codingProblemsCount = 0;

  const categoryBreakdown = {};

  scheduledItems.forEach(({ activity, log }) => {
    const cat = activity.category || 'General';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { total: 0, completed: 0 };
    }
    categoryBreakdown[cat].total += 1;

    if (log.status === 'completed') {
      completedCount += 1;
      categoryBreakdown[cat].completed += 1;
    } else if (log.status === 'partial') {
      partialCount += 1;
    } else if (log.status === 'missed') {
      missedCount += 1;
    } else if (log.status === 'skipped') {
      skippedCount += 1;
    } else {
      pendingCount += 1;
    }

    // Measure values
    if (activity.type === 'duration') {
      const val = parseFloat(log.actualValue) || 0;
      // If unit is hours, convert to minutes; if already minutes, keep
      const inMinutes = (activity.targetUnit && activity.targetUnit.toLowerCase().includes('hour'))
        ? val * 60
        : val;
      totalProductiveMinutes += inMinutes;
    } else if (activity.type === 'numeric' && (cat.toLowerCase().includes('code') || activity.name.toLowerCase().includes('dsa') || activity.name.toLowerCase().includes('leetcode'))) {
      codingProblemsCount += parseFloat(log.actualValue) || 0;
    }
  });

  const completionPercentage = totalScheduled > 0
    ? Math.round(((completedCount + partialCount * 0.5) / totalScheduled) * 100)
    : 0;

  // 2. Streaks
  const streakData = await calculateOverallStreak(userId);

  // 3. Weekly consistency (last 7 days trend)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const dKey = shiftDateKey(targetDate, -i);
    const dayScheduled = await getScheduledActivitiesForDate(userId, dKey);
    const dayTotal = dayScheduled.length;
    const dayDone = dayScheduled.filter(
      (s) => s.log.status === 'completed' || s.log.status === 'partial'
    ).length;
    const dayRate = dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0;
    last7Days.push({
      dateKey: dKey,
      day: new Date(dKey).toLocaleDateString('en-US', { weekday: 'short' }),
      completed: dayDone,
      total: dayTotal,
      percentage: dayRate,
    });
  }

  // 4. Rule-Based Smart Insights
  const insights = [];

  if (streakData.currentStreak >= 3) {
    insights.push({
      id: 'streak-fire',
      type: 'success',
      icon: 'Flame',
      title: `${streakData.currentStreak} Day Streak!`,
      message: `You have maintained active consistency for ${streakData.currentStreak} consecutive days. Keep the momentum going!`,
    });
  }

  if (completionPercentage >= 80) {
    insights.push({
      id: 'high-productivity',
      type: 'achievement',
      icon: 'TrendingUp',
      title: 'High Productivity Day',
      message: `You've achieved ${completionPercentage}% of your targets for today. Outstanding focus!`,
    });
  } else if (pendingCount > 0 && targetDate === formatDateKey(new Date())) {
    insights.push({
      id: 'pending-reminder',
      type: 'info',
      icon: 'Clock',
      title: `${pendingCount} Activities Remaining`,
      message: `You have ${pendingCount} pending activities to complete today. Take small steps!`,
    });
  }

  // Check coding / dev specific insight
  if (codingProblemsCount > 0) {
    insights.push({
      id: 'coding-progress',
      type: 'success',
      icon: 'Code',
      title: 'Coding Momentum',
      message: `Solved ${codingProblemsCount} problem(s) today. Consistency in problem solving compounds quickly.`,
    });
  }

  return {
    dateKey: targetDate,
    completionPercentage,
    totalScheduled,
    completedCount,
    partialCount,
    missedCount,
    skippedCount,
    pendingCount,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    totalProductiveHours: (totalProductiveMinutes / 60).toFixed(1),
    codingProblemsCount,
    categoryBreakdown,
    weeklyTrend: last7Days,
    insights,
  };
};

/**
 * Calculates analytics for any custom date range (e.g. 7d, 30d, custom)
 */
export const getDateRangeAnalytics = async (userId, startDate, endDate) => {
  const allActivities = await Activity.find({
    userId,
    isArchived: false,
    startDate: { $lte: endDate },
    $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: startDate } }],
  });

  const logs = await DailyLog.find({
    userId,
    dateKey: { $gte: startDate, $lte: endDate },
  }).populate('activityId');

  const logMap = new Map();
  logs.forEach((log) => {
    const key = `${log.activityId ? log.activityId._id.toString() : log.activityId}_${log.dateKey}`;
    logMap.set(key, log);
  });

  // Iterate each day in range
  let currentDate = startDate;
  const dailyBreakdown = [];
  const activityStats = new Map();

  allActivities.forEach((act) => {
    activityStats.set(act._id.toString(), {
      id: act._id,
      name: act.name,
      category: act.category,
      type: act.type,
      targetUnit: act.targetUnit,
      scheduledDays: 0,
      completedDays: 0,
      totalActual: 0,
      totalTarget: 0,
    });
  });

  let totalScheduledAll = 0;
  let totalCompletedAll = 0;
  let totalPartialAll = 0;
  let totalMissedAll = 0;
  let totalProductiveMinutes = 0;
  let totalCodingProblems = 0;

  while (currentDate <= endDate) {
    let dayScheduledCount = 0;
    let dayCompletedCount = 0;
    let dayPartialCount = 0;

    for (const activity of allActivities) {
      if (isActivityScheduledForDate(activity, currentDate)) {
        dayScheduledCount += 1;
        totalScheduledAll += 1;

        const stat = activityStats.get(activity._id.toString());
        if (stat) {
          stat.scheduledDays += 1;
          const targetNum = parseFloat(activity.targetValue) || 1;
          stat.totalTarget += targetNum;
        }

        const log = logMap.get(`${activity._id.toString()}_${currentDate}`);
        if (log) {
          const val = parseFloat(log.actualValue) || 0;
          if (stat) stat.totalActual += val;

          if (log.status === 'completed') {
            dayCompletedCount += 1;
            totalCompletedAll += 1;
            if (stat) stat.completedDays += 1;
          } else if (log.status === 'partial') {
            dayPartialCount += 1;
            totalPartialAll += 1;
          } else if (log.status === 'missed') {
            totalMissedAll += 1;
          }

          if (activity.type === 'duration') {
            const inMins = (activity.targetUnit && activity.targetUnit.toLowerCase().includes('hour'))
              ? val * 60
              : val;
            totalProductiveMinutes += inMins;
          } else if (activity.type === 'numeric' && (activity.category.toLowerCase().includes('code') || activity.name.toLowerCase().includes('dsa') || activity.name.toLowerCase().includes('leetcode'))) {
            totalCodingProblems += val;
          }
        }
      }
    }

    const dayRate = dayScheduledCount > 0
      ? Math.round(((dayCompletedCount + dayPartialCount * 0.5) / dayScheduledCount) * 100)
      : 0;

    dailyBreakdown.push({
      dateKey: currentDate,
      scheduled: dayScheduledCount,
      completed: dayCompletedCount,
      partial: dayPartialCount,
      completionRate: dayRate,
    });

    currentDate = shiftDateKey(currentDate, 1);
  }

  // Find most & least consistent activities
  const activityList = Array.from(activityStats.values()).filter((a) => a.scheduledDays > 0);
  activityList.sort((a, b) => {
    const rateA = a.scheduledDays > 0 ? a.completedDays / a.scheduledDays : 0;
    const rateB = b.scheduledDays > 0 ? b.completedDays / b.scheduledDays : 0;
    return rateB - rateA;
  });

  const mostConsistent = activityList[0] || null;
  const leastConsistent = activityList.length > 1 ? activityList[activityList.length - 1] : null;

  const overallRate = totalScheduledAll > 0
    ? Math.round(((totalCompletedAll + totalPartialAll * 0.5) / totalScheduledAll) * 100)
    : 0;

  const daysCount = dailyBreakdown.length || 1;
  const avgDailyCompletion = (totalCompletedAll / daysCount).toFixed(1);

  return {
    startDate,
    endDate,
    daysCount,
    totalScheduled: totalScheduledAll,
    completedCount: totalCompletedAll,
    partialCount: totalPartialAll,
    missedCount: totalMissedAll,
    completionPercentage: overallRate,
    avgDailyCompletion,
    totalProductiveHours: (totalProductiveMinutes / 60).toFixed(1),
    totalCodingProblems,
    mostConsistent: mostConsistent
      ? {
          name: mostConsistent.name,
          rate: Math.round((mostConsistent.completedDays / mostConsistent.scheduledDays) * 100),
          completed: mostConsistent.completedDays,
          total: mostConsistent.scheduledDays,
        }
      : null,
    leastConsistent: leastConsistent
      ? {
          name: leastConsistent.name,
          rate: Math.round((leastConsistent.completedDays / leastConsistent.scheduledDays) * 100),
          completed: leastConsistent.completedDays,
          total: leastConsistent.scheduledDays,
        }
      : null,
    dailyBreakdown,
    activityList,
  };
};

/**
 * Generates GitHub-style heatmap data for a given year (or last 365 days)
 */
export const getHeatmapData = async (userId, year) => {
  const targetYear = parseInt(year) || new Date().getFullYear();
  const startOfYear = `${targetYear}-01-01`;
  const endOfYear = `${targetYear}-12-31`;

  // Aggregate logs by dateKey
  const logsAgg = await DailyLog.aggregate([
    {
      $match: {
        userId,
        dateKey: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: '$dateKey',
        totalLogs: { $sum: 1 },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        partialCount: {
          $sum: { $cond: [{ $eq: ['$status', 'partial'] }, 1, 0] },
        },
      },
    },
  ]);

  const map = new Map();
  logsAgg.forEach((item) => {
    const score = item.completedCount + item.partialCount * 0.5;
    const rate = item.totalLogs > 0 ? (score / item.totalLogs) * 100 : 0;
    let level = 0;
    if (rate > 75) level = 4;
    else if (rate > 50) level = 3;
    else if (rate > 25) level = 2;
    else if (rate > 0) level = 1;

    map.set(item._id, {
      date: item._id,
      completed: item.completedCount,
      total: item.totalLogs,
      rate: Math.round(rate),
      level,
    });
  });

  return {
    year: targetYear,
    data: Object.fromEntries(map),
  };
};
