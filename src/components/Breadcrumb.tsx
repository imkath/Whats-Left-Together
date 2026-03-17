import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  siteUrl?: string;
}

export default function Breadcrumb({
  items,
  siteUrl = 'https://whatslefttogether.com',
}: BreadcrumbProps) {
  const allItems = [{ label: 'Home', href: '/' }, ...items];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteUrl}${item.href}` : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="container-custom pt-4">
        <ol className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
          {allItems.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight size={14} className="flex-shrink-0" />}
              {item.href && index < allItems.length - 1 ? (
                <a
                  href={item.href}
                  className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
