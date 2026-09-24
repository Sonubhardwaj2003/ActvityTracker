import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { BookOpen, Sparkles, Star, Check } from 'lucide-react';
import { reflectionApi } from '../../api/reflectionApi';
import { useToast } from '../../context/ToastContext';

export const DailyJournalCard = ({ dateKey }) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reflection, setReflection] = useState({
    wentWell: '',
    wentWrong: '',
    learned: '',
    tomorrowGoal: '',
    moodRating: 4,
  });

  useEffect(() => {
    let isMounted = true;
    const loadReflection = async () => {
      try {
        setLoading(true);
        const res = await reflectionApi.getByDate(dateKey);
        if (isMounted && res.success && res.reflection) {
          setReflection({
            wentWell: res.reflection.wentWell || '',
            wentWrong: res.reflection.wentWrong || '',
            learned: res.reflection.learned || '',
            tomorrowGoal: res.reflection.tomorrowGoal || '',
            moodRating: res.reflection.moodRating || 4,
          });
        }
      } catch (err) {
        // silent fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (dateKey) loadReflection();
    return () => {
      isMounted = false;
    };
  }, [dateKey]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await reflectionApi.upsert({
        dateKey,
        ...reflection,
      });
      success('Daily reflection saved.');
    } catch (err) {
      error(err.message || 'Failed to save reflection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
              Daily Reflection ({dateKey})
            </h3>
            <p className="text-xs text-surface-400">
              Journal key learnings, friction points, and focus areas
            </p>
          </div>
        </div>

        {/* Mood rating */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-surface-400 font-medium mr-1 hidden sm:inline">Mood:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setReflection((p) => ({ ...p, moodRating: star }))}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-4 h-4 ${
                  star <= reflection.moodRating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-surface-300 dark:text-surface-700'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Went Well */}
          <div>
            <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              ✨ What went well?
            </label>
            <textarea
              rows={2}
              placeholder="Completed morning DSA session, sustained high energy..."
              value={reflection.wentWell}
              onChange={(e) => setReflection((p) => ({ ...p, wentWell: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Went Wrong */}
          <div>
            <label className="block text-xs font-semibold text-red-500 dark:text-red-400 mb-1">
              ⚠️ What went wrong / friction points?
            </label>
            <textarea
              rows={2}
              placeholder="Lost 30 minutes in afternoon scrolling or context switching..."
              value={reflection.wentWrong}
              onChange={(e) => setReflection((p) => ({ ...p, wentWrong: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Learned */}
          <div>
            <label className="block text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">
              💡 Key learnings & insight
            </label>
            <textarea
              rows={2}
              placeholder="Understood Monotonic Stack and compound query patterns..."
              value={reflection.learned}
              onChange={(e) => setReflection((p) => ({ ...p, learned: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Tomorrow Goal */}
          <div>
            <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              🎯 What should I improve tomorrow?
            </label>
            <textarea
              rows={2}
              placeholder="Wake up on first alarm, complete system design notes before noon..."
              value={reflection.tomorrowGoal}
              onChange={(e) => setReflection((p) => ({ ...p, tomorrowGoal: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            variant="primary"
            type="submit"
            isLoading={saving}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Save Reflection
          </Button>
        </div>
      </form>
    </Card>
  );
};
