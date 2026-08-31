'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#a855f7', // purple
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#10b981', // emerald
];

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  allowCustom?: boolean;
  className?: string;
}

/**
 * A color picker component with presets and optional custom hex input.
 * @param {ColorPickerProps} props - The properties for the color picker.
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  allowCustom = true,
  className,
}) => {
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => {
          const isSelected = value.toLowerCase() === color.toLowerCase();
          return (
            <motion.button
              key={color}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(color)}
              className="group relative h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white drop-shadow-sm" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      {allowCustom && (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={value}
            onChange={handleCustomChange}
            placeholder="#000000"
            className="font-mono"
          />
          <div
            className="h-9 w-9 rounded-md border border-input shrink-0"
            style={{ backgroundColor: value || 'transparent' }}
          />
        </div>
      )}
    </div>
  );
};
