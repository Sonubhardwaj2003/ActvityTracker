import mongoose from 'mongoose';

const dailyReflectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateKey: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    wentWell: {
      type: String,
      trim: true,
      default: '',
    },
    wentWrong: {
      type: String,
      trim: true,
      default: '',
    },
    learned: {
      type: String,
      trim: true,
      default: '',
    },
    tomorrowGoal: {
      type: String,
      trim: true,
      default: '',
    },
    moodRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

dailyReflectionSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export const DailyReflection = mongoose.model('DailyReflection', dailyReflectionSchema);
