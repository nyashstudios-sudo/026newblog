import { cn } from '@/lib/utils';

export function Badge({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary-light)] text-[var(--primary)]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
