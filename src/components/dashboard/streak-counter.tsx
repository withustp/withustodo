'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/use-tasks';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { useMemo } from 'react';

/**
 * Streak Counter Widget
 * Calculates real consecutive active days based on tasks and focus sessions.
 */
export function StreakCounter() {
  const t = useTranslations('Dashboard.StreakCounter');
  const { tasks } = useTasks();
  const { entries } = useTimeEntries();

  // Extract all unique activity dates (YYYY-MM-DD)
  const streak = useMemo(() => {
    const activeDates = new Set<string>();

    tasks.forEach(task => {
      if (task.status === 'done' && task.updated_at) {
        activeDates.add(new Date(task.updated_at).toDateString());
      }
    });

    entries.forEach(entry => {
      if (entry.completed_at) {
        activeDates.add(new Date(entry.completed_at).toDateString());
      }
    });

    // Check consecutive days starting from today or yesterday
    let count = 0;
    const checkDate = new Date();
    
    // Check today first
    if (activeDates.has(checkDate.toDateString())) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If not today, check if yesterday was active
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (activeDates.has(yesterday.toDateString())) {
        count++;
        checkDate.setDate(checkDate.getDate() - 2);
      } else {
        return activeDates.size > 0 ? 1 : 0;
      }
    }

    while (activeDates.has(checkDate.toDateString())) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return count;
  }, [tasks, entries]);

  return (
    <Card className="p-6 h-full flex flex-col items-center justify-center bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 text-center shadow-lg">
      <motion.div
        animate={streak > 0 ? { scale: [1, 1.08, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className={`p-4 rounded-full mb-3 shadow-md ${streak > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-muted/30 text-muted-foreground'}`}
      >
        <Flame size={32} />
      </motion.div>
      <div className="text-4xl font-extrabold tracking-tight text-foreground mb-0.5">{streak}</div>
      <div className="text-xs font-medium text-muted-foreground">{t('days')}</div>
    </Card>
  );
}
