'use client';

import { Component, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface ErrorBoundaryClassProps {
  children: ReactNode;
  fallback?: ReactNode;
  translations: {
    title: string;
    message: string;
    reload: string;
  };
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryClassProps, State> {
  constructor(props: ErrorBoundaryClassProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { translations } = this.props;

      return (
        <div className="card bg-red-50 border-red-200" role="alert">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-red-900 font-semibold mb-2">{translations.title}</h4>
              <p className="text-red-700 text-sm">{translations.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                {translations.reload}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper funcional para usar hooks de i18n
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const t = useTranslations('results.errors');

  const translations = {
    title: t('boundaryTitle'),
    message: t('boundaryMessage'),
    reload: t('boundaryReload'),
  };

  return (
    <ErrorBoundaryClass fallback={fallback} translations={translations}>
      {children}
    </ErrorBoundaryClass>
  );
}
