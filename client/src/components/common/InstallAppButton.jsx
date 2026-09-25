import React, { useState } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  MoreVertical,
  Monitor,
} from 'lucide-react';
import { usePWAInstall, detectPlatform } from '../../hooks/usePWAInstall';

/**
 * variant="button"  -> solid pill button (used on Welcome page)
 * variant="ghost"   -> compact icon+label (used in Header / Sidebar)
 */
export const InstallAppButton = ({ variant = 'button', className = '' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showSheet, setShowSheet] = useState(false);

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
    // Native prompt is the best path — works on Chrome/Edge/Brave/Samsung
    // Internet on Windows, macOS, Linux, ChromeOS and Android alike.
    if (isInstallable) {
      const { outcome } = await install();
      // If the browser silently ignored it (rare), fall back to instructions.
      if (outcome === 'unavailable') setShowSheet(true);
      return;
    }
    // No native prompt available yet (iOS/Safari never fire it; Chrome may
    // not have fired it yet on a fresh visit) — show platform instructions.
    setShowSheet(true);
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

      {showSheet && <InstallInstructionsSheet onClose={() => setShowSheet(false)} />}
    </>
  );
};

const InstallInstructionsSheet = ({ onClose }) => {
  const { os, browser } = detectPlatform();
  const content = getInstructions(os, browser);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
            {content.title}
          </h3>
          <button onClick={onClose} aria-label="Close">
            <X className="w-4 h-4 text-surface-400" />
          </button>
        </div>
        <ol className="space-y-3 text-sm text-surface-600 dark:text-surface-300">
          {content.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        {content.note && (
          <p className="text-[11px] text-surface-400 dark:text-surface-500 pt-1 border-t border-surface-100 dark:border-surface-800">
            {content.note}
          </p>
        )}
      </div>
    </div>
  );
};

const ShareIcon = <Share className="w-4 h-4 inline mx-1 -mt-0.5" />;
const PlusIcon = <PlusSquare className="w-4 h-4 inline mx-1 -mt-0.5" />;
const MenuIcon = <MoreVertical className="w-4 h-4 inline mx-1 -mt-0.5" />;
const MonitorIcon = <Monitor className="w-4 h-4 inline mx-1 -mt-0.5" />;

function getInstructions(os, browser) {
  if (os === 'ios') {
    return {
      title: 'Install on iPhone / iPad',
      steps: [
        <>Tap the {ShareIcon} Share icon in Safari's toolbar</>,
        <>Scroll down and tap {PlusIcon} "Add to Home Screen"</>,
        <>Tap "Add" — DailyTrack now opens full-screen from your Home Screen</>,
      ],
      note: 'iOS requires this manual step for every web app — it is not specific to DailyTrack.',
    };
  }

  if (os === 'android') {
    return {
      title: 'Install on Android',
      steps: [
        <>Tap the {MenuIcon} menu icon (top-right of your browser)</>,
        <>Tap "Install app" or "Add to Home screen"</>,
        <>Confirm — DailyTrack is added to your app drawer / home screen</>,
      ],
      note:
        browser === 'chrome' || browser === 'edge' || browser === 'samsung'
          ? 'On a fresh visit, Chrome sometimes needs a moment (or a page refresh) before the install option appears in its menu.'
          : 'For the smoothest install, open this page in Chrome, Edge, or Samsung Internet.',
    };
  }

  if (os === 'windows' || os === 'mac' || os === 'linux') {
    if (browser === 'firefox') {
      return {
        title: 'Install on Desktop',
        steps: [
          <>Firefox desktop doesn't support one-click app installs yet</>,
          <>Open this page in Chrome or Edge instead {MonitorIcon} to install DailyTrack as a real desktop app</>,
        ],
      };
    }
    return {
      title: 'Install on Desktop',
      steps: [
        <>
          Look for the install icon {MonitorIcon} in the right side of your browser's address
          bar
        </>,
        <>If you don't see it, open the {MenuIcon} browser menu and choose "Install DailyTrack..." (or "Apps → Install this site as an app")</>,
        <>Confirm — DailyTrack opens in its own window and is added to your Start Menu / Applications</>,
      ],
      note:
        'On a brand-new visit, Chrome/Edge can take a few seconds (or a reload) before the install icon shows up.',
    };
  }

  return {
    title: 'Install this App',
    steps: [
      <>Open your browser's menu</>,
      <>Look for "Install app" or "Add to Home screen"</>,
    ],
    note: 'For the most reliable install experience, use Chrome, Edge, or Safari.',
  };
}
