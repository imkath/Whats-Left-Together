'use client';

import { useEffect, useCallback, useRef } from 'react';
import { ShieldWarning, CloseCircle, Checklist } from '@solar-icons/react';
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ethical-warning-title"
      aria-describedby="ethical-warning-description"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-xl w-full border border-neutral-200 dark:border-neutral-700 flex flex-col max-h-[calc(100dvh-1.5rem)] md:max-h-[calc(100dvh-2rem)]"
      >
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 min-h-0 p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="w-10 h-10 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
              <ShieldWarning
                size={22}
                weight="BoldDuotone"
                className="text-accent-600 dark:text-accent-400"
                aria-hidden="true"
              />
            </div>
            <h2
              id="ethical-warning-title"
              className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100"
            >
              {t('warning')}
            </h2>
          </div>

          <div
            id="ethical-warning-description"
            className="space-y-3 text-neutral-700 dark:text-neutral-300"
          >
            <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              {t('notMedical')}
            </p>

            <div className="bg-red-50/80 dark:bg-red-950/50 border-l-4 border-red-400 dark:border-red-500 p-3 rounded">
              <p className="font-semibold mb-2 text-sm text-red-900 dark:text-red-100 flex items-center gap-2">
                <CloseCircle
                  size={18}
                  className="text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
                {t('whatIsNot')}
              </p>
              <ul className="space-y-1 text-xs text-red-800 dark:text-red-200">
                <li className="flex items-start gap-1.5">
                  <CloseCircle
                    size={14}
                    className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t('notIs1')}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CloseCircle
                    size={14}
                    className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t('notIs2')}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CloseCircle
                    size={14}
                    className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t('notIs3')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50/80 dark:bg-green-950/50 border-l-4 border-green-600 dark:border-green-500 p-3 rounded">
              <p className="font-semibold mb-2 text-sm text-green-900 dark:text-green-100 flex items-center gap-2">
                <Checklist
                  size={18}
                  className="text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />
                {t('whatIs')}
              </p>
              <ul className="space-y-1 text-xs text-green-800 dark:text-green-200">
                <li className="flex items-start gap-1.5">
                  <Checklist
                    size={14}
                    className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t('is1')}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Checklist
                    size={14}
                    className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t('is2')}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Checklist
                    size={14}
                    className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t('is3')}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Checklist
                    size={14}
                    className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t('is4')}</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400">{t('useResponsibly')}</p>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('seekSupport')}</p>
          </div>
        </div>

        {/* Sticky button at bottom */}
        <div className="flex-shrink-0 p-4 md:px-8 md:pb-6 border-t border-neutral-200 dark:border-neutral-700">
          <button
            ref={acceptButtonRef}
            onClick={onAccept}
            className="w-full btn-primary py-3 md:py-4 text-sm md:text-base"
            type="button"
          >
            {t('understood')}
          </button>
        </div>
      </div>
    </div>
  );
}
