'use client';

import { useState, useEffect, useRef } from 'react';
import { CloseCircle, SendSquare } from '@solar-icons/react';
import { useTranslations, useLocale } from 'next-intl';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';
type FeedbackType = 'suggestion' | 'bug' | 'other';

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const t = useTranslations('feedback');
  const locale = useLocale();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const openedAt = useRef(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      openedAt.current = Date.now();
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const reset = () => {
    setMessage('');
    setEmail('');
    setWebsite('');
    setFeedbackType('suggestion');
    setStatus('idle');
  };

  const handleClose = () => {
    if (status === 'sent') reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5 || status === 'sending') return;

    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          message: message.trim(),
          email: email.trim(),
          locale,
          website,
          elapsedMs: Date.now() - openedAt.current,
        }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-950/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
      aria-describedby="feedback-description"
    >
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 id="feedback-title" className="text-lg font-bold">
            {t('title')}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="btn-quiet -mr-3"
            aria-label={t('close')}
          >
            <CloseCircle size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          {status === 'sent' ? (
            <div className="py-6" role="status">
              <h3 className="text-lg font-bold mb-2">{t('successTitle')}</h3>
              <p className="text-neutral-600 dark:text-neutral-400">{t('successMessage')}</p>
              <button type="button" onClick={handleClose} className="btn-secondary mt-6">
                {t('close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <p
                id="feedback-description"
                className="text-sm text-neutral-600 dark:text-neutral-400"
              >
                {t('intro')}
              </p>

              <div>
                <span id="feedback-type-label" className="field-label">
                  {t('typeLabel')}
                </span>
                <div
                  className="grid grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-labelledby="feedback-type-label"
                >
                  {(['suggestion', 'bug', 'other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="radio"
                      aria-checked={feedbackType === type}
                      onClick={() => setFeedbackType(type)}
                      className="choice text-center"
                    >
                      {t(`types.${type}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="feedback-message" className="field-label">
                  {t('messageLabel')}
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  required
                  className="input-field resize-y"
                  placeholder={t(`messagePlaceholders.${feedbackType}`)}
                />
              </div>

              <div>
                <label htmlFor="feedback-email" className="field-label">
                  {t('emailLabel')}{' '}
                  <span className="font-normal text-neutral-500">({t('optional')})</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={254}
                  autoComplete="email"
                  spellCheck={false}
                  className="input-field"
                  placeholder={t('emailPlaceholder')}
                />
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  {t('emailNote')}
                </p>
              </div>

              {/* Hidden from people and assistive tech; bots tend to fill it. */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="feedback-website">Website</label>
                <input
                  id="feedback-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              {status === 'error' && (
                <p
                  role="alert"
                  className="text-sm px-4 py-3 surface border border-neutral-900 dark:border-neutral-100"
                >
                  {t('errorMessage')}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending' || message.trim().length < 5}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SendSquare size={18} aria-hidden="true" />
                {status === 'sending' ? t('sending') : t('send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
