'use client';

import { useEffect, useCallback, useRef } from 'react';
import { WarningCircle, X, Check } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

interface EthicalWarningProps {
  onAccept: () => void;
}

export default function EthicalWarning({ onAccept }: EthicalWarningProps) {
  const t = useTranslations('ethical');
  const dialogRef = useRef<HTMLDivElement>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  // Handle ESC key and focus trap
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      // For ethical warning, ESC should focus the accept button, not close
      acceptButtonRef.current?.focus();
    }
    // Focus trap: only one interactive element (accept button), keep focus on it
    if (event.key === 'Tab') {
      event.preventDefault();
      acceptButtonRef.current?.focus();
    }
  }, []);

  // Focus trap and keyboard handling
  useEffect(() => {
    // Focus the dialog on mount
    acceptButtonRef.current?.focus();

    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ethical-warning-title"
      aria-describedby="ethical-warning-description"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 md:p-8 border border-neutral-200 dark:border-neutral-700"
      >
        <div className="text-center mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mx-auto mb-4">
            <WarningCircle
              size={24}
              weight="duotone"
              className="text-accent-600 dark:text-accent-400"
              aria-hidden="true"
            />
          </div>
          <h2
            id="ethical-warning-title"
            className="text-xl font-bold text-neutral-900 dark:text-neutral-100"
          >
            {t('warning')}
          </h2>
        </div>

        <div
          id="ethical-warning-description"
          className="space-y-4 text-neutral-700 dark:text-neutral-300"
        >
          <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {t('notMedical')}
          </p>

          <div className="bg-red-50/80 dark:bg-red-950/50 border-l-4 border-red-400 dark:border-red-500 p-4 rounded">
            <p className="font-semibold mb-3 text-red-900 dark:text-red-100 flex items-center gap-2">
              <X size={20} className="text-red-600 dark:text-red-400" aria-hidden="true" />
              {t('whatIsNot')}
            </p>
            <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
              <li className="flex items-start gap-2">
                <X
                  size={16}
                  className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{t('notIs1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <X
                  size={16}
                  className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{t('notIs2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <X
                  size={16}
                  className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{t('notIs3')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50/80 dark:bg-green-950/50 border-l-4 border-green-600 dark:border-green-500 p-4 rounded">
            <p className="font-semibold mb-3 text-green-900 dark:text-green-100 flex items-center gap-2">
              <Check size={20} className="text-green-600 dark:text-green-400" aria-hidden="true" />
              {t('whatIs')}
            </p>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{t('is1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{t('is2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{t('is3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{t('is4')}</span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-neutral-700 dark:text-neutral-300">{t('useResponsibly')}</p>

          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('seekSupport')}</p>
        </div>

        <div className="mt-8">
          <button
            ref={acceptButtonRef}
            onClick={onAccept}
            className="w-full btn-primary py-4 text-base"
            type="button"
          >
            {t('understood')}
          </button>
        </div>
      </div>
    </div>
  );
}
