'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
}

const sizeStyles = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-12 w-12 text-base',
};

const indicatorSizeStyles = {
  sm: 'h-1.5 w-1.5 border-[1px]',
  md: 'h-2 w-2 border-2',
  lg: 'h-2.5 w-2.5 border-2',
  xl: 'h-3 w-3 border-2',
};

/**
 * Avatar component displaying an image with fallback to initials and an optional online indicator.
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', isOnline, children, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 overflow-hidden rounded-full',
          !children && sizeStyles[size],
          className
        )}
        {...props}
      >
        {children ? (
          children
        ) : (
          <>
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-muted border border-border">
              {src && !imageError ? (
                <Image
                  src={src}
                  alt={alt || 'Avatar'}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="font-medium uppercase text-muted-foreground">
                  {fallback?.substring(0, 2) || alt?.substring(0, 2) || '?'}
                </span>
              )}
            </div>
            {isOnline !== undefined && (
              <span
                className={cn(
                  'absolute bottom-0 right-0 rounded-full border-background bg-emerald-500',
                  indicatorSizeStyles[size]
                )}
              />
            )}
          </>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

/**
 * Avatar image subcomponent.
 */
export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, alt, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(!src);

  if (hasError || !src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt || 'Avatar'}
      onError={() => setHasError(true)}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  );
});
AvatarImage.displayName = 'AvatarImage';

/**
 * Avatar fallback subcomponent when no image is present.
 */
export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';
