'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Play, Pause, Square, SkipForward, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTimer } from '@/hooks/use-timer';
import { useTasks } from '@/hooks/use-tasks';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';

/**
 * Pomodoro Timer Component connected to Supabase time_entries
 */
export function PomodoroTimer() {
  const t = useTranslations('Focus.Timer');
  const { 
    timeRemaining, 
    isRunning, 
    phase, 
    sessionCount, 
    start, 
    pause, 
    reset, 
    skip,
    duration
  } = useTimer();

  const { tasks } = useTasks();
  const { addTimeEntry } = useTimeEntries();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');
  const incompleteTasks = tasks.filter(t => t.status !== 'done' && !t.is_deleted);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const circumference = 2 * Math.PI * 120;
  const progress = timeRemaining / duration;
  const strokeDashoffset = circumference - progress * circumference;

  const getPhaseColor = () => {
    switch(phase) {
      case 'work': return 'var(--primary)';
      case 'break': return 'var(--success)';
      case 'longBreak': return 'var(--warning)';
      default: return 'var(--primary)';
    }
  };

  // Auto-log to DB when work phase finishes
  useEffect(() => {
    if (timeRemaining === 0 && phase === 'work') {
      addTimeEntry({
        duration_minutes: 25,
        task_id: selectedTaskId,
        type: 'pomodoro'
      });
      toast.success('🎉 25분 집중 세션이 데이터베이스에 기록되었습니다!');
    }
  }, [timeRemaining, phase, selectedTaskId, addTimeEntry]);

  const handleManualComplete = async () => {
    const elapsedMinutes = Math.max(1, Math.round((duration - timeRemaining) / 60));
    await addTimeEntry({
      duration_minutes: elapsedMinutes || 25,
      task_id: selectedTaskId,
      type: 'pomodoro'
    });
    toast.success(`${elapsedMinutes}분 집중 세션이 저장되었습니다.`);
    reset();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-8 w-full max-w-xs">
        <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
          <SelectTrigger className="bg-background/60 backdrop-blur-md border-border/80 shadow-sm">
            <SelectValue placeholder={t('selectTask')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('noTask')}</SelectItem>
            {incompleteTasks.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight capitalize" style={{ color: getPhaseColor() }}>
          {t(`phases.${phase}`)}
        </h2>
        <div className="flex gap-2 justify-center mt-2">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all ${i < sessionCount ? 'bg-primary scale-110 shadow-sm' : 'bg-muted/40'}`}
            />
          ))}
        </div>
      </div>

      <div className="relative w-72 h-72 mb-8 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted/20"
          />
          <motion.circle
            cx="144"
            cy="144"
            r="120"
            stroke={getPhaseColor()}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center font-mono">
          <span className="text-6xl font-extrabold tracking-tighter text-foreground">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border/80" onClick={reset} title="초기화">
          <Square size={18} />
        </Button>
        <Button 
          size="icon" 
          className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl scale-105 active:scale-95 transition-transform"
          onClick={isRunning ? pause : start}
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </Button>
        <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border/80" onClick={skip} title="건너뛰기">
          <SkipForward size={18} />
        </Button>
      </div>

      {isRunning && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleManualComplete}
          className="text-xs text-muted-foreground hover:text-foreground gap-1 mt-2"
        >
          <CheckCircle size={14} className="text-emerald-500" />
          현재까지 진행된 세션 완료 저장
        </Button>
      )}
    </div>
  );
}
