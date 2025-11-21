import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const metadata = {
    es: {
      title: "Acerca de - What's Left Together",
      description:
        "Conoce el propósito de What's Left Together: una herramienta para reflexionar sobre el tiempo que nos queda con las personas que amamos.",
    },
    en: {
      title: "About - What's Left Together",
      description:
        "Learn about What's Left Together: a tool for reflecting on the time we have left with the people we love.",
    },
  };

  const { title, description } = metadata[locale as keyof typeof metadata] || metadata.en;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
