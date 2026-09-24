import React from 'react';
import { Modal } from './Modal';
import { Command } from 'lucide-react';

export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: 'N', description: 'Create a new activity' },
    { key: 'T', description: 'Jump to today in daily tracker' },
    { key: '←', description: 'Navigate to previous calendar date' },
    { key: '→', description: 'Navigate to next calendar date' },
    { key: '/', description: 'Focus search bar in activities table' },
    { key: '?', description: 'Open keyboard shortcuts cheatsheet' },
    { key: 'Esc', description: 'Close active modal / dialog' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      subtitle="Power-user hotkeys for lightning-fast productivity"
      maxWidth="max-w-md"
    >
      <div className="space-y-2.5">
        {shortcuts.map((sc) => (
          <div
            key={sc.key}
            className="flex items-center justify-between p-2.5 rounded-xl bg-surface-50 dark:bg-surface-850/60 border border-surface-200/60 dark:border-surface-800/60 text-sm"
          >
            <span className="text-surface-700 dark:text-surface-300">
              {sc.description}
            </span>
            <kbd className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 border border-surface-300 dark:border-surface-700 shadow-sm">
              {sc.key}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
};
