import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatslefttogether.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['es', 'en'];
  const pages = ['', 'about', 'methodology'];

  const routes: MetadataRoute.Sitemap = [];

  // Add all pages for all locales
  locales.forEach((locale) => {
    pages.forEach((page) => {
      const url = page ? `${SITE_URL}/${locale}/${page}` : `${SITE_URL}/${locale}`;
      routes.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: {
            es: page ? `${SITE_URL}/es/${page}` : `${SITE_URL}/es`,
            en: page ? `${SITE_URL}/en/${page}` : `${SITE_URL}/en`,
          },
        },
      });
    });
  });

  return routes;
}
