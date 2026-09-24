import { DailyLog } from '../models/DailyLog.js';
import { Activity } from '../models/Activity.js';
import { isActivityScheduledForDate } from './scheduleResolver.js';

// Format Date object to 'YYYY-MM-DD'
export const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Add/subtract days from a 'YYYY-MM-DD' string
export const shiftDateKey = (dateKey, days) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return formatDateKey(dt);
};

/**
 * Calculates current and longest streak for an individual activity
 * based strictly on its scheduled calendar dates.
 */
export const calculateActivityStreak = async (userId, activity) => {
  // Fetch all completed/partial logs for this activity sorted chronologically
  const logs = await DailyLog.find({
    userId,
    activityId: activity._id,
  }).sort({ dateKey: 1 });

  const logMap = new Map();
  logs.forEach((log) => {
    logMap.set(log.dateKey, log.status);
  });

  const todayKey = formatDateKey(new Date());
  const startDate = activity.startDate || shiftDateKey(todayKey, -365);

  // Generate list of all scheduled dates from startDate to todayKey
  let currentDate = startDate;
  const scheduledDates = [];

  while (currentDate <= todayKey) {
    if (isActivityScheduledForDate(activity, currentDate)) {
      scheduledDates.push(currentDate);
    }
    currentDate = shiftDateKey(currentDate, 1);
  }

  if (scheduledDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompleted: 0 };
  }

  let longestStreak = 0;
  let tempStreak = 0;
  let totalCompleted = 0;

  for (let i = 0; i < scheduledDates.length; i++) {
    const dKey = scheduledDates[i];
    const status = logMap.get(dKey);

    if (status === 'completed') {
      tempStreak += 1;
      totalCompleted += 1;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else if (status === 'skipped') {
      // Skipped does not increment, but does not break the streak
      continue;
    } else {
      // If it's today and still pending, don't break yet
      if (dKey === todayKey && (!status || status === 'pending')) {
        continue;
      }
      tempStreak = 0;
    }
  }

  // Calculate current streak backwards from today or yesterday
  let currentStreak = 0;
  let pointer = scheduledDates.length - 1;

  // If today is scheduled and pending, evaluate starting from previous scheduled day
  if (pointer >= 0 && scheduledDates[pointer] === todayKey) {
    const todayStatus = logMap.get(todayKey);
    if (todayStatus === 'completed') {
      currentStreak += 1;
      pointer -= 1;
    } else if (!todayStatus || todayStatus === 'pending') {
      // Today is not over yet, start evaluating from yesterday
      pointer -= 1;
    } else {
      // Explicitly marked missed/partial
      pointer = -1;
    }
  }

  while (pointer >= 0) {
    const dKey = scheduledDates[pointer];
    const status = logMap.get(dKey);

    if (status === 'completed') {
      currentStreak += 1;
      pointer -= 1;
    } else if (status === 'skipped') {
      pointer -= 1;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak, totalCompleted };
};

/**
 * Calculates overall user productivity streak.
 * A day qualifies as productive if user completed at least 1 activity
 * (or achieved at least 50% completion if multiple activities exist).
 */
export const calculateOverallStreak = async (userId) => {
  const todayKey = formatDateKey(new Date());

  // Aggregate completed activities per day
  const dailyAgg = await DailyLog.aggregate([
    {
      $match: {
        userId,
        status: { $in: ['completed', 'partial'] },
      },
    },
    {
      $group: {
        _id: '$dateKey',
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0.5] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const activeDatesMap = new Map();
  dailyAgg.forEach((item) => {
    if (item.completedCount >= 1) {
      activeDatesMap.set(item._id, true);
    }
  });

  // Calculate longest streak across history
  let longestStreak = 0;
  let currentStreak = 0;

  if (dailyAgg.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDates = dailyAgg.map((d) => d._id).sort();
  const minDate = sortedDates[0];
  let walker = minDate;
  let running = 0;

  while (walker <= todayKey) {
    if (activeDatesMap.has(walker)) {
      running += 1;
      if (running > longestStreak) longestStreak = running;
    } else {
      // If walker is today, don't reset yet
      if (walker !== todayKey) {
        running = 0;
      }
    }
    walker = shiftDateKey(walker, 1);
  }

  // Calculate current streak backwards
  let checkDate = todayKey;
  if (activeDatesMap.has(checkDate)) {
    currentStreak += 1;
    checkDate = shiftDateKey(checkDate, -1);
  } else {
    // Today not yet completed, check if yesterday was active
    checkDate = shiftDateKey(checkDate, -1);
  }

  while (activeDatesMap.has(checkDate)) {
    currentStreak += 1;
    checkDate = shiftDateKey(checkDate, -1);
  }

  return { currentStreak, longestStreak };
};
