import React from 'react';

interface DividerProps {
  className?: string;
}

export function Divider({ className = '' }: DividerProps) {
  return (
    <hr className={`w-full border-t border-sage/20 my-4 ${className}`} />
  );
}
