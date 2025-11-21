'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;

    // Extract path without locale prefix
    const segments = pathname.split('/').filter(Boolean);
    const pathWithoutLocale = segments.length > 1 ? `/${segments.slice(1).join('/')}` : '';

    // Navigate to new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-300 dark:border-neutral-600 overflow-hidden flex items-center gap-1 p-1">
      <div className="px-2 text-neutral-500 dark:text-neutral-400">
        <Languages size={16} />
      </div>
      <button
        onClick={() => switchLocale('es')}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
          locale === 'es'
            ? 'bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => switchLocale('en')}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
          locale === 'en'
            ? 'bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
        }`}
      >
        EN
      </button>
    </div>
  );
}
