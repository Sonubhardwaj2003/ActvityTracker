import { Goal } from '../models/Goal.js';
import { DailyLog } from '../models/DailyLog.js';

const todayKey = () => new Date().toISOString().split('T')[0];

/**
 * For an 'auto' tracking goal, sums actualValue across every DailyLog entry
 * for its linked activities (from progressStartDate/creation date through
 * today), converts that sum into a 0-100 percentage against targetValue,
 * and auto-flips status to 'completed' once the target is reached.
 * Mutates the goal doc in place and returns whether anything changed, so
 * the caller can decide whether a save() is worth it.
 */
const recomputeAutoProgress = async (goal, userId) => {
  if (goal.trackingMode !== 'auto' || !goal.targetValue || goal.targetValue <= 0) {
    return false;
  }

  const activityIds = (goal.relatedActivityIds || []).map((a) => a._id || a);
  if (activityIds.length === 0) return false;

  const startDate = goal.progressStartDate || goal.createdAt?.toISOString().split('T')[0];

  const logs = await DailyLog.find({
    userId,
    activityId: { $in: activityIds },
    dateKey: { $gte: startDate, $lte: todayKey() },
    status: { $ne: 'skipped' },
  }).select('actualValue');

  let sum = 0;
  for (const log of logs) {
    const n = Number(log.actualValue);
    if (!Number.isNaN(n)) sum += n;
  }

  const nextProgress = Math.min(100, Math.round((sum / goal.targetValue) * 100));
  const nextStatus =
    nextProgress >= 100
      ? 'completed'
      : goal.status === 'completed'
      ? 'in_progress' // target was reduced or a log was edited back down
      : goal.status;

  const changed =
    goal.currentValue !== sum || goal.currentProgress !== nextProgress || goal.status !== nextStatus;

  goal.currentValue = sum;
  goal.currentProgress = nextProgress;
  goal.status = nextStatus;

  return changed;
};

export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id })
      .populate('relatedActivityIds', 'name category color icon targetUnit')
      .sort({ createdAt: -1 });

    await Promise.all(
      goals.map(async (goal) => {
        const changed = await recomputeAutoProgress(goal, req.user.id);
        if (changed) await goal.save();
      })
    );

    res.status(200).json({
      success: true,
      count: goals.length,
      goals,
    });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      deadline,
      relatedActivityIds,
      targetMetric,
      trackingMode,
      targetValue,
      targetUnit,
      progressStartDate,
      currentProgress,
      milestones,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Goal title is required.' });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      title,
      description: description || '',
      category: category || 'General',
      deadline: deadline || null,
      relatedActivityIds: relatedActivityIds || [],
      targetMetric: targetMetric || '',
      trackingMode: trackingMode === 'auto' ? 'auto' : 'manual',
      targetValue: targetValue || null,
      targetUnit: targetUnit || '',
      progressStartDate: progressStartDate || todayKey(),
      currentProgress: currentProgress || 0,
      milestones: milestones || [],
    });

    await goal.populate('relatedActivityIds', 'name category color icon targetUnit');
    await recomputeAutoProgress(goal, req.user.id);
    if (goal.isModified()) await goal.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully.',
      goal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    const updatable = [
      'title',
      'description',
      'category',
      'deadline',
      'status',
      'relatedActivityIds',
      'targetMetric',
      'trackingMode',
      'targetValue',
      'targetUnit',
      'progressStartDate',
      'currentProgress',
      'milestones',
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        goal[field] = req.body[field];
      }
    });

    // Auto-calculate progress from milestones only when this goal isn't on
    // automatic activity-based tracking and progress wasn't explicitly set.
    if (
      goal.trackingMode !== 'auto' &&
      goal.milestones &&
      goal.milestones.length > 0 &&
      req.body.currentProgress === undefined
    ) {
      const completedMilestones = goal.milestones.filter((m) => m.completed).length;
      goal.currentProgress = Math.round((completedMilestones / goal.milestones.length) * 100);
      if (goal.currentProgress === 100 && goal.status === 'in_progress') {
        goal.status = 'completed';
      }
    }

    await goal.populate('relatedActivityIds', 'name category color icon targetUnit');
    await recomputeAutoProgress(goal, req.user.id);
    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully.',
      goal,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
