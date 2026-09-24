import { DailyReflection } from '../models/DailyReflection.js';

export const getReflectionByDate = async (req, res, next) => {
  try {
    const { date } = req.params;

    const reflection = await DailyReflection.findOne({
      userId: req.user.id,
      dateKey: date,
    });

    res.status(200).json({
      success: true,
      reflection: reflection || {
        dateKey: date,
        wentWell: '',
        wentWrong: '',
        learned: '',
        tomorrowGoal: '',
        moodRating: 3,
        isNew: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const upsertReflection = async (req, res, next) => {
  try {
    const { dateKey, wentWell, wentWrong, learned, tomorrowGoal, moodRating } = req.body;

    if (!dateKey) {
      return res.status(400).json({
        success: false,
        message: 'dateKey (YYYY-MM-DD) is required.',
      });
    }

    const reflection = await DailyReflection.findOneAndUpdate(
      {
        userId: req.user.id,
        dateKey,
      },
      {
        $set: {
          wentWell: wentWell || '',
          wentWrong: wentWrong || '',
          learned: learned || '',
          tomorrowGoal: tomorrowGoal || '',
          moodRating: moodRating || 3,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Daily reflection saved.',
      reflection,
    });
  } catch (error) {
    next(error);
  }
};

export const getReflectionsHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const reflections = await DailyReflection.find({ userId: req.user.id })
      .sort({ dateKey: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reflections.length,
      reflections,
    });
  } catch (error) {
    next(error);
  }
};
