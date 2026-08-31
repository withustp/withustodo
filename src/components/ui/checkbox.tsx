'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: 'sm' | 'md';
  indeterminate?: boolean;
}

const sizeStyles = {
  sm: 'h-4 w-4 rounded-sm',
  md: 'h-5 w-5 rounded-md',
};

const tickVariants = {
  unchecked: { pathLength: 0, opacity: 0 },
  checked: { pathLength: 1, opacity: 1 },
};

/**
 * A highly customizable checkbox component with framer-motion SVG animations.
 * @param {CheckboxProps} props - The properties for the checkbox.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, size = 'md', checked, indeterminate, onChange, disabled, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const isChecked = Boolean(checked) || Boolean(indeterminate);

    return (
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'flex shrink-0 items-center justify-center border border-primary transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              sizeStyles[size],
              isChecked ? 'bg-primary' : 'bg-transparent',
              className
            )}
          >
            {indeterminate ? (
              <div className="h-0.5 w-2.5 bg-primary-foreground rounded-full" />
            ) : (
              <svg
                viewBox="0 0 14 14"
                fill="none"
                className={cn('text-primary-foreground', size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')}
              >
                <motion.path
                  d="M3 7.5L5.5 10L11 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={tickVariants}
                  initial="unchecked"
                  animate={isChecked ? 'checked' : 'unchecked'}
                />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
