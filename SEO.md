# SEO

How search engines and AI crawlers see the site, and where each piece lives.

## Metadata

`src/app/[locale]/layout.tsx` builds the metadata per locale from the `seo` object in `src/lib/i18n/es.json` and `en.json`: title, description, keywords, Open Graph and the Twitter card. The About and Methodology pages have their own `seo` objects in the same files.

- Canonical URL per locale, with `hreflang` alternates for `es` and `en`.
- Share images: `public/og-image-es.png` and `public/og-image-en.png` (1200 x 630), one per locale, with the logo, the question the tool answers and the visit grid.
- Search Console verification comes from `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`. Bing uses `public/BingSiteAuth.xml`.

## Structured data

The same layout injects four JSON-LD blocks: `WebApplication`, `WebSite`, `Organization` and `FAQPage`. They only describe what the page actually shows; there is no site search, so there is no `SearchAction`.

Check them with the [Rich Results Test](https://search.google.com/test/rich-results).

## Crawling

- `src/app/sitemap.ts` generates `/sitemap.xml` with both locales and their alternates.
- `public/robots.txt` allows every crawler, including the AI crawlers listed by name, and points to the sitemap.
- `public/llms.txt` summarizes the tool, its data and its limits for language models.

## Keywords

Kept in the `seo.keywords` field of each translation file. They describe the tool literally (life tables, remaining visits, life expectancy) rather than chasing volume.
