'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Productivity Score Widget
 * Circular gauge showing overall productivity score
 */
export function ProductivityScore() {
  const t = useTranslations('Dashboard.ProductivityScore');
  const score = 85;

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="p-6 h-full flex flex-col items-center justify-center bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 relative">
      <h2 className="text-sm font-semibold text-muted-foreground absolute top-4 left-4">{t('title')}</h2>
      
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
            transition={{ duration: 1.5, ease: "easeOut" }}
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
          <span className="text-3xl font-bold">{score}</span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="text-green-500 flex items-center"><TrendingUp size={16} className="mr-1"/> +5%</span>
        <span className="text-muted-foreground">{t('vsLastWeek')}</span>
      </div>
      <div className="mt-2 text-sm font-medium">{t('statusGreat')}</div>
    </Card>
  );
}
