'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { TodaySummary } from '@/components/dashboard/today-summary';
import { WeeklyChart } from '@/components/dashboard/weekly-chart';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { StreakCounter } from '@/components/dashboard/streak-counter';
import { TimeSpent } from '@/components/dashboard/time-spent';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { PriorityDistribution } from '@/components/dashboard/priority-distribution';
import { ProductivityScore } from '@/components/dashboard/productivity-score';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

/**
 * Dashboard Page
 * Main landing page for authenticated users showing summary widgets.
 */
export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        const effectiveName = profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
        setUserName(effectiveName);
      }
    };
    fetchUser();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const today = format(new Date(), 'EEEE, MMMM do');

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting()}, {userName}
        </h1>
        <p className="text-muted-foreground">{today}</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
          <TodaySummary />
        </motion.div>
        
        <motion.div variants={itemVariants} className="col-span-1">
          <ProductivityScore />
        </motion.div>
        
        <motion.div variants={itemVariants} className="col-span-1">
          <StreakCounter />
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2">
          <WeeklyChart />
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-1 md:col-span-1 lg:col-span-1">
          <CategoryBreakdown />
        </motion.div>
        
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-1 lg:col-span-1">
          <TimeSpent />
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
          <PriorityDistribution />
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2">
          <UpcomingDeadlines />
        </motion.div>
      </motion.div>
    </div>
  );
}
