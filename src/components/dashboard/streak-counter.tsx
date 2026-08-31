'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Streak Counter Widget
 * Displays the user's current consecutive days streak
 */
export function StreakCounter() {
  const t = useTranslations('Dashboard.StreakCounter');
  const streak = 5;

  return (
    <Card className="p-6 h-full flex flex-col items-center justify-center bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 text-center">
      <motion.div
        animate={streak > 0 ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className={`p-4 rounded-full mb-4 ${streak > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-muted text-muted-foreground'}`}
      >
        <Flame size={32} />
      </motion.div>
      <div className="text-4xl font-bold mb-1">{streak}</div>
      <div className="text-sm text-muted-foreground">{t('days')}</div>
    </Card>
  );
}
