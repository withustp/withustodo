'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Play, Pause, Square, SkipForward, CheckCircle, Plus, Minus, Settings2, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimer, Phase } from '@/hooks/use-timer';
import { useTasks } from '@/hooks/use-tasks';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * World-class Pomodoro Timer with custom minute input and presets
 */
export function PomodoroTimer() {
  const t = useTranslations('Focus.Timer');
  const { 
    timeRemaining, 
    isRunning, 
    phase, 
    sessionCount, 
    settings,
    duration,
    start, 
    pause, 
    reset, 
    skip,
    switchPhase,
    setCustomMinutes,
    adjustTime,
    updateSettings,
  } = useTimer();

  const { tasks } = useTasks();
  const { addTimeEntry } = useTimeEntries();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customInputMins, setCustomInputMins] = useState<number>(Math.ceil(timeRemaining / 60));
  
  const incompleteTasks = tasks.filter(t => t.status !== 'done' && !t.is_deleted);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const circumference = 2 * Math.PI * 120;
  const progress = duration > 0 ? timeRemaining / duration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const getPhaseColor = () => {
    switch(phase) {
      case 'work': return 'var(--primary)';
      case 'break': return '#10b981'; // emerald
      case 'longBreak': return '#f59e0b'; // amber
      default: return 'var(--primary)';
    }
  };

  // Auto-log to DB when work phase finishes
  useEffect(() => {
    if (timeRemaining === 0 && phase === 'work') {
      const loggedMins = Math.round(duration / 60) || 25;
      addTimeEntry({
        duration_minutes: loggedMins,
        task_id: selectedTaskId,
        type: 'pomodoro'
      });
      toast.success(`🎉 ${loggedMins}분 집중 세션이 데이터베이스에 기록되었습니다!`);
    }
  }, [timeRemaining, phase, selectedTaskId, addTimeEntry, duration]);

  const handleManualComplete = async () => {
    const elapsedMinutes = Math.max(1, Math.round((duration - timeRemaining) / 60));
    await addTimeEntry({
      duration_minutes: elapsedMinutes,
      task_id: selectedTaskId,
      type: 'pomodoro'
    });
    toast.success(`${elapsedMinutes}분 집중 세션이 성공적으로 저장되었습니다.`);
    reset();
  };

  const handleApplyCustomMinutes = () => {
    if (customInputMins && customInputMins > 0) {
      setCustomMinutes(Number(customInputMins));
      setIsCustomModalOpen(false);
      toast.success(`타이머가 ${customInputMins}분으로 설정되었습니다.`);
    }
  };

  const workPresets = [15, 25, 30, 45, 60, 90];
  const breakPresets = [3, 5, 10, 15, 20];

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* 1. Phase Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/40 backdrop-blur-md rounded-xl border border-border/60 mb-6 shadow-sm">
        <button
          onClick={() => switchPhase('work')}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
            phase === 'work' 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          집중 세션
        </button>
        <button
          onClick={() => switchPhase('break')}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
            phase === 'break' 
              ? "bg-emerald-500 text-white shadow-md" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          짧은 휴식
        </button>
        <button
          onClick={() => switchPhase('longBreak')}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
            phase === 'longBreak' 
              ? "bg-amber-500 text-white shadow-md" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          긴 휴식
        </button>
      </div>

      {/* 2. Task Selector */}
      <div className="mb-6 w-full">
        <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
          <SelectTrigger className="bg-background/60 backdrop-blur-md border-border/80 shadow-sm text-sm">
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

      {/* 3. Preset Minute Chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6">
        {(phase === 'work' ? workPresets : breakPresets).map((mins) => {
          const isCurrentDuration = Math.round(duration / 60) === mins;
          return (
            <button
              key={mins}
              onClick={() => {
                setCustomMinutes(mins);
                toast.success(`${mins}분으로 변경되었습니다.`);
              }}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                isCurrentDuration
                  ? "border-primary bg-primary/15 text-primary font-semibold shadow-sm"
                  : "border-border/60 bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {mins}분
            </button>
          );
        })}
        <button
          onClick={() => {
            setCustomInputMins(Math.ceil(timeRemaining / 60));
            setIsCustomModalOpen(true);
          }}
          className="px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
        >
          <Sliders size={12} />
          직접 입력
        </button>
      </div>

      {/* 4. Circular Timer Display */}
      <div className="relative w-72 h-72 mb-6 flex items-center justify-center">
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
            transition={{ duration: 0.5, ease: "linear" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Clickable Time Number to Open Custom Input */}
        <div 
          onClick={() => {
            if (!isRunning) {
              setCustomInputMins(Math.ceil(timeRemaining / 60));
              setIsCustomModalOpen(true);
            }
          }}
          className={cn(
            "absolute flex flex-col items-center font-mono cursor-pointer group",
            !isRunning && "hover:scale-105 transition-transform"
          )}
          title={!isRunning ? "클릭하여 시간 직접 변경" : undefined}
        >
          <span className="text-6xl font-extrabold tracking-tighter text-foreground drop-shadow-sm">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          {!isRunning && (
            <span className="text-[10px] text-muted-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-1">
              <Sliders size={10} /> 클릭하여 시간 수정
            </span>
          )}
        </div>
      </div>

      {/* 5. Quick +/- Adjuster Buttons */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustTime(-60)}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border/60 bg-background/40"
          title="1분 줄이기"
        >
          -1분
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustTime(-300)}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border/60 bg-background/40"
          title="5분 줄이기"
        >
          -5분
        </Button>
        <div className="w-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustTime(300)}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border/60 bg-background/40"
          title="5분 늘리기"
        >
          +5분
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => adjustTime(600)}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border/60 bg-background/40"
          title="10분 늘리기"
        >
          +10분
        </Button>
      </div>

      {/* 6. Primary Controls (Play / Pause / Reset / Skip) */}
      <div className="flex items-center gap-4 mb-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="w-12 h-12 rounded-full border-border/80 hover:bg-muted" 
          onClick={reset} 
          title="초기화"
        >
          <Square size={18} />
        </Button>
        <Button 
          size="icon" 
          className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl scale-105 active:scale-95 transition-transform"
          onClick={isRunning ? pause : start}
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-12 h-12 rounded-full border-border/80 hover:bg-muted" 
          onClick={skip} 
          title="건너뛰기"
        >
          <SkipForward size={18} />
        </Button>
      </div>

      {/* 7. Save Session Button (if running or elapsed) */}
      {(isRunning || timeRemaining < duration) && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleManualComplete}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5 mt-2"
        >
          <CheckCircle size={14} className="text-emerald-500" />
          현재까지 진행된 집중 세션 저장
        </Button>
      )}

      {/* 8. Custom Duration Modal */}
      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent className="sm:max-w-[360px] bg-card/95 backdrop-blur-2xl border-border/80">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Sliders size={18} className="text-primary" />
              타이머 시간 직접 설정
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                원하는 분(Minutes)을 직접 입력하세요:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={360}
                  value={customInputMins}
                  onChange={(e) => setCustomInputMins(Math.max(1, Math.min(360, Number(e.target.value))))}
                  className="text-center font-mono text-lg font-bold h-12 bg-background/60"
                  autoFocus
                />
                <span className="text-sm font-semibold text-muted-foreground">분</span>
              </div>
            </div>

            {/* Quick Chips inside modal */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[10, 20, 25, 30, 45, 50, 60, 90, 120].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCustomInputMins(m)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs border transition-colors",
                    customInputMins === m 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-muted/40 hover:bg-muted text-muted-foreground"
                  )}
                >
                  {m}분
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsCustomModalOpen(false)}>
              취소
            </Button>
            <Button size="sm" onClick={handleApplyCustomMinutes}>
              설정 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
