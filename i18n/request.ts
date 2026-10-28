import { getRequestConfig } from 'next-intl/server';

const LOCALES = ['es', 'en'] as const;
type Locale = (typeof LOCALES)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  // Only known locales reach the dynamic import; anything else falls back to Spanish.
  const locale: Locale = LOCALES.includes(requested as Locale) ? (requested as Locale) : 'es';

  return {
    locale,
    messages: (await import(`@/lib/i18n/${locale}.json`)).default,
  };
});
