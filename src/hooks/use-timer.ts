'use client';

import { useState, useEffect, useCallback } from 'react';

type Phase = 'work' | 'break' | 'longBreak';

/**
 * useTimer Hook
 * Manages pomodoro timer state and logic
 */
export function useTimer() {
  const settings = {
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    sessionsBeforeLongBreak: 4,
  };

  const [phase, setPhase] = useState<Phase>('work');
  const [timeRemaining, setTimeRemaining] = useState(settings.workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const getDuration = useCallback((p: Phase) => {
    switch(p) {
      case 'work': return settings.workDuration;
      case 'break': return settings.breakDuration;
      case 'longBreak': return settings.longBreakDuration;
      default: return settings.workDuration;
    }
  }, []);

  const handlePhaseComplete = useCallback(() => {
    // Play sound here
    if (phase === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      if (newCount % settings.sessionsBeforeLongBreak === 0) {
        setPhase('longBreak');
        setTimeRemaining(settings.longBreakDuration);
      } else {
        setPhase('break');
        setTimeRemaining(settings.breakDuration);
      }
    } else {
      setPhase('work');
      setTimeRemaining(settings.workDuration);
    }
    setIsRunning(false);
  }, [phase, sessionCount, settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeRemaining === 0) {
      handlePhaseComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, handlePhaseComplete]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  
  const reset = () => {
    setIsRunning(false);
    setTimeRemaining(getDuration(phase));
  };

  const skip = () => {
    handlePhaseComplete();
  };

  return {
    timeRemaining,
    isRunning,
    phase,
    sessionCount,
    start,
    pause,
    reset,
    skip,
    duration: getDuration(phase)
  };
}
