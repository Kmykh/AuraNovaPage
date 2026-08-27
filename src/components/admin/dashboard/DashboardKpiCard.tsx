import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardKpiCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  color?: 'gold' | 'rose' | 'sage';
}

const colorStyles = {
  gold: {
    bg: 'bg-gold/10',
    text: 'text-gold',
    border: 'border-gold/20'
  },
  rose: {
    bg: 'bg-rose/10',
    text: 'text-rose',
    border: 'border-rose/20'
  },
  sage: {
    bg: 'bg-sage/10',
    text: 'text-sage',
    border: 'border-sage/20'
  }
};

export function DashboardKpiCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'gold'
}: DashboardKpiCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="bg-white rounded-2xl border border-sage/10 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-brown">{title}</h3>
          <p className="text-2xl font-serif font-bold text-brown">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${styles.bg} ${styles.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-sage/10">
        <p className="text-xs text-sage">{description}</p>
      </div>
    </div>
  );
}
