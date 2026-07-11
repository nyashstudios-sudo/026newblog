import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatsCard({ label, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-[var(--card-shadow)]',
        className
      )}
    >
      <Icon className="w-5 h-5 text-[var(--primary)] mb-3" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      {trend && <p className="text-xs text-[var(--primary)] mt-1">{trend}</p>}
    </div>
  );
}
