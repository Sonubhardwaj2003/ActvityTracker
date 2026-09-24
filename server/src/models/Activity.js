import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      maxLength: [100, 'Activity name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'General',
    },
    type: {
      type: String,
      enum: ['boolean', 'numeric', 'duration', 'time', 'rating', 'text'],
      default: 'boolean',
      required: true,
    },
    targetValue: {
      type: mongoose.Schema.Types.Mixed,
      default: 1,
    },
    targetUnit: {
      type: String,
      trim: true,
      default: '',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekdays', 'weekends', 'specific_days', 'weekly'],
      default: 'daily',
      required: true,
    },
    activeDays: {
      type: [Number], // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      default: [0, 1, 2, 3, 4, 5, 6],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    color: {
      type: String,
      default: '#3b82f6', // Tailwind blue-500 default
    },
    icon: {
      type: String,
      default: 'CheckCircle',
    },
    reminderTime: {
      type: String, // HH:mm format e.g. "07:00"
      default: null,
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: true,
      default: () => new Date().toISOString().split('T')[0],
      index: true,
    },
    endDate: {
      type: String, // Optional YYYY-MM-DD
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ userId: 1, isArchived: 1, isActive: 1, order: 1 });

export const Activity = mongoose.model('Activity', activitySchema);
