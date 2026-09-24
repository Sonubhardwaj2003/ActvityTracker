import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { dataApi } from '../api/dataApi';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import {
  User,
  Shield,
  Palette,
  Calendar,
  Download,
  Upload,
  Database,
  Check,
  FileSpreadsheet,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, updatePreferences, updateProfile, seedDemo, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error, info } = useToast();

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Preference state
  const [weekStartsOn, setWeekStartsOn] = useState(user?.preferences?.weekStartsOn ?? 1);
  const [defaultView, setDefaultView] = useState(user?.preferences?.defaultView || 'table');
  const [reminderEnabled, setReminderEnabled] = useState(user?.preferences?.reminderEnabled ?? true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const payload = { name: profileName };
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }
    const res = await updateProfile(payload);
    setSavingProfile(false);
    if (res?.success) {
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  const handleSavePreferences = async (newPrefs) => {
    await updatePreferences(newPrefs);
  };

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const res = await dataApi.exportBackup();
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dailytrack-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success('JSON Backup downloaded successfully.');
    } catch (err) {
      error('Failed to export backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await dataApi.exportCSV();
      const blob = new Blob([res], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dailytrack-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      success('CSV export downloaded successfully.');
    } catch (err) {
      error('Failed to export CSV.');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const json = JSON.parse(text);

      if (!json.data || !json.data.activities) {
        throw new Error('Invalid backup schema. Missing activities collection.');
      }

      const res = await dataApi.importBackup(json);
      if (res.success) {
        success(res.message);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      error(err.message || 'Failed to restore backup.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleLoadDemo = async () => {
    if (confirm('Load demo dataset with 25 days of realistic tracking records?')) {
      await seedDemo();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Header
        title="Settings & System Preferences"
        subtitle="Manage personal profile, theme customization, schedule defaults, and data backups"
      />

      {/* 1. Profile Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-surface-200 dark:border-surface-800 mb-5">
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
              Account Profile
            </h3>
            <p className="text-xs text-surface-400">
              Update your personal display name and login credentials
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs rounded-xl bg-surface-100 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-surface-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-surface-100 dark:border-surface-800/80">
            <span className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-2">
              Change Password (optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" variant="primary" type="submit" isLoading={savingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Appearance & Schedule Preferences */}
      <Card className="p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-surface-200 dark:border-surface-800 mb-5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
              Appearance & Calendar Defaults
            </h3>
            <p className="text-xs text-surface-400">
              Customize theme and scheduling parameters
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Theme Mode */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-2 max-w-sm">
              {[
                { val: 'light', label: 'Light', icon: Sun },
                { val: 'dark', label: 'Dark', icon: Moon },
                { val: 'system', label: 'System', icon: Laptop },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setTheme(t.val)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      theme === t.val
                        ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                        : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Week Starts On */}
          <div className="pt-3 border-t border-surface-100 dark:border-surface-800/80">
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-2">
              Week Starts On
            </label>
            <div className="flex gap-2 max-w-xs">
              <button
                type="button"
                onClick={() => {
                  setWeekStartsOn(1);
                  handleSavePreferences({ weekStartsOn: 1 });
                }}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  weekStartsOn === 1
                    ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                    : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300'
                }`}
              >
                Monday
              </button>
              <button
                type="button"
                onClick={() => {
                  setWeekStartsOn(0);
                  handleSavePreferences({ weekStartsOn: 0 });
                }}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  weekStartsOn === 0
                    ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                    : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300'
                }`}
              >
                Sunday
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Permanent Data Management & Backups */}
      <Card className="p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-surface-200 dark:border-surface-800 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
              Data Management & Backup Portability
            </h3>
            <p className="text-xs text-surface-400">
              Download your complete tracking dataset or restore from a JSON backup
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON */}
          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 flex flex-col justify-between">
            <div className="space-y-1 mb-3">
              <h4 className="text-xs font-bold text-surface-900 dark:text-surface-100">
                JSON Complete Backup
              </h4>
              <p className="text-[11px] text-surface-400">
                Includes all activities, daily logs, reflections, and goals.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportJSON}
              isLoading={isExporting}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export JSON
            </Button>
          </div>

          {/* Export CSV */}
          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 flex flex-col justify-between">
            <div className="space-y-1 mb-3">
              <h4 className="text-xs font-bold text-surface-900 dark:text-surface-100">
                Spreadsheet CSV Export
              </h4>
              <p className="text-[11px] text-surface-400">
                Clean tabular format for Excel, Google Sheets, or Notion.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
          </div>

          {/* Restore Backup */}
          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 flex flex-col justify-between">
            <div className="space-y-1 mb-3">
              <h4 className="text-xs font-bold text-surface-900 dark:text-surface-100">
                Restore from Backup
              </h4>
              <p className="text-[11px] text-surface-400">
                Upload a verified JSON backup to restore all history.
              </p>
            </div>
            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center font-medium rounded-xl text-xs px-4 py-2 gap-2 bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 text-surface-800 dark:text-surface-100 w-full transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>{isImporting ? 'Restoring...' : 'Import JSON'}</span>
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Load Demo Data */}
        <div className="mt-5 p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400">
              Seed Realistic Demo History
            </h4>
            <p className="text-[11px] text-surface-500 dark:text-surface-400">
              Populate DSA Practice, Software Development, Wake Up, and 25 days of realistic logs.
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={handleLoadDemo}>
            Load Demo Data
          </Button>
        </div>
      </Card>

      {/* 4. Danger Zone */}
      <Card className="p-6 border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-red-500">
              Session & Sign Out
            </h4>
            <p className="text-xs text-surface-400 mt-0.5">
              Securely terminate your current session on this device.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
