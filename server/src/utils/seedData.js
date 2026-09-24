import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { DailyLog } from '../models/DailyLog.js';
import { DailyReflection } from '../models/DailyReflection.js';
import { Goal } from '../models/Goal.js';
import { shiftDateKey, formatDateKey } from '../services/streakEngine.js';

dotenv.config();

export const seedDatabase = async (emailOverride = null) => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dailytrack';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const targetEmail = (emailOverride || 'sonu@dailytrack.com').toLowerCase();

    // 1. Find or create user
    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      user = await User.create({
        name: 'Sonu',
        email: targetEmail,
        password: 'password123',
        preferences: {
          theme: 'dark',
          weekStartsOn: 1,
          defaultView: 'table',
          reminderEnabled: true,
          dailyTargetScore: 80,
        },
      });
      console.log(`[Seed] Created user: ${user.name} (${user.email})`);
    }

    const userId = user._id;

    // Clear existing data for this user to ensure clean seed
    await Promise.all([
      Activity.deleteMany({ userId }),
      DailyLog.deleteMany({ userId }),
      DailyReflection.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
    ]);

    const today = formatDateKey(new Date());
    const startDate = shiftDateKey(today, -25);

    // 2. Create the exact example activities requested by user
    const activitiesData = [
      {
        userId,
        name: 'DSA Practice',
        description: 'Solve algorithmic problems covering graphs, trees, and dynamic programming.',
        category: 'Coding',
        type: 'numeric',
        targetValue: 3,
        targetUnit: 'questions',
        frequency: 'daily',
        activeDays: [0, 1, 2, 3, 4, 5, 6],
        priority: 'high',
        color: '#3b82f6',
        icon: 'Code',
        reminderTime: '09:00',
        startDate,
        order: 1,
      },
      {
        userId,
        name: 'Software Development',
        description: 'Build production features, optimize queries, and design APIs.',
        category: 'Development',
        type: 'duration',
        targetValue: 3,
        targetUnit: 'hours',
        frequency: 'daily',
        activeDays: [0, 1, 2, 3, 4, 5, 6],
        priority: 'high',
        color: '#8b5cf6',
        icon: 'Terminal',
        reminderTime: '11:00',
        startDate,
        order: 2,
      },
      {
        userId,
        name: 'Wake Up',
        description: 'Morning wake up before 7:00 AM for early routine.',
        category: 'Health',
        type: 'time',
        targetValue: '07:00 AM',
        targetUnit: 'time',
        frequency: 'daily',
        activeDays: [0, 1, 2, 3, 4, 5, 6],
        priority: 'medium',
        color: '#f59e0b',
        icon: 'Sun',
        reminderTime: '06:45',
        startDate,
        order: 3,
      },
      {
        userId,
        name: 'Reading',
        description: 'Read technical books or personal growth literature.',
        category: 'Learning',
        type: 'duration',
        targetValue: 30,
        targetUnit: 'minutes',
        frequency: 'daily',
        activeDays: [0, 1, 2, 3, 4, 5, 6],
        priority: 'medium',
        color: '#10b981',
        icon: 'BookOpen',
        reminderTime: '21:30',
        startDate,
        order: 4,
      },
      {
        userId,
        name: 'Exercise & Fitness',
        description: 'Cardio, strength training, or high-intensity workout.',
        category: 'Health',
        type: 'duration',
        targetValue: 45,
        targetUnit: 'minutes',
        frequency: 'specific_days',
        activeDays: [1, 2, 3, 4, 5], // Monday through Friday
        priority: 'medium',
        color: '#ef4444',
        icon: 'Activity',
        reminderTime: '18:00',
        startDate,
        order: 5,
      },
      {
        userId,
        name: 'College Study',
        description: 'Core semester subjects and university assignments.',
        category: 'Education',
        type: 'duration',
        targetValue: 2,
        targetUnit: 'hours',
        frequency: 'weekdays',
        activeDays: [1, 2, 3, 4, 5],
        priority: 'low',
        color: '#6366f1',
        icon: 'GraduationCap',
        reminderTime: '15:00',
        startDate,
        order: 6,
      },
      {
        userId,
        name: 'LeetCode Contest / Daily',
        description: 'Daily LeetCode streak and speed practice.',
        category: 'Coding',
        type: 'numeric',
        targetValue: 2,
        targetUnit: 'problems',
        frequency: 'daily',
        activeDays: [0, 1, 2, 3, 4, 5, 6],
        priority: 'high',
        color: '#0ea5e9',
        icon: 'Cpu',
        reminderTime: '20:00',
        startDate,
        order: 7,
      },
    ];

    const createdActivities = await Activity.insertMany(activitiesData);
    console.log(`[Seed] Created ${createdActivities.length} activities.`);

    // 3. Populate realistic historical logs over the past 24 days + today
    const logsToInsert = [];
    let curDate = startDate;

    const remarksList = [
      'Great focus today, finished early.',
      'Felt energetic during the session.',
      'Worked on backend microservices architecture.',
      'Revised binary search and sliding window problems.',
      'Had to attend team call, completed partial session.',
      'Tired today but managed to show up.',
      'Deep work without distractions for 2 hours.',
      'Completed LeetCode daily challenge with optimal O(N) complexity.',
    ];

    let dayIndex = 0;
    while (curDate <= today) {
      const isToday = curDate === today;

      for (const act of createdActivities) {
        // Decide log status realistically
        // Give DSA high consistency (88% completed)
        let status = 'completed';
        let actualValue = act.targetValue;
        let remark = '';

        if (isToday) {
          // Today: partial/pending mix to allow live testing
          if (act.name === 'DSA Practice') {
            status = 'completed';
            actualValue = 3;
            remark = 'Completed 3 questions (Trees & DP)';
          } else if (act.name === 'Software Development') {
            status = 'partial';
            actualValue = 2.5;
            remark = 'Worked on authentication & dashboard UI';
          } else if (act.name === 'Wake Up') {
            status = 'completed';
            actualValue = '06:50 AM';
            remark = 'Woke up fresh';
          } else if (act.name === 'Reading') {
            status = 'completed';
            actualValue = 30;
            remark = 'Read System Design chapter';
          } else {
            status = 'pending';
            actualValue = act.type === 'boolean' ? false : 0;
            remark = '';
          }
        } else {
          // Past days: realistic variations
          const rand = Math.random();
          if (act.name === 'DSA Practice') {
            if (rand > 0.12) {
              status = 'completed';
              actualValue = rand > 0.8 ? 4 : 3;
            } else {
              status = 'partial';
              actualValue = 2;
            }
          } else if (act.name === 'Software Development') {
            if (rand > 0.25) {
              status = 'completed';
              actualValue = 3;
            } else if (rand > 0.1) {
              status = 'partial';
              actualValue = 1.5;
            } else {
              status = 'missed';
              actualValue = 0;
            }
          } else if (act.name === 'Wake Up') {
            if (rand > 0.2) {
              status = 'completed';
              actualValue = '06:45 AM';
            } else {
              status = 'partial';
              actualValue = '07:25 AM';
            }
          } else {
            if (rand > 0.2) {
              status = 'completed';
              actualValue = act.targetValue;
            } else if (rand > 0.1) {
              status = 'partial';
              actualValue = typeof act.targetValue === 'number' ? Math.floor(act.targetValue * 0.6) : act.targetValue;
            } else {
              status = 'missed';
              actualValue = 0;
            }
          }

          if (Math.random() > 0.5) {
            remark = remarksList[Math.floor(Math.random() * remarksList.length)];
          }
        }

        logsToInsert.push({
          userId,
          activityId: act._id,
          dateKey: curDate,
          status,
          actualValue,
          remark,
          completedAt: status === 'completed' || status === 'partial' ? new Date(`${curDate}T12:00:00Z`) : null,
        });
      }

      // Add daily reflection for every 3rd day
      if (dayIndex % 3 === 0 || isToday) {
        await DailyReflection.create({
          userId,
          dateKey: curDate,
          wentWell: 'Consistent focus in morning hours, solved core algorithmic problems.',
          wentWrong: dayIndex % 6 === 0 ? 'Felt afternoon slump and lost 30 minutes on social media.' : 'Slept 30 minutes later than targeted.',
          learned: 'Learned how Monotonic Stack solves next-greater-element in linear time.',
          tomorrowGoal: 'Complete full stack authentication and wire up dashboard analytics.',
          moodRating: 4,
        });
      }

      curDate = shiftDateKey(curDate, 1);
      dayIndex++;
    }

    await DailyLog.insertMany(logsToInsert);
    console.log(`[Seed] Inserted ${logsToInsert.length} historical logs.`);

    // 4. Create Goals
    await Goal.create([
      {
        userId,
        title: 'Become Interview Ready & Crack Top Product Companies',
        description: 'Complete 300 DSA problems and ship 2 high-impact full-stack applications.',
        category: 'Career',
        deadline: shiftDateKey(today, 60),
        status: 'in_progress',
        currentProgress: 65,
        relatedActivityIds: [createdActivities[0]._id, createdActivities[1]._id, createdActivities[6]._id],
        targetMetric: '300 Questions & 2 Fullstack Apps',
        milestones: [
          { title: 'Master Sliding Window and Two Pointers', completed: true, dueDate: shiftDateKey(today, -15) },
          { title: 'Solve 50 Dynamic Programming problems', completed: true, dueDate: shiftDateKey(today, -5) },
          { title: 'Complete DailyTrack Production App', completed: false, dueDate: shiftDateKey(today, 10) },
          { title: 'Take 5 Full Mock Technical Interviews', completed: false, dueDate: shiftDateKey(today, 45) },
        ],
      },
      {
        userId,
        title: 'Build Consistent Morning Health & Workout Routine',
        description: 'Achieve 30-day streak of waking up before 7:00 AM and 45min workouts.',
        category: 'Health',
        deadline: shiftDateKey(today, 30),
        status: 'in_progress',
        currentProgress: 75,
        relatedActivityIds: [createdActivities[2]._id, createdActivities[4]._id],
        targetMetric: '30-Day Morning Routine Streak',
        milestones: [
          { title: '14 consecutive days waking up before 7:00 AM', completed: true, dueDate: shiftDateKey(today, -3) },
          { title: 'Complete 20 workout sessions this month', completed: true, dueDate: shiftDateKey(today, 5) },
          { title: 'Achieve 30-day streak target', completed: false, dueDate: shiftDateKey(today, 30) },
        ],
      },
    ]);

    console.log('[Seed] Goals created.');
    console.log('[Seed] Database seeding completed successfully!');
    return { success: true, user, activitiesCount: createdActivities.length, logsCount: logsToInsert.length };
  } catch (error) {
    console.error('[Seed Error]', error);
    throw error;
  }
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase()
    .then(() => {
      console.log('Seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
