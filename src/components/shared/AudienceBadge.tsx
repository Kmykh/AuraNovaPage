import React from 'react';
import { Badge } from '../ui/Badge';
import { Users } from 'lucide-react';
import { ProductAudience } from '../../types/categories';

interface AudienceBadgeProps {
  audience?: ProductAudience | null;
  className?: string;
}

export function AudienceBadge({ audience, className = '' }: AudienceBadgeProps) {
  if (!audience) {
    return (
      <Badge variant="neutral" className={`flex items-center gap-1 opacity-70 ${className}`}>
        <Users size={12} />
        <span>Sin público</span>
      </Badge>
    );
  }

  // Choose a nice variant based on audience if desired, or keep uniform
  let variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending' = 'success';
  if (audience === 'Chicos') variant = 'info';
  if (audience === 'Chicas') variant = 'error'; // Error acts as red/pinkish in some themes, let's stick to info/success/pending
  
  // Actually, wait, let's use the neutral/pending/success from Aura Nova:
  // success is 'sage', pending is 'gold', info is blueish. We will just use 'success' (sage) as a nice gentle color.
  
  return (
    <Badge variant="success" className={`flex items-center gap-1 ${className}`}>
      <Users size={12} />
      <span>{audience}</span>
    </Badge>
  );
}
