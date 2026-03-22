'use client';

import { Moon, Sun } from '@solar-icons/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 outline-none"
        aria-label="Toggle theme"
      >
        <Sun size={18} className="text-neutral-500 dark:text-neutral-400" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 outline-none"
      aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun size={18} className="text-amber-400" />
      ) : (
        <Moon size={18} className="text-neutral-500" />
      )}
    </button>
  );
}
