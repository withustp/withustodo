'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTimer } from '@/hooks/use-timer';
import { useTasks } from '@/hooks/use-tasks';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

/**
 * Pomodoro Timer Component
 * Circular SVG timer with controls
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

  const { tasks } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');
  const incompleteTasks = tasks.filter(t => t.status !== 'done');

  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-8 w-full max-w-xs">
        <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
          <SelectTrigger>
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
              className={`w-2 h-2 rounded-full ${i < sessionCount ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
      </div>

      <div className="relative w-72 h-72 mb-12 flex items-center justify-center">
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
          <span className="text-6xl font-bold tracking-tighter">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={reset}>
          <Square size={20} />
        </Button>
        <Button 
          size="icon" 
          className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          onClick={isRunning ? pause : start}
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </Button>
        <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={skip}>
          <SkipForward size={20} />
        </Button>
      </div>
    </div>
  );
}
