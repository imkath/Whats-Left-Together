import {getRequestConfig} from 'next-intl/server';
import {getRequestLocale} from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  return {
    locale,
    messages: (await import(`@/lib/i18n/${locale}.json`)).default
  };
});
