'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import type { RelationshipInput, Sex, RelationType } from '@/types'
import Results from './Results'
import { getAvailableCountries } from '@/lib/data'

export default function Calculator() {
  const t = useTranslations('calculator')
  const locale = useLocale()
  const countries = getAvailableCountries()

  const [formData, setFormData] = useState<RelationshipInput>({
    you: {
      age: 30,
      sex: 'female' as Sex,
      country: 'CHL',
    },
    them: {
      age: 55,
      sex: 'female' as Sex,
      country: 'CHL',
    },
    relationType: 'mother' as RelationType,
    visitsPerYear: 12,
  })

  const [showResults, setShowResults] = useState(false)
  const [directMode, setDirectMode] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowResults(true)
  }

  const updateFormData = (section: 'you' | 'them', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      }
    }))
  }

  return (
    <div id="calculator" className="space-y-8">
      <div className="text-center mb-8">
        <h2>{t('title')}</h2>
        <p className="text-neutral-600 mt-2">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-3xl mx-auto">
        {/* Your information */}
        <div className="mb-8">
          <h3 className="text-xl mb-4 pb-2 border-b border-neutral-200">
            {t('yourInfo')}
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('age')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.you.age}
                onChange={(e) => updateFormData('you', 'age', parseInt(e.target.value) || 0)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('sex')}
              </label>
              <select
                value={formData.you.sex}
                onChange={(e) => updateFormData('you', 'sex', e.target.value)}
                className="input-field"
                required
              >
                <option value="female">{t('female')}</option>
                <option value="male">{t('male')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('country')}
              </label>
              <select
                value={formData.you.country}
                onChange={(e) => updateFormData('you', 'country', e.target.value)}
                className="input-field"
                required
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {locale === 'es' ? country.nameEs : country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Their information */}
        <div className="mb-8">
          <h3 className="text-xl mb-4 pb-2 border-b border-neutral-200">
            {t('theirInfo')}
          </h3>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('relationship')}
              </label>
              <select
                value={formData.relationType}
                onChange={(e) => setFormData(prev => ({ ...prev, relationType: e.target.value as RelationType }))}
                className="input-field"
                required
              >
                <option value="mother">{t('relations.mother')}</option>
                <option value="father">{t('relations.father')}</option>
                <option value="grandmother_maternal">{t('relations.grandmother_maternal')}</option>
                <option value="grandmother_paternal">{t('relations.grandmother_paternal')}</option>
                <option value="grandfather_maternal">{t('relations.grandfather_maternal')}</option>
                <option value="grandfather_paternal">{t('relations.grandfather_paternal')}</option>
                <option value="partner">{t('relations.partner')}</option>
                <option value="friend">{t('relations.friend')}</option>
                <option value="other_family">{t('relations.other_family')}</option>
                <option value="other">{t('relations.other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('age')}
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.them.age}
                onChange={(e) => updateFormData('them', 'age', parseInt(e.target.value) || 0)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('sex')}
              </label>
              <select
                value={formData.them.sex}
                onChange={(e) => updateFormData('them', 'sex', e.target.value)}
                className="input-field"
                required
              >
                <option value="female">{t('female')}</option>
                <option value="male">{t('male')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('country')}
              </label>
              <select
                value={formData.them.country}
                onChange={(e) => updateFormData('them', 'country', e.target.value)}
                className="input-field"
                required
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {locale === 'es' ? country.nameEs : country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div className="mb-8">
          <h3 className="text-xl mb-4 pb-2 border-b border-neutral-200">
            {t('frequency')}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: t('frequencyPresets.weekly'), value: 52 },
                { label: t('frequencyPresets.monthly'), value: 12 },
                { label: t('frequencyPresets.quarterly'), value: 4 },
                { label: t('frequencyPresets.yearly'), value: 1 },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, visitsPerYear: preset.value }))}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    formData.visitsPerYear === preset.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white border-neutral-300 hover:border-primary-400'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('frequencyCustom')}
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.visitsPerYear}
                onChange={(e) => setFormData(prev => ({ ...prev, visitsPerYear: parseInt(e.target.value) || 0 }))}
                className="input-field max-w-xs"
                required
              />
              <p className="text-xs text-neutral-600 mt-1">
                {t('frequencyNote')}
              </p>
            </div>
          </div>
        </div>

        {/* Direct mode option */}
        <div className="mb-8 p-4 bg-neutral-50 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={directMode}
              onChange={(e) => setDirectMode(e.target.checked)}
              className="mt-1"
            />
            <div>
              <span className="font-medium text-neutral-900">
                {t('directMode')}
              </span>
              <p className="text-sm text-neutral-600 mt-1">
                {t('directModeHelp')}
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-center">
          <button type="submit" className="btn-primary">
            {t('calculate')}
          </button>
        </div>
      </form>

      {/* Results */}
      {showResults && (
        <div className="mt-12">
          <Results input={formData} directMode={directMode} />
        </div>
      )}
    </div>
  )
}
