import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const metadata = {
    es: {
      title: "Metodología - What's Left Together",
      description:
        "Metodología y fuentes de datos de What's Left Together. Basado en tablas de vida de la ONU (WPP-2024) y modelos actuariales.",
    },
    en: {
      title: "Methodology - What's Left Together",
      description:
        "Methodology and data sources for What's Left Together. Based on UN life tables (WPP-2024) and actuarial models.",
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

export default function MethodologyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
