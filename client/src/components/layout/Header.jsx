import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sun,
  Moon,
  Laptop,
  HelpCircle,
  Database,
  Flame,
  Menu,
  X,
} from 'lucide-react';
import { KeyboardShortcutsModal } from '../common/KeyboardShortcutsModal';
import { InstallAppButton } from '../common/InstallAppButton';

export const Header = ({
  title,
  subtitle,
  actions = null,
  onOpenMobileMenu = null,
}) => {
  const { theme, setTheme } = useTheme();
  const { seedDemo } = useAuth();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const handleSeed = async () => {
    if (confirm('Load demo dataset with 25 days of realistic activity logs, reflections, and goals?')) {
      setIsSeeding(true);
      await seedDemo();
      setIsSeeding(false);
      window.location.reload();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 px-4 sm:px-8 flex items-center justify-between transition-colors">
        {/* Left Side: Mobile Hamburger & Page Header */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <h1 className="text-lg font-bold text-surface-900 dark:text-surface-100 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-surface-500 dark:text-surface-400 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Page Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {actions}

          {/* Install as App */}
          <div className="hidden lg:block">
            <InstallAppButton variant="ghost" />
          </div>

          {/* Quick Seed Demo Dataset Button */}
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-brand-500/30 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 transition-colors"
            title="Load 25-day realistic demo activity history"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSeeding ? 'Seeding...' : 'Load Sample Data'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            title={`Current theme: ${theme}. Click to switch.`}
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-brand-400" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Laptop className="w-4 h-4 text-surface-400" />
            )}
          </button>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors hidden sm:block"
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
};
