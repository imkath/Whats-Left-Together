import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatslefttogether.com';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const metadata = {
    es: {
      title: 'Metodología',
      description:
        "Metodología y fuentes de datos de What's Left Together. Basado en tablas de vida de la ONU (WPP-2024) y simulación Monte Carlo.",
    },
    en: {
      title: 'Methodology',
      description:
        "Methodology and data sources for What's Left Together. Based on UN life tables (WPP-2024) and Monte Carlo simulation.",
    },
  };

  const { title, description } = metadata[locale as keyof typeof metadata] || metadata.en;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/methodology`,
      languages: {
        'es-ES': `${SITE_URL}/es/methodology`,
        'en-US': `${SITE_URL}/en/methodology`,
      },
    },
    openGraph: {
      title: `${title} | What's Left Together`,
      description,
      type: 'website',
      url: `${SITE_URL}/${locale}/methodology`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | What's Left Together`,
      description,
    },
  };
}

export default function MethodologyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
