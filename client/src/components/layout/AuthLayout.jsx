import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowLeft, Flame as FlameSmall, Target, BarChart3, CalendarCheck } from 'lucide-react';

/**
 * Shared shell for Login / Register.
 *
 * On large screens this splits into two panels (branding + preview on the
 * left, the auth form on the right) instead of one narrow card floating in
 * a sea of empty space — mirrors the pattern used by MongoDB Atlas, Linear,
 * etc. On small/medium screens the left panel is hidden entirely and the
 * form takes the full width.
 */
export const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Left branding panel — lg screens and up only */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-400 flex-col justify-between p-10 xl:p-14">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 rounded-full bg-brand-900/20 blur-3xl" />

        <Link to="/welcome" className="relative flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white shrink-0">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">DailyTrack</span>
        </Link>

        <div className="relative space-y-6">
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight max-w-sm">
            Every day, one step closer to who you want to be.
          </h2>
          <p className="text-sm text-white/80 max-w-sm leading-relaxed">
            DailyTrack turns scattered goals into a daily system — log habits, watch streaks
            build, and see real progress add up automatically.
          </p>

          {/* Decorative floating preview cards */}
          <div className="relative h-48 mt-8">
            <div className="absolute left-0 top-2 w-44 rounded-2xl bg-white/95 dark:bg-surface-900 shadow-xl p-3.5 -rotate-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-brand-500/15 text-brand-600 flex items-center justify-center">
                  <CalendarCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-surface-700">Active Streak</span>
              </div>
              <div className="text-xl font-extrabold text-surface-900">18 Days</div>
            </div>

            <div className="absolute right-0 top-16 w-44 rounded-2xl bg-white/95 dark:bg-surface-900 shadow-xl p-3.5 rotate-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-surface-700">Goal Progress</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-100 overflow-hidden">
                <div className="h-full w-[68%] rounded-full bg-emerald-500" />
              </div>
              <div className="text-[11px] text-surface-500 mt-1">68% complete</div>
            </div>

            <div className="absolute left-6 bottom-0 w-40 rounded-2xl bg-white/95 dark:bg-surface-900 shadow-xl p-3.5 -rotate-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-violet-500/15 text-violet-600 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-surface-700">This Week</span>
              </div>
              <div className="text-xl font-extrabold text-surface-900">92%</div>
            </div>
          </div>
        </div>

        <p className="relative text-[11px] text-white/60">
          Installable on Windows, macOS, Linux, Android &amp; iOS — works like a native app.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col p-4 sm:p-8">
        <Link
          to="/welcome"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>

        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="w-full max-w-md bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2 lg:hidden">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/25">
                <FlameSmall className="w-6 h-6 fill-white" />
              </div>
            </div>
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
                {title}
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
