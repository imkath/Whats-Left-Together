'use client'

import { AlertCircle, X, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface EthicalWarningProps {
  onAccept: () => void
}

export default function EthicalWarning({ onAccept }: EthicalWarningProps) {
  const t = useTranslations('ethical')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
        <div className="mb-6 border-b border-neutral-200 pb-4 flex items-center gap-3">
          <AlertCircle size={28} className="text-neutral-700" />
          <h2 className="text-2xl font-semibold text-neutral-900">{t('warning')}</h2>
        </div>

        <div className="space-y-4 text-neutral-700">
          <p className="text-lg font-medium text-neutral-900">
            {t('notMedical')}
          </p>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="font-semibold mb-3 text-neutral-900 flex items-center gap-2">
              <X size={20} className="text-red-600" />
              {t('whatIsNot')}
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <X size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <span>{t('notIs1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <X size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <span>{t('notIs2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <X size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <span>{t('notIs3')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
            <p className="font-semibold mb-3 text-neutral-900 flex items-center gap-2">
              <Check size={20} className="text-green-600" />
              {t('whatIs')}
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>{t('is1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>{t('is2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>{t('is3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>{t('is4')}</span>
              </li>
            </ul>
          </div>

          <p className="text-sm">
            {t('useResponsibly')}
          </p>

          <p className="text-sm text-neutral-600">
            {t('seekSupport')}
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onAccept} className="btn-primary">
            {t('understood')}
          </button>
        </div>
      </div>
    </div>
  )
}
