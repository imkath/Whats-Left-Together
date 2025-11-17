# SEO Implementation Guide

## Overview

This project includes comprehensive SEO optimization for both Spanish and English versions of the site.

## Features Implemented

### 1. **Dynamic Metadata by Language**

- Metadata is automatically generated based on the current locale (es/en)
- Titles, descriptions, and keywords are translated and optimized for each language
- Located in: `src/app/[locale]/layout.tsx`

### 2. **Open Graph Tags**

- Complete Open Graph implementation for social media sharing
- Custom titles and descriptions for Facebook, LinkedIn, etc.
- Image support (requires `public/og-image.png` - 1200x630px recommended)
- Locale-specific metadata

### 3. **Twitter Cards**

- Summary large image cards configured
- Custom titles and descriptions for Twitter
- Twitter handle: `@whatslefttogether` (update as needed)

### 4. **JSON-LD Structured Data**

- Schema.org WebApplication markup
- Helps search engines understand the site structure
- Includes:
  - Application name and description
  - Author and publisher information
  - Free access indicator
  - Language information

### 5. **Canonical URLs & Alternate Languages**

- Canonical URL for each page to avoid duplicate content
- hreflang tags for Spanish (es-ES) and English (en-US)
- Helps search engines serve the right language to users

### 6. **Sitemap**

- Dynamic sitemap generation at `/sitemap.xml`
- Includes all pages for both languages
- Automatic alternate language links
- Change frequency and priority settings

### 7. **Robots.txt**

- Located at `public/robots.txt`
- Allows all search engine crawlers
- References the sitemap

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Required
NEXT_PUBLIC_SITE_URL=https://whatslefttogether.com

# Optional - for Google Search Console verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
```

### SEO Content

All SEO content is managed in the translation files:

- `src/lib/i18n/es.json` - Spanish SEO metadata
- `src/lib/i18n/en.json` - English SEO metadata

Each file contains a `seo` object with:

- `title` - Main page title
- `description` - Meta description (recommended: 150-160 characters)
- `keywords` - Comma-separated keywords
- `ogTitle` - Open Graph title
- `ogDescription` - Open Graph description
- `twitterTitle` - Twitter card title
- `twitterDescription` - Twitter card description

Individual pages (About, Methodology) also have their own `seo` objects within their respective translation sections.

## Next Steps

### 1. Create Open Graph Image

Create a social sharing image at `public/og-image.png`:

- Dimensions: 1200x630px
- Format: PNG or JPG
- Should include the site name and a compelling visual

### 2. Set Up Google Search Console

1. Create a property for your domain
2. Add the verification meta tag to `.env.local`
3. Submit your sitemap: `https://yourdomain.com/sitemap.xml`

### 3. Configure Social Media Previews

Test your social media cards:

- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### 4. Update Twitter Handle

If you have a Twitter/X account for the project:

1. Update the `creator` field in `src/app/[locale]/layout.tsx`
2. Replace `@whatslefttogether` with your actual handle

## Testing

### Check Metadata

Visit your pages and view source to verify:

- `<title>` tags
- `<meta name="description">` tags
- Open Graph `<meta property="og:*">` tags
- Twitter Card `<meta name="twitter:*">` tags
- Canonical `<link rel="canonical">` tags
- Alternate language `<link rel="alternate" hreflang="*">` tags

### Validate Structured Data

Use Google's Rich Results Test:
https://search.google.com/test/rich-results

Paste your URL and check for Schema.org validation.

### Check Sitemap

Visit: `https://yourdomain.com/sitemap.xml`

Should show all pages with proper alternate language links.

## SEO Best Practices Applied

✅ Unique titles and descriptions for each page
✅ Proper heading hierarchy (H1, H2, H3)
✅ Alt text for images (implement in image components)
✅ Mobile-friendly responsive design
✅ Fast page load times (Next.js optimization)
✅ HTTPS (configure in production)
✅ Semantic HTML structure
✅ Accessible navigation
✅ Language declaration in HTML tag

## Monitoring

After deployment, monitor:

- Google Search Console for indexing and search performance
- Google Analytics for traffic and user behavior
- Core Web Vitals for performance metrics

## Keywords Strategy

### Spanish Keywords

- esperanza de vida
- calculadora tiempo familiar
- visitas restantes
- tablas de vida
- tiempo con familia
- estadísticas mortalidad
- relaciones familiares
- actuarial
- demografía

### English Keywords

- life expectancy
- time calculator
- family visits
- life tables
- mortality statistics
- family relationships
- actuarial
- demography
- remaining visits

## Performance Tips

- The sitemap is generated at build time
- Metadata is generated server-side for each locale
- JSON-LD is injected at render time
- All SEO tags are static and cacheable
