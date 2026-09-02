'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/use-tasks';
import { useTimeEntries } from '@/hooks/use-time-entries';

/**
 * Productivity Score Widget
 * Dynamically computes real productivity score from task completion & focus metrics.
 */
export function ProductivityScore() {
  const t = useTranslations('Dashboard.ProductivityScore');
  const { tasks } = useTasks();
  const { todayMinutes } = useTimeEntries();

  const nonDeleted = tasks.filter(t => !t.is_deleted);
  const completed = nonDeleted.filter(t => t.status === 'done');
  
  let score = 0;
  if (nonDeleted.length > 0) {
    const taskRatio = completed.length / nonDeleted.length;
    const focusBonus = Math.min(todayMinutes, 120) / 120;
    score = Math.min(100, Math.round(taskRatio * 70 + focusBonus * 30));
  } else if (todayMinutes > 0) {
    score = Math.min(100, Math.round(Math.min(todayMinutes, 120) / 120 * 100));
  }

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getStatusText = (s: number) => {
    if (s >= 80) return '최고 수준의 생산성 🔥';
    if (s >= 50) return '순조롭게 진행 중 🚀';
    if (s > 0) return '목표를 향해 나아가는 중 ✨';
    return '오늘의 첫 작업을 시작해보세요!';
  };

  return (
    <Card className="p-6 h-full flex flex-col items-center justify-center bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 relative shadow-lg">
      <h2 className="text-sm font-semibold text-muted-foreground absolute top-4 left-4 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        {t('title')}
      </h2>
      
      <div className="relative flex items-center justify-center w-32 h-32 mt-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted/20"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            className="text-primary"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold tracking-tight text-foreground">{score}</span>
          <span className="text-[10px] text-muted-foreground font-medium">{t('score')}</span>
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="text-emerald-500 font-semibold flex items-center">
          <TrendingUp size={14} className="mr-1"/>
          {completed.length}/{nonDeleted.length} 완료
        </span>
      </div>
      <div className="mt-1.5 text-xs font-medium text-muted-foreground text-center">
        {getStatusText(score)}
      </div>
    </Card>
  );
}
