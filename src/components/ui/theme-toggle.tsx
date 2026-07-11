'use client';

import { useTheme } from '@/components/providers/theme-provider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="w-10 h-10 rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] flex items-center justify-center hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-[18px] h-[18px] text-[var(--text-primary)]" />
      ) : (
        <Moon className="w-[18px] h-[18px] text-[var(--text-primary)]" />
      )}
    </button>
  );
}
