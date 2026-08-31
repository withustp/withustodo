'use client';

import * as React from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  showTime?: boolean;
  className?: string;
  placeholder?: string;
}

/**
 * A date picker component with an animated calendar dropdown.
 * @param {DatePickerProps} props - The properties for the date picker.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  showTime = false,
  className,
  placeholder = 'Select date',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(value || new Date());
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (value) setCurrentMonth(value);
  }, [value]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const days = React.useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateSelect = (date: Date) => {
    if (value && showTime) {
      date.setHours(value.getHours(), value.getMinutes());
    }
    onChange(date);
    if (!showTime) setIsOpen(false);
  };

  const formattedValue = value ? format(value, showTime ? 'PPp' : 'PPP') : '';

  return (
    <div className="relative" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        <Input
          readOnly
          placeholder={placeholder}
          value={formattedValue}
          leftIcon={CalendarIcon}
          className={cn('cursor-pointer', className)}
        />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 mt-1 w-72 rounded-md border border-border bg-card p-3 shadow-md backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-7 w-7">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-sm">
              {Array.from({ length: days[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day, i) => {
                const isSelected = value && isSameDay(day, value);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);
                
                return (
                  <button
                    key={i}
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      'h-8 w-8 rounded-md flex items-center justify-center transition-colors',
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground',
                      !isCurrentMonth && 'text-muted-foreground opacity-50',
                      today && !isSelected && 'text-primary font-bold'
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
