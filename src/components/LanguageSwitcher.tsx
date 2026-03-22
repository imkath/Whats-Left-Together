'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;

    const segments = pathname.split('/').filter(Boolean);
    const pathWithoutLocale = segments.length > 1 ? `/${segments.slice(1).join('/')}` : '';

    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-neutral-200/60 dark:bg-neutral-700/60 p-0.5">
      <button
        onClick={() => switchLocale('es')}
        aria-label="Cambiar a español"
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 ${
          locale === 'es'
            ? 'bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => switchLocale('en')}
        aria-label="Switch to English"
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 ${
          locale === 'en'
            ? 'bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
        }`}
      >
        EN
      </button>
    </div>
  );
}
