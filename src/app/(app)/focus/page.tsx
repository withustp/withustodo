'use client';

import { useTranslations } from 'next-intl';
import { PomodoroTimer } from '@/components/focus/pomodoro-timer';
import { SessionHistory } from '@/components/focus/session-history';
import { motion } from 'framer-motion';

/**
 * Focus Page
 * Pomodoro timer and session history
 */
export default function FocusPage() {
  const t = useTranslations('Focus');

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-[calc(100vh-4rem)]">
      <div className="flex-1 flex flex-col gap-6 max-w-3xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <PomodoroTimer />
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-80 xl:w-96"
      >
        <SessionHistory />
      </motion.div>
    </div>
  );
}
