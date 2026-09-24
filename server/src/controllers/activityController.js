import { Activity } from '../models/Activity.js';
import { DailyLog } from '../models/DailyLog.js';
import { calculateActivityStreak } from '../services/streakEngine.js';

export const getActivities = async (req, res, next) => {
  try {
    const { isArchived, isActive, category, search } = req.query;

    const query = { userId: req.user.id };

    if (isArchived !== undefined) {
      query.isArchived = isArchived === 'true';
    } else {
      query.isArchived = false; // default to active/non-archived
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const activities = await Activity.find(query).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityById = async (req, res, next) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    // Compute streak stats
    const streakStats = await calculateActivityStreak(req.user.id, activity);

    res.status(200).json({
      success: true,
      activity,
      streakStats,
    });
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      type,
      targetValue,
      targetUnit,
      frequency,
      activeDays,
      priority,
      color,
      icon,
      reminderTime,
      startDate,
      endDate,
    } = req.body;

    // Get current max order
    const lastActivity = await Activity.findOne({ userId: req.user.id }).sort({ order: -1 });
    const order = lastActivity ? (lastActivity.order || 0) + 1 : 0;

    const activity = await Activity.create({
      userId: req.user.id,
      name,
      description,
      category: category || 'General',
      type: type || 'boolean',
      targetValue: targetValue ?? (type === 'boolean' ? true : 1),
      targetUnit: targetUnit || '',
      frequency: frequency || 'daily',
      activeDays: activeDays || [0, 1, 2, 3, 4, 5, 6],
      priority: priority || 'medium',
      color: color || '#3b82f6',
      icon: icon || 'CheckCircle',
      reminderTime: reminderTime || null,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || null,
      order,
    });

    res.status(201).json({
      success: true,
      message: 'Activity created successfully.',
      activity,
    });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    const updatableFields = [
      'name',
      'description',
      'category',
      'type',
      'targetValue',
      'targetUnit',
      'frequency',
      'activeDays',
      'priority',
      'color',
      'icon',
      'reminderTime',
      'startDate',
      'endDate',
      'isActive',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        activity[field] = req.body[field];
      }
    });

    await activity.save();

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully.',
      activity,
    });
  } catch (error) {
    next(error);
  }
};

export const archiveActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    activity.isArchived = !activity.isArchived;
    await activity.save();

    res.status(200).json({
      success: true,
      message: activity.isArchived ? 'Activity archived.' : 'Activity unarchived.',
      activity,
    });
  } catch (error) {
    next(error);
  }
};

export const reorderActivities = async (req, res, next) => {
  try {
    const { orderedIds } = req.body; // Array of IDs in new order

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array.' });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId: req.user.id },
        update: { order: index },
      },
    }));

    await Activity.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Activities reordered successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const duplicateActivity = async (req, res, next) => {
  try {
    const original = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!original) {
      return res.status(404).json({ success: false, message: 'Original activity not found.' });
    }

    const lastActivity = await Activity.findOne({ userId: req.user.id }).sort({ order: -1 });
    const order = lastActivity ? (lastActivity.order || 0) + 1 : 0;

    const duplicate = await Activity.create({
      userId: req.user.id,
      name: `${original.name} (Copy)`,
      description: original.description,
      category: original.category,
      type: original.type,
      targetValue: original.targetValue,
      targetUnit: original.targetUnit,
      frequency: original.frequency,
      activeDays: original.activeDays,
      priority: original.priority,
      color: original.color,
      icon: original.icon,
      reminderTime: original.reminderTime,
      startDate: new Date().toISOString().split('T')[0],
      order,
    });

    res.status(201).json({
      success: true,
      message: 'Activity duplicated.',
      activity: duplicate,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const { permanent } = req.query;

    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    if (permanent === 'true') {
      // Hard delete activity & its historical logs if explicitly requested
      await DailyLog.deleteMany({ activityId: activity._id, userId: req.user.id });
      await activity.deleteOne();
      return res.status(200).json({
        success: true,
        message: 'Activity and its historical records deleted permanently.',
      });
    }

    // Soft delete / archive by default
    activity.isArchived = true;
    activity.isActive = false;
    await activity.save();

    res.status(200).json({
      success: true,
      message: 'Activity archived safely (historical logs preserved).',
    });
  } catch (error) {
    next(error);
  }
};
