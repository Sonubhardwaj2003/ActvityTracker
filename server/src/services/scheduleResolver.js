import { Activity } from '../models/Activity.js';
import { DailyLog } from '../models/DailyLog.js';

/**
 * Checks if an activity is scheduled for a given date
 * @param {Object} activity 
 * @param {string} dateKey - 'YYYY-MM-DD'
 * @returns {boolean}
 */
export const isActivityScheduledForDate = (activity, dateKey) => {
  if (!activity.isActive || activity.isArchived) return false;
  if (activity.startDate && activity.startDate > dateKey) return false;
  if (activity.endDate && activity.endDate < dateKey) return false;

  // Compute day of week from dateKey (avoiding timezone offset)
  const [year, month, day] = dateKey.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  switch (activity.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'specific_days':
    case 'weekly':
      return Array.isArray(activity.activeDays) && activity.activeDays.includes(dayOfWeek);
    default:
      return true;
  }
};

/**
 * Resolves all scheduled activities for a user on a given dateKey
 * Merges with existing DailyLog records or defaults to a virtual pending state.
 * @param {string} userId 
 * @param {string} dateKey - 'YYYY-MM-DD'
 * @returns {Promise<Array>}
 */
export const getScheduledActivitiesForDate = async (userId, dateKey) => {
  // 1. Fetch user's non-archived activities
  const allActivities = await Activity.find({
    userId,
    isArchived: false,
    startDate: { $lte: dateKey },
    $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: dateKey } }],
  }).sort({ order: 1, createdAt: 1 });

  // 2. Filter for those that match the schedule for dateKey
  const scheduledActivities = allActivities.filter((activity) =>
    isActivityScheduledForDate(activity, dateKey)
  );

  // 3. Fetch existing logs for this date
  const logs = await DailyLog.find({
    userId,
    dateKey,
  });

  const logMap = new Map();
  logs.forEach((log) => {
    logMap.set(log.activityId.toString(), log);
  });

  // 4. Merge activity definitions with their respective log
  const items = scheduledActivities.map((activity) => {
    const existingLog = logMap.get(activity._id.toString());
    return {
      activity: activity.toObject ? activity.toObject() : activity,
      log: existingLog
        ? existingLog.toObject()
        : {
            _id: null,
            userId,
            activityId: activity._id,
            dateKey,
            status: 'pending',
            actualValue: activity.type === 'boolean' ? false : 0,
            remark: '',
            completedAt: null,
            isVirtual: true,
          },
    };
  });

  return items;
};
