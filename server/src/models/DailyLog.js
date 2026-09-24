import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: true,
      index: true,
    },
    dateKey: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Date string YYYY-MM-DD is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['completed', 'partial', 'missed', 'skipped', 'pending'],
      default: 'pending',
      required: true,
    },
    actualValue: {
      type: mongoose.Schema.Types.Mixed,
      default: 0,
    },
    remark: {
      type: String,
      trim: true,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: prevents duplicate logs for same activity on same day per user
dailyLogSchema.index({ userId: 1, activityId: 1, dateKey: 1 }, { unique: true });
dailyLogSchema.index({ userId: 1, dateKey: 1, status: 1 });
dailyLogSchema.index({ userId: 1, dateKey: 1 });

export const DailyLog = mongoose.model('DailyLog', dailyLogSchema);
