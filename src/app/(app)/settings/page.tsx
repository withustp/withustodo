'use client';

import { useTranslations } from 'next-intl';
import { ProfileSection } from '@/components/settings/profile-section';
import { AppearanceSection } from '@/components/settings/appearance-section';
import { KakaoSection } from '@/components/settings/kakao-section';
import { ReminderSection } from '@/components/settings/reminder-section';
import { DataSection } from '@/components/settings/data-section';
import { motion } from 'framer-motion';

/**
 * Settings Page
 * User preferences and account management
 */
export default function SettingsPage() {
  const t = useTranslations('Settings');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-8"
      >
        <motion.div variants={itemVariants}>
          <ProfileSection />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <AppearanceSection />
        </motion.div>

        <motion.div variants={itemVariants}>
          <KakaoSection />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ReminderSection />
        </motion.div>

        <motion.div variants={itemVariants}>
          <DataSection />
        </motion.div>
      </motion.div>
    </div>
  );
}
