import { Activity } from '../models/Activity.js';
import { DailyLog } from '../models/DailyLog.js';
import { DailyReflection } from '../models/DailyReflection.js';
import { Goal } from '../models/Goal.js';

export const exportBackup = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [activities, logs, reflections, goals] = await Promise.all([
      Activity.find({ userId }),
      DailyLog.find({ userId }),
      DailyReflection.find({ userId }),
      Goal.find({ userId }),
    ]);

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
      },
      data: {
        activities,
        logs,
        reflections,
        goals,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=dailytrack-backup-${new Date().toISOString().split('T')[0]}.json`
    );
    res.status(200).json(backupData);
  } catch (error) {
    next(error);
  }
};

export const importBackup = async (req, res, next) => {
  try {
    const { backup } = req.body;

    if (!backup || !backup.data) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup file format.',
      });
    }

    const { activities, logs, reflections, goals } = backup.data;
    const userId = req.user.id;

    let restoredActivities = 0;
    let restoredLogs = 0;
    let restoredReflections = 0;
    let restoredGoals = 0;

    // Map old activity IDs to new activity IDs to maintain relational integrity
    const activityIdMap = new Map();

    if (Array.isArray(activities)) {
      for (const act of activities) {
        if (!act.name) continue;
        const newAct = await Activity.create({
          userId,
          name: act.name,
          description: act.description || '',
          category: act.category || 'General',
          type: act.type || 'boolean',
          targetValue: act.targetValue ?? 1,
          targetUnit: act.targetUnit || '',
          frequency: act.frequency || 'daily',
          activeDays: act.activeDays || [0, 1, 2, 3, 4, 5, 6],
          priority: act.priority || 'medium',
          color: act.color || '#3b82f6',
          icon: act.icon || 'CheckCircle',
          startDate: act.startDate || new Date().toISOString().split('T')[0],
          isActive: act.isActive !== undefined ? act.isActive : true,
          isArchived: act.isArchived || false,
        });

        if (act._id) {
          activityIdMap.set(act._id.toString(), newAct._id);
        }
        restoredActivities++;
      }
    }

    if (Array.isArray(logs)) {
      for (const log of logs) {
        if (!log.dateKey) continue;
        const mappedActivityId = log.activityId ? activityIdMap.get(log.activityId.toString()) : null;
        if (!mappedActivityId) continue;

        await DailyLog.findOneAndUpdate(
          {
            userId,
            activityId: mappedActivityId,
            dateKey: log.dateKey,
          },
          {
            $set: {
              status: log.status || 'completed',
              actualValue: log.actualValue ?? 0,
              remark: log.remark || '',
              completedAt: log.completedAt || new Date(),
            },
          },
          { upsert: true }
        );
        restoredLogs++;
      }
    }

    if (Array.isArray(reflections)) {
      for (const ref of reflections) {
        if (!ref.dateKey) continue;
        await DailyReflection.findOneAndUpdate(
          {
            userId,
            dateKey: ref.dateKey,
          },
          {
            $set: {
              wentWell: ref.wentWell || '',
              wentWrong: ref.wentWrong || '',
              learned: ref.learned || '',
              tomorrowGoal: ref.tomorrowGoal || '',
              moodRating: ref.moodRating || 3,
            },
          },
          { upsert: true }
        );
        restoredReflections++;
      }
    }

    if (Array.isArray(goals)) {
      for (const g of goals) {
        if (!g.title) continue;
        const mappedRelated = (g.relatedActivityIds || [])
          .map((oldId) => activityIdMap.get(oldId.toString()))
          .filter(Boolean);

        await Goal.create({
          userId,
          title: g.title,
          description: g.description || '',
          category: g.category || 'General',
          deadline: g.deadline || null,
          status: g.status || 'in_progress',
          currentProgress: g.currentProgress || 0,
          milestones: g.milestones || [],
          relatedActivityIds: mappedRelated,
        });
        restoredGoals++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Restore complete! Restored ${restoredActivities} activities, ${restoredLogs} logs, ${restoredReflections} reflections, and ${restoredGoals} goals.`,
    });
  } catch (error) {
    next(error);
  }
};

export const exportCSV = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const query = { userId: req.user.id };
    if (start && end) {
      query.dateKey = { $gte: start, $lte: end };
    }

    const logs = await DailyLog.find(query).populate('activityId').sort({ dateKey: -1 });

    const headers = ['Date', 'Activity', 'Category', 'Target', 'Actual', 'Status', 'Remark'];
    const rows = logs.map((log) => {
      const actName = log.activityId ? `"${log.activityId.name.replace(/"/g, '""')}"` : 'Unknown';
      const cat = log.activityId ? `"${log.activityId.category}"` : 'General';
      const target = log.activityId ? `"${log.activityId.targetValue} ${log.activityId.targetUnit || ''}"` : '';
      const actual = `"${log.actualValue || ''}"`;
      const status = `"${log.status}"`;
      const remark = `"${(log.remark || '').replace(/"/g, '""')}"`;
      return [log.dateKey, actName, cat, target, actual, status, remark].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=dailytrack-logs-${new Date().toISOString().split('T')[0]}.csv`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
