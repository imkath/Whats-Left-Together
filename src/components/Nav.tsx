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
        <Link
          href={`/${locale}`}
          className="mr-6 flex items-center"
          aria-label="What's Left Together — Home"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-neutral-900 dark:text-white"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="4" height="4" rx="0.5" fill="currentColor" />
            <rect x="8" y="2" width="4" height="4" rx="0.5" fill="currentColor" />
            <rect x="14" y="2" width="4" height="4" rx="0.5" fill="currentColor" />
            <rect x="2" y="8" width="4" height="4" rx="0.5" fill="currentColor" />
            <rect x="8" y="8" width="4" height="4" rx="0.5" fill="currentColor" />
            <rect x="14" y="8" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.7" />
            <rect x="19" y="3" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
            <rect x="2" y="14" width="4" height="4" rx="0.5" fill="currentColor" />
            <rect x="8" y="14" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.7" />
            <rect x="14" y="14" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
            <rect x="3" y="20" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.5" />
            <rect
              x="9"
              y="19"
              width="1.5"
              height="1.5"
              rx="0.5"
              fill="currentColor"
              opacity="0.3"
            />
            <rect
              x="18"
              y="9"
              width="1.5"
              height="1.5"
              rx="0.5"
              fill="currentColor"
              opacity="0.3"
            />
            <rect x="20" y="7" width="1" height="1" rx="0.5" fill="currentColor" opacity="0.2" />
          </svg>
        </Link>
        <ul className="flex items-center gap-6">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors duration-200 pb-1 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm outline-none ${
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
