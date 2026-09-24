import { Activity } from '../models/Activity.js';
import { DailyLog } from '../models/DailyLog.js';
import {
  getDashboardMetrics,
  getDateRangeAnalytics,
  getHeatmapData,
} from '../services/analyticsEngine.js';
import { calculateActivityStreak, formatDateKey, shiftDateKey } from '../services/streakEngine.js';
import { isActivityScheduledForDate } from '../services/scheduleResolver.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const { date } = req.query;
    const metrics = await getDashboardMetrics(req.user.id, date);
    res.status(200).json({ success: true, metrics });
  } catch (error) {
    next(error);
  }
};

export const getRangeAnalytics = async (req, res, next) => {
  try {
    const today = formatDateKey(new Date());
    const { start, end } = req.query;
    const startDate = start || shiftDateKey(today, -29);
    const endDate = end || today;

    const analytics = await getDateRangeAnalytics(req.user.id, startDate, endDate);
    res.status(200).json({ success: true, analytics });
  } catch (error) {
    next(error);
  }
};

export const getHeatmap = async (req, res, next) => {
  try {
    const { year } = req.query;
    const heatmap = await getHeatmapData(req.user.id, year);
    res.status(200).json({ success: true, heatmap });
  } catch (error) {
    next(error);
  }
};

export const getActivityAnalytics = async (req, res, next) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    const today = formatDateKey(new Date());
    const { start, end } = req.query;
    const startDate = start || shiftDateKey(today, -29);
    const endDate = end || today;

    const streakStats = await calculateActivityStreak(req.user.id, activity);

    const logs = await DailyLog.find({
      userId: req.user.id,
      activityId: activity._id,
      dateKey: { $gte: startDate, $lte: endDate },
    }).sort({ dateKey: 1 });

    const logMap = new Map();
    logs.forEach((log) => logMap.set(log.dateKey, log));

    // Iterate days in range
    let current = startDate;
    const dailyChart = [];
    let scheduledDays = 0;
    let completedDays = 0;
    let totalTarget = 0;
    let totalActual = 0;
    let bestDay = null;
    let weakestDay = null;
    let maxActual = -1;
    let minActual = 999999;

    while (current <= endDate) {
      if (isActivityScheduledForDate(activity, current)) {
        scheduledDays += 1;
        const targetVal = parseFloat(activity.targetValue) || 1;
        totalTarget += targetVal;

        const log = logMap.get(current);
        const actualVal = log ? (parseFloat(log.actualValue) || 0) : 0;
        const status = log ? log.status : 'pending';

        if (status === 'completed') completedDays += 1;
        totalActual += actualVal;

        if (actualVal > maxActual) {
          maxActual = actualVal;
          bestDay = { date: current, actual: actualVal };
        }
        if (actualVal < minActual && status !== 'skipped') {
          minActual = actualVal;
          weakestDay = { date: current, actual: actualVal };
        }

        dailyChart.push({
          dateKey: current,
          displayDate: current.slice(5), // 'MM-DD'
          target: targetVal,
          actual: actualVal,
          status,
          remark: log ? log.remark : '',
        });
      }
      current = shiftDateKey(current, 1);
    }

    const completionRate = scheduledDays > 0 ? Math.round((completedDays / scheduledDays) * 100) : 0;
    const avgPerDay = scheduledDays > 0 ? (totalActual / scheduledDays).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      activity,
      stats: {
        startDate,
        endDate,
        scheduledDays,
        completedDays,
        totalTarget,
        totalActual,
        completionRate,
        avgPerDay,
        currentStreak: streakStats.currentStreak,
        longestStreak: streakStats.longestStreak,
        bestDay: bestDay || { date: '-', actual: 0 },
        weakestDay: weakestDay || { date: '-', actual: 0 },
      },
      dailyChart,
    });
  } catch (error) {
    next(error);
  }
};
