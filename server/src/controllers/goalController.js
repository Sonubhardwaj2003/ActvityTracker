import { Goal } from '../models/Goal.js';

export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id })
      .populate('relatedActivityIds', 'name category color icon')
      .sort({ createdAt: -1 });

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
      currentProgress: currentProgress || 0,
      milestones: milestones || [],
    });

    await goal.populate('relatedActivityIds', 'name category color icon');

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
      'currentProgress',
      'milestones',
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        goal[field] = req.body[field];
      }
    });

    // Auto-calculate progress if milestones exist and progress wasn't explicitly overridden
    if (goal.milestones && goal.milestones.length > 0 && req.body.currentProgress === undefined) {
      const completedMilestones = goal.milestones.filter((m) => m.completed).length;
      goal.currentProgress = Math.round((completedMilestones / goal.milestones.length) * 100);
      if (goal.currentProgress === 100 && goal.status === 'in_progress') {
        goal.status = 'completed';
      }
    }

    await goal.save();
    await goal.populate('relatedActivityIds', 'name category color icon');

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
