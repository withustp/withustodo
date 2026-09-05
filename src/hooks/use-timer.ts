'use client';

import { useState, useEffect, useCallback } from 'react';

export type Phase = 'work' | 'break' | 'longBreak';

export interface TimerSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

/**
 * Enhanced useTimer Hook
 * Supports custom minute inputs, quick +/- adjustments, and phase switching with localStorage sync.
 */
export function useTimer() {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('withus_timer_settings');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  const [phase, setPhase] = useState<Phase>('work');
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const getDuration = useCallback((p: Phase, s: TimerSettings = settings) => {
    switch (p) {
      case 'work': return s.workMinutes * 60;
      case 'break': return s.breakMinutes * 60;
      case 'longBreak': return s.longBreakMinutes * 60;
      default: return s.workMinutes * 60;
    }
  }, [settings]);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('withus_timer_settings', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Set custom minutes directly for current phase
  const setCustomMinutes = useCallback((mins: number) => {
    const validMins = Math.max(1, Math.min(360, mins));
    if (phase === 'work') updateSettings({ workMinutes: validMins });
    else if (phase === 'break') updateSettings({ breakMinutes: validMins });
    else updateSettings({ longBreakMinutes: validMins });

    if (!isRunning) {
      setTimeRemaining(validMins * 60);
    }
  }, [phase, isRunning, updateSettings]);

  // Quick adjust (+/- seconds)
  const adjustTime = useCallback((deltaSeconds: number) => {
    setTimeRemaining((prev) => Math.max(10, prev + deltaSeconds));
  }, []);

  // Switch phase manually
  const switchPhase = useCallback((targetPhase: Phase) => {
    setIsRunning(false);
    setPhase(targetPhase);
    setTimeRemaining(getDuration(targetPhase));
  }, [getDuration]);

  const handlePhaseComplete = useCallback(() => {
    if (phase === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      if (newCount % settings.sessionsBeforeLongBreak === 0) {
        setPhase('longBreak');
        setTimeRemaining(settings.longBreakMinutes * 60);
      } else {
        setPhase('break');
        setTimeRemaining(settings.breakMinutes * 60);
      }
    } else {
      setPhase('work');
      setTimeRemaining(settings.workMinutes * 60);
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
    settings,
    duration: getDuration(phase),
    start,
    pause,
    reset,
    skip,
    switchPhase,
    setCustomMinutes,
    adjustTime,
    updateSettings,
  };
}
