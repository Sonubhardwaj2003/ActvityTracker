import React, { useState } from 'react';
import { Download, Share, PlusSquare, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall, isIosSafari } from '../../hooks/usePWAInstall';

/**
 * variant="button"  -> solid pill button (used on Welcome page)
 * variant="ghost"   -> compact icon+label (used in Header / Sidebar)
 */
export const InstallAppButton = ({ variant = 'button', className = '' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showIosSheet, setShowIosSheet] = useState(false);

  if (isInstalled) {
    if (variant === 'ghost') return null;
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 ${className}`}
      >
        <CheckCircle2 className="w-4 h-4" />
        App installed
      </div>
    );
  }

  const handleClick = async () => {
    if (isIosSafari()) {
      setShowIosSheet(true);
      return;
    }
    if (isInstallable) {
      await install();
    } else {
      setShowIosSheet(true);
    }
  };

  const baseButton =
    variant === 'button'
      ? 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 hover:brightness-110 active:scale-[0.98] transition-all'
      : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-medium hover:bg-brand-500/10 transition-colors';

  return (
    <>
      <button type="button" onClick={handleClick} className={`${baseButton} ${className}`}>
        <Download className={variant === 'button' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        Install App
      </button>

      {showIosSheet && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowIosSheet(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
                Install on iPhone / iPad
              </h3>
              <button onClick={() => setShowIosSheet(false)} aria-label="Close">
                <X className="w-4 h-4 text-surface-400" />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-surface-600 dark:text-surface-300">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                Tap the <Share className="w-4 h-4 inline mx-1" /> Share icon in Safari's toolbar
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                Scroll down and tap{' '}
                <PlusSquare className="w-4 h-4 inline mx-1" /> "Add to Home Screen"
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                Tap "Add" — DailyTrack now opens full-screen from your Home Screen
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
};
