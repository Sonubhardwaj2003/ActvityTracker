import { DailyLog } from '../models/DailyLog.js';
import { getScheduledActivitiesForDate } from '../services/scheduleResolver.js';
import { formatDateKey } from '../services/streakEngine.js';

export const getLogs = async (req, res, next) => {
  try {
    const { date, start, end } = req.query;

    if (date) {
      // Return scheduled activities merged with logs for that exact calendar date
      const scheduledWithLogs = await getScheduledActivitiesForDate(req.user.id, date);
      return res.status(200).json({
        success: true,
        dateKey: date,
        count: scheduledWithLogs.length,
        items: scheduledWithLogs,
      });
    }

    if (start && end) {
      const logs = await DailyLog.find({
        userId: req.user.id,
        dateKey: { $gte: start, $lte: end },
      }).populate('activityId');

      return res.status(200).json({
        success: true,
        count: logs.length,
        logs,
      });
    }

    // Default to today
    const today = formatDateKey(new Date());
    const scheduledWithLogs = await getScheduledActivitiesForDate(req.user.id, today);

    res.status(200).json({
      success: true,
      dateKey: today,
      count: scheduledWithLogs.length,
      items: scheduledWithLogs,
    });
  } catch (error) {
    next(error);
  }
};

export const upsertLog = async (req, res, next) => {
  try {
    const { activityId, dateKey, status, actualValue, remark } = req.body;

    if (!activityId || !dateKey) {
      return res.status(400).json({
        success: false,
        message: 'activityId and dateKey (YYYY-MM-DD) are required.',
      });
    }

    const updateData = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'completed' || status === 'partial') {
        updateData.completedAt = new Date();
      } else if (status === 'pending' || status === 'missed') {
        updateData.completedAt = null;
      }
    }
    if (actualValue !== undefined) updateData.actualValue = actualValue;
    if (remark !== undefined) updateData.remark = remark;

    const log = await DailyLog.findOneAndUpdate(
      {
        userId: req.user.id,
        activityId,
        dateKey,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Log saved successfully.',
      log,
    });
  } catch (error) {
    next(error);
  }
};

export const batchUpsertLogs = async (req, res, next) => {
  try {
    const { logs } = req.body; // Array of { activityId, dateKey, status, actualValue, remark }

    if (!Array.isArray(logs)) {
      return res.status(400).json({ success: false, message: 'logs must be an array.' });
    }

    const bulkOps = logs.map((item) => {
      const updateData = {};
      if (item.status !== undefined) {
        updateData.status = item.status;
        if (item.status === 'completed' || item.status === 'partial') {
          updateData.completedAt = new Date();
        }
      }
      if (item.actualValue !== undefined) updateData.actualValue = item.actualValue;
      if (item.remark !== undefined) updateData.remark = item.remark;

      return {
        updateOne: {
          filter: {
            userId: req.user.id,
            activityId: item.activityId,
            dateKey: item.dateKey,
          },
          update: { $set: updateData },
          upsert: true,
        },
      };
    });

    if (bulkOps.length > 0) {
      await DailyLog.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      message: `${bulkOps.length} logs synchronized successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLog = async (req, res, next) => {
  try {
    const log = await DailyLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Log removed.',
    });
  } catch (error) {
    next(error);
  }
};
