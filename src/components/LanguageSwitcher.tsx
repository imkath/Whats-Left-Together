'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

const OPTIONS = [
  { code: 'es', label: 'ES', aria: 'Ver en español' },
  { code: 'en', label: 'EN', aria: 'View in English' },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const switchLocale = (next: string) => {
    if (next === locale) return;
    const rest = pathname.split('/').filter(Boolean).slice(1).join('/');
    // The locale is the root layout segment, so a client-side push remounts <html>
    // and the theme class blinks off. A full load lets next-themes set it before paint.
    window.location.assign(`/${next}${rest ? `/${rest}` : ''}${window.location.search}`);
  };

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 p-0.5">
      {OPTIONS.map((o) => (
        <button
          key={o.code}
          type="button"
          lang={o.code}
          onClick={() => switchLocale(o.code)}
          aria-label={o.aria}
          aria-pressed={locale === o.code}
          className={`px-2.5 py-1 text-xs font-medium rounded-[4px] transition-colors duration-150 ${
            locale === o.code
              ? 'bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
