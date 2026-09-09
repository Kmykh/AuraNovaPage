import React from 'react';
import { Badge } from '../ui/Badge';
import { Tag } from 'lucide-react';

interface CategoryBadgeProps {
  categoryName?: string | null;
  className?: string;
}

export function CategoryBadge({ categoryName, className = '' }: CategoryBadgeProps) {
  if (!categoryName) {
    return (
      <Badge variant="neutral" className={`flex items-center gap-1 opacity-70 ${className}`}>
        <Tag size={12} />
        <span>Sin categoría</span>
      </Badge>
    );
  }

  return (
    <Badge variant="pending" className={`flex items-center gap-1 ${className}`}>
      <Tag size={12} />
      <span>{categoryName}</span>
    </Badge>
  );
}
