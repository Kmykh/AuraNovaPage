import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle' | 'card';
}

const variantStyles = {
  text: 'h-4 w-3/4 rounded-md',
  rect: 'rounded-md',
  circle: 'rounded-full',
  card: 'rounded-xl h-64 w-full',
};

export function Skeleton({ className = '', variant = 'rect', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-sage/20 ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
