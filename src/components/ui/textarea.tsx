'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
  showCount?: boolean;
  maxLength?: number;
}

/**
 * A stylized textarea component with optional auto-resize and character count.
 * @param {TextareaProps} props - The properties for the textarea.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, autoResize, showCount, maxLength, id, value, onChange, ...props }, ref) => {
    const inputId = id || React.useId();
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    const [charCount, setCharCount] = React.useState(0);

    React.useImperativeHandle(ref, () => innerRef.current!);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (autoResize && innerRef.current) {
        innerRef.current.style.height = 'auto';
        innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={innerRef}
          id={inputId}
          maxLength={maxLength}
          value={value}
          onChange={handleInput}
          aria-invalid={!!error}
          aria-describedby={cn(helperText && helperId, error && errorId)}
          className={cn(
            'flex min-h-[60px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground',
            autoResize && 'resize-none overflow-hidden',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />
        
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <AnimatePresence>
              {error && (
                <motion.p
                  id={errorId}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs font-medium text-destructive m-0"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            {!error && helperText && (
              <p id={helperId} className="text-xs text-muted-foreground m-0">
                {helperText}
              </p>
            )}
          </div>
          {showCount && (
            <div className="text-xs text-muted-foreground ml-2 shrink-0">
              {charCount}{maxLength ? ` / ${maxLength}` : ''}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
