import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: String,
    default: null,
  },
});

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxLength: [150, 'Goal title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    deadline: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'paused', 'abandoned'],
      default: 'in_progress',
    },
    relatedActivityIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
      },
    ],
    targetMetric: {
      type: String,
      default: '',
    },
    // 'auto'   -> progress is computed from the sum of actualValue on linked
    //             DailyLog entries (e.g. "3 coding questions" logged today
    //             count toward a 100-question target automatically).
    // 'manual' -> progress is derived from milestone checkboxes, or left as
    //             whatever was last saved (legacy behavior).
    trackingMode: {
      type: String,
      enum: ['manual', 'auto'],
      default: 'manual',
    },
    targetValue: {
      type: Number,
      default: null,
      min: 0,
    },
    targetUnit: {
      type: String,
      trim: true,
      default: '',
    },
    // Only logs on/after this date count toward the goal. Defaults to the
    // goal's creation date the first time it's saved.
    progressStartDate: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    // Cached sum of linked activity logs, refreshed on every read/write —
    // stored (rather than computed purely on the fly) so it's available to
    // exports, the dashboard, and anywhere else that reads a goal directly
    // from the database without going through the recompute helper.
    currentValue: {
      type: Number,
      default: 0,
    },
    currentProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ userId: 1, status: 1 });

export const Goal = mongoose.model('Goal', goalSchema);
