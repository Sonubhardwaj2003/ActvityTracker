import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  ArrowRight,
  CalendarCheck,
  BarChart3,
  Target,
  Sparkles,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { InstallAppButton } from '../components/common/InstallAppButton';

const features = [
  {
    icon: CalendarCheck,
    title: 'Daily Tracker',
    desc: 'Log every activity in seconds and keep your streaks alive.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'See trends, heatmaps, and target-vs-actual breakdowns.',
  },
  {
    icon: Target,
    title: 'Goals',
    desc: 'Set weekly and monthly goals and track real progress.',
  },
  {
    icon: Sparkles,
    title: 'Reflections',
    desc: 'Capture daily journal notes alongside your data.',
  },
];

export const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-surface-900 dark:text-white">
            DailyTrack
          </span>
        </div>
        <div className="hidden sm:block">
          <InstallAppButton variant="ghost" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Your personal productivity OS
        </span>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-surface-900 dark:text-white leading-tight">
          Build habits that
          <span className="bg-gradient-to-tr from-brand-600 to-brand-400 bg-clip-text text-transparent">
            {' '}
            actually stick
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-surface-500 dark:text-surface-400 max-w-xl">
          Track daily activities, hold your streaks, hit your goals, and review your
          progress — all in one fast, installable app.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-200 text-sm font-semibold hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="sm:hidden mt-4">
          <InstallAppButton variant="button" />
        </div>

        <div className="mt-6 flex items-center gap-4 text-[11px] text-surface-400 dark:text-surface-500">
          <span className="inline-flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5" /> Installs on Windows &amp; desktop
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" /> Installs on Android &amp; iOS
          </span>
        </div>

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-surface-900 dark:text-surface-100">
                {title}
              </h3>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-[11px] text-surface-400 dark:text-surface-600 py-6">
        DailyTrack — Productivity OS
      </footer>
    </div>
  );
};
