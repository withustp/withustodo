'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const variantStyles = {
  primary: 'bg-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  destructive: 'bg-destructive',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

/**
 * A progress bar component with animated fill and color variants.
 * @param {ProgressProps} props - The properties for the progress component.
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = 'primary', size = 'md', showLabel, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {showLabel && (
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-foreground">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn('relative w-full overflow-hidden rounded-full bg-secondary', sizeStyles[size], className)}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          {...props}
        >
          <motion.div
            className={cn('h-full w-full flex-1 rounded-full transition-all', variantStyles[variant])}
            initial={{ x: '-100%' }}
            animate={{ x: `-${100 - percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';
