import React, { useState, useEffect, useCallback } from 'react';
import { reflectionApi } from '../api/reflectionApi';
import { Header } from '../components/layout/Header';
import { DailyJournalCard } from '../components/reflections/DailyJournalCard';
import { Card } from '../components/common/Card';
import { CardSkeleton } from '../components/common/Skeleton';
import { getTodayDateKey, formatDisplayDate } from '../utils/dateUtils';
import { BookOpen, Star, Sparkles, AlertCircle, Lightbulb, Target } from 'lucide-react';

export const ReflectionsPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayKey = getTodayDateKey();
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reflectionApi.getHistory(30);
      if (res.success) {
        setHistory(res.reflections || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="space-y-6">
      <Header
        title="Reflections & Daily Journal"
        subtitle="Mindful retrospection, qualitative insights, and continuous routine improvement"
      />

      {/* Today's / Active Date Journal Form */}
      <DailyJournalCard dateKey={selectedDate} />

      {/* Historical Reflections Feed */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
          Past 30 Days Reflections History
        </h3>

        {loading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : history.length === 0 ? (
          <Card className="p-8 text-center text-xs text-surface-400">
            No past reflections recorded yet. Fill out today's reflection above to start your journal log.
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((ref) => (
              <Card key={ref._id} className="p-5" hoverEffect>
                <div className="flex items-center justify-between pb-3 border-b border-surface-200/60 dark:border-surface-800/60 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-surface-900 dark:text-surface-100">
                      {formatDisplayDate(ref.dateKey)}
                    </span>
                    <button
                      onClick={() => setSelectedDate(ref.dateKey)}
                      className="text-[11px] text-brand-500 hover:underline"
                    >
                      (Edit)
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= (ref.moodRating || 3)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-surface-300 dark:text-surface-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {ref.wentWell && (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-emerald-500 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> What Went Well:
                      </span>
                      <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
                        {ref.wentWell}
                      </p>
                    </div>
                  )}

                  {ref.wentWrong && (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Friction Points:
                      </span>
                      <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
                        {ref.wentWrong}
                      </p>
                    </div>
                  )}

                  {ref.learned && (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-brand-500 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5" /> Key Learning:
                      </span>
                      <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
                        {ref.learned}
                      </p>
                    </div>
                  )}

                  {ref.tomorrowGoal && (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-purple-500 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" /> Focus for Tomorrow:
                      </span>
                      <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
                        {ref.tomorrowGoal}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
