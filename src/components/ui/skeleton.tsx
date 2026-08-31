import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

/**
 * A loading skeleton component to display while content is fetching.
 * @param {SkeletonProps} props - The properties for the skeleton.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, style, ...props }, ref) => {
    const variantStyles = {
      text: 'rounded-md',
      circular: 'rounded-full',
      rectangular: 'rounded-xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-muted',
          variantStyles[variant],
          className
        )}
        style={{ width, height, ...style }}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

/**
 * A preset skeleton layout for task cards.
 */
export const SkeletonCard = () => (
  <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width={150} height={20} />
      </div>
      <Skeleton variant="circular" width={24} height={24} />
    </div>
    <div className="pl-8">
      <Skeleton variant="text" width="90%" height={16} className="mb-2" />
      <Skeleton variant="text" width="60%" height={16} />
    </div>
    <div className="flex justify-between items-center pl-8 mt-2">
      <Skeleton variant="text" width={80} height={24} className="rounded-full" />
      <Skeleton variant="circular" width={28} height={28} />
    </div>
  </div>
);
