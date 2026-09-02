'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, Trophy, Check, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { format } from 'date-fns';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Smart Notification Center connected to live user tasks & milestones.
 */
export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const t = useTranslations('Notifications');
  const panelRef = useRef<HTMLDivElement>(null);
  const { tasks } = useTasks();
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Generate dynamic real notifications from user data
  const dynamicNotifications = useMemo(() => {
    const list: Array<{ id: string; type: 'reminder' | 'system' | 'achievement'; title: string; message: string; time: string }> = [];

    const now = new Date();
    const todayStr = now.toDateString();

    const overdueTasks = tasks.filter(t => !t.is_deleted && t.status !== 'done' && t.due_date && new Date(t.due_date) < now);
    const todayTasks = tasks.filter(t => !t.is_deleted && t.status !== 'done' && t.due_date && new Date(t.due_date).toDateString() === todayStr);
    const completedTasks = tasks.filter(t => !t.is_deleted && t.status === 'done');

    if (overdueTasks.length > 0) {
      list.push({
        id: 'overdue-alert',
        type: 'reminder',
        title: `기한 초과 작업 (${overdueTasks.length}건)`,
        message: `'${overdueTasks[0].title}' 등의 마감 기한이 지났습니다. 일정을 확인해주세요.`,
        time: '지금'
      });
    }

    if (todayTasks.length > 0) {
      list.push({
        id: 'today-deadline',
        type: 'reminder',
        title: `오늘 마감 예정 (${todayTasks.length}건)`,
        message: `'${todayTasks[0].title}' 작업이 오늘 마감됩니다.`,
        time: '오늘'
      });
    }

    if (completedTasks.length >= 5) {
      list.push({
        id: 'task-milestone',
        type: 'achievement',
        title: '생산성 마일스톤 달성! 🏆',
        message: `총 ${completedTasks.length}개의 할 일을 성공적으로 완료하셨습니다.`,
        time: '오늘'
      });
    }

    list.push({
      id: 'welcome-withus',
      type: 'system',
      title: 'WithUs Todo에 오신 것을 환영합니다! ✨',
      message: '할 일을 체계적으로 관리하고 카카오톡 스마트 알림을 설정해보세요.',
      time: '시스템'
    });

    return list;
  }, [tasks]);

  const markAllRead = () => {
    setReadIds(dynamicNotifications.map(n => n.id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'system': return <Sparkles className="h-4 w-4 text-primary" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-border/60 p-4 bg-background/50">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-primary" />
              {t('title')}
            </h3>
            <button 
              onClick={markAllRead}
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <Check className="h-3 w-3" />
              {t('markAllRead')}
            </button>
          </div>
          <div className="max-h-[380px] overflow-y-auto p-2">
            {dynamicNotifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {t('empty')}
              </div>
            ) : (
              <div className="space-y-1.5">
                {dynamicNotifications.map((notif) => {
                  const isRead = readIds.includes(notif.id);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => setReadIds(prev => [...prev, notif.id])}
                      className={cn(
                        "w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border border-transparent",
                        !isRead ? "bg-primary/5 hover:bg-primary/10 border-primary/20 shadow-sm" : "hover:bg-muted/40"
                      )}
                    >
                      <div className="mt-0.5 h-8 w-8 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border shadow-inner">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                          <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
