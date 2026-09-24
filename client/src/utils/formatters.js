import React from 'react';
import {
  Code,
  Terminal,
  Sun,
  BookOpen,
  Activity,
  GraduationCap,
  Cpu,
  CheckCircle,
  Flame,
  Heart,
  Dumbbell,
  Coffee,
  Briefcase,
  Target,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';

export const ICON_MAP = {
  Code,
  Terminal,
  Sun,
  BookOpen,
  Activity,
  GraduationCap,
  Cpu,
  CheckCircle,
  Flame,
  Heart,
  Dumbbell,
  Coffee,
  Briefcase,
  Target,
  Sparkles,
  Award,
  Zap,
};

export const getIconComponent = (iconName, props = {}) => {
  const Component = ICON_MAP[iconName] || CheckCircle;
  return React.createElement(Component, props);
};

export const CATEGORY_COLORS = {
  Coding: { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  Development: { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  Health: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  Fitness: { bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  Learning: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  Education: { bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  Career: { bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
  Personal: { bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' },
  Sleep: { bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
  Productivity: { bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  General: { bg: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
};

export const getCategoryBadgeStyle = (category) => {
  return CATEGORY_COLORS[category]?.bg || CATEGORY_COLORS.General.bg;
};

export const formatDurationValue = (minutes) => {
  const m = Math.round(Number(minutes) || 0);
  if (m < 60) return `${m}m`;
  const hours = Math.floor(m / 60);
  const remainingMins = m % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
};
