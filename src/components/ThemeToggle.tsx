'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-white dark:bg-neutral-700 shadow-md border border-neutral-200 dark:border-neutral-600"
        aria-label="Toggle theme"
      >
        <Sun size={18} className="text-neutral-600 dark:text-neutral-300" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-white hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 shadow-md border border-neutral-200 dark:border-neutral-500 transition-colors"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-amber-400" />
      ) : (
        <Moon size={18} className="text-neutral-600" />
      )}
    </button>
  );
}
