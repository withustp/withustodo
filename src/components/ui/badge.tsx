'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BadgeProps extends Omit<HTMLMotionProps<'span'>, 'children'> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'high' | 'medium' | 'low' | 'none';
  size?: 'sm' | 'md';
  showDot?: boolean;
  children?: React.ReactNode;
}

const variantStyles = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80 border-transparent',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent',
  outline: 'text-foreground border-border',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-transparent',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-transparent',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent',
  high: 'bg-red-500/15 text-red-600 dark:text-red-400 border-transparent',
  medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-transparent',
  low: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-transparent',
  none: 'bg-muted text-muted-foreground border-transparent',
};

const dotColors = {
  default: 'bg-primary-foreground',
  secondary: 'bg-secondary-foreground',
  outline: 'bg-foreground',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  destructive: 'bg-destructive-foreground',
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
  none: 'bg-muted-foreground',
};

const sizeStyles = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
};

/**
 * A versatile badge component with multiple variants, priorities, and dot indicators.
 * @param {BadgeProps} props - The properties for the badge.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', showDot = false, children, ...props }, ref) => {
    return (
      <motion.span
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'inline-flex items-center rounded-full border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {showDot && (
          <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', dotColors[variant])} />
        )}
        {children}
      </motion.span>
    );
  }
);

Badge.displayName = 'Badge';
