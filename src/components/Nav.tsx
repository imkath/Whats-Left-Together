'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { HamburgerMenu, CloseCircle, Home, Book, InfoCircle } from '@solar-icons/react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Nav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: `/${locale}`, label: t('home'), icon: Home },
    { href: `/${locale}/methodology`, label: t('methodology'), icon: Book },
    { href: `/${locale}/about`, label: t('about'), icon: InfoCircle },
  ];

  function isActive(href: string) {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(href);
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    },
    [mobileOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <nav
      aria-label="Site navigation"
      className="sticky top-0 z-40 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200/60 dark:border-neutral-800/60"
    >
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-12">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex-shrink-0 flex items-center"
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

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors duration-150 pb-1 focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 rounded-sm outline-none whitespace-nowrap ${
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

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        {/* Mobile: theme + language + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 outline-none"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <CloseCircle size={18} className="text-neutral-600 dark:text-neutral-300" />
            ) : (
              <HamburgerMenu size={18} className="text-neutral-600 dark:text-neutral-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-12 bg-black/30 z-30 md:hidden animate-[fadeIn_150ms_ease-out]"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        className={`absolute top-12 left-0 right-0 z-40 md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <ul className="flex flex-col px-3 pt-2 pb-1 gap-0.5">
            {links.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      active
                        ? 'text-accent-600 dark:text-accent-400 bg-accent-500/8 dark:bg-accent-500/10'
                        : 'text-neutral-600 dark:text-neutral-400 active:bg-neutral-100 dark:active:bg-neutral-800'
                    }`}
                  >
                    <Icon
                      size={16}
                      weight={active ? 'Bold' : 'Linear'}
                      className={
                        active ? 'text-accent-500' : 'text-neutral-400 dark:text-neutral-500'
                      }
                    />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
