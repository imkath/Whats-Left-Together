import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatslefttogether.com';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const metadata = {
    es: {
      title: 'Acerca de',
      description:
        "Conoce el propósito de What's Left Together: una herramienta para reflexionar sobre el tiempo que nos queda con las personas que amamos.",
    },
    en: {
      title: 'About',
      description:
        "Learn about What's Left Together: a tool for reflecting on the time we have left with the people we love.",
    },
  };

  const { title, description } = metadata[locale as keyof typeof metadata] || metadata.en;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/about`,
      languages: {
        'es-ES': `${SITE_URL}/es/about`,
        'en-US': `${SITE_URL}/en/about`,
      },
    },
    openGraph: {
      title: `${title} | What's Left Together`,
      description,
      type: 'website',
      url: `${SITE_URL}/${locale}/about`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | What's Left Together`,
      description,
    },
  };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
