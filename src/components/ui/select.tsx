'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, LucideIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

export interface SelectOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  labels: Record<string, React.ReactNode>;
  registerLabel: (value: string, label: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  options?: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  searchable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Universal Select component supporting both prop-based options and compound children.
 */
export const Select: React.FC<SelectProps> = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  onValueChange,
  options,
  placeholder = 'Select an option',
  label,
  error,
  helperText,
  searchable = false,
  className,
  children,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [labels, setLabels] = React.useState<Record<string, React.ReactNode>>({});
  const containerRef = React.useRef<HTMLDivElement>(null);

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = React.useCallback(
    (val: string) => {
      setInternalValue(val);
      onChange?.(val);
      onValueChange?.(val);
    },
    [onChange, onValueChange]
  );

  const registerLabel = React.useCallback((val: string, node: React.ReactNode) => {
    setLabels((prev) => (prev[val] === node ? prev : { ...prev, [val]: node }));
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // If children are provided, use compound component structure
  if (children) {
    return (
      <SelectContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          isOpen,
          setIsOpen,
          labels,
          registerLabel,
        }}
      >
        <div ref={containerRef} className={cn('relative w-full', className)}>
          {children}
        </div>
      </SelectContext.Provider>
    );
  }

  // Otherwise, use options-based rendering
  const opts = options || [];
  const selectedOption = opts.find((opt) => opt.value === currentValue);
  const filteredOptions = !searchable || !search
    ? opts
    : opts.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium leading-none text-foreground">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            error && 'border-destructive focus-visible:ring-destructive',
            !selectedOption && 'text-muted-foreground'
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon && <selectedOption.icon className="h-4 w-4" />}
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card text-card-foreground shadow-md backdrop-blur-xl"
            >
              {searchable && (
                <div className="sticky top-0 z-10 border-b border-border bg-card p-2">
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={Search}
                    className="h-8"
                  />
                </div>
              )}
              <ul className="p-1" role="listbox">
                {filteredOptions.length === 0 ? (
                  <li className="py-2 px-2 text-sm text-muted-foreground text-center">No results found</li>
                ) : (
                  filteredOptions.map((opt) => {
                    const isSelected = opt.value === currentValue;
                    return (
                      <li
                        key={opt.value}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          handleValueChange(opt.value);
                          setIsOpen(false);
                          setSearch('');
                        }}
                        className={cn(
                          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                          isSelected && 'bg-accent/50 text-accent-foreground font-medium'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {opt.icon && <opt.icon className="h-4 w-4" />}
                          {opt.label}
                        </span>
                        {isSelected && (
                          <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      {!error && helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
};

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => context?.setIsOpen((prev) => !prev)}
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue = ({
  placeholder = 'Select...',
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const context = React.useContext(SelectContext);
  const display = context?.value ? context.labels[context.value] || context.value : placeholder;

  return (
    <span className={cn('truncate', !context?.value && 'text-muted-foreground', className)}>
      {display}
    </span>
  );
};

export const SelectContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const context = React.useContext(SelectContext);

  return (
    <AnimatePresence>
      {context?.isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card text-card-foreground shadow-md backdrop-blur-xl p-1',
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SelectItem = ({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const context = React.useContext(SelectContext);
  const isSelected = context?.value === value;

  React.useEffect(() => {
    context?.registerLabel(value, children);
  }, [value, children, context]);

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        context?.onValueChange(value);
        context?.setIsOpen(false);
      }}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer',
        isSelected && 'bg-accent/50 text-accent-foreground font-medium',
        className
      )}
    >
      <span className="truncate">{children}</span>
      {isSelected && (
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
    </div>
  );
};
