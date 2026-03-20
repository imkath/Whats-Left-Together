'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

export default function Nav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/methodology`, label: t('methodology') },
    { href: `/${locale}/about`, label: t('about') },
  ];

  function isActive(href: string) {
    // Exact match for home, prefix match for subpages
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Site navigation"
      className="sticky top-0 z-40 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800"
    >
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-12">
        <ul className="flex items-center gap-6">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors pb-1 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm outline-none ${
                    active
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-[7px] h-0.5 bg-neutral-900 dark:bg-white rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
