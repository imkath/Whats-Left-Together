'use client';

import { useEffect, useCallback, useRef } from 'react';
import { AlertCircle, X, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EthicalWarningProps {
  onAccept: () => void;
}

export default function EthicalWarning({ onAccept }: EthicalWarningProps) {
  const t = useTranslations('ethical');
  const dialogRef = useRef<HTMLDivElement>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  // Handle ESC key to close (though for this warning, we require explicit acceptance)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      // For ethical warning, ESC should focus the accept button, not close
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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ethical-warning-title"
      aria-describedby="ethical-warning-description"
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full p-8"
      >
        <div className="mb-6 border-b border-neutral-200 dark:border-neutral-700 pb-4 flex items-center gap-3">
          <AlertCircle size={28} className="text-neutral-700 dark:text-neutral-300" />
          <h2
            id="ethical-warning-title"
            className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100"
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

          <div className="bg-red-50 dark:bg-red-950/50 border-l-4 border-red-400 dark:border-red-500 p-4 rounded">
            <p className="font-semibold mb-3 text-red-900 dark:text-red-100 flex items-center gap-2">
              <X size={20} className="text-red-600 dark:text-red-400" />
              {t('whatIsNot')}
            </p>
            <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
              <li className="flex items-start gap-2">
                <X size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <span>{t('notIs1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <X size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <span>{t('notIs2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <X size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <span>{t('notIs3')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-950/50 border-l-4 border-green-600 dark:border-green-500 p-4 rounded">
            <p className="font-semibold mb-3 text-green-900 dark:text-green-100 flex items-center gap-2">
              <Check size={20} className="text-green-600 dark:text-green-400" />
              {t('whatIs')}
            </p>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                />
                <span>{t('is1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                />
                <span>{t('is2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                />
                <span>{t('is3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                />
                <span>{t('is4')}</span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-neutral-700 dark:text-neutral-300">{t('useResponsibly')}</p>

          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('seekSupport')}</p>
        </div>

        <div className="mt-8 flex justify-end">
          <button ref={acceptButtonRef} onClick={onAccept} className="btn-primary" type="button">
            {t('understood')}
          </button>
        </div>
      </div>
    </div>
  );
}
