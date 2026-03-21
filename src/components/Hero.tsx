'use client';

import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-neutral-900 dark:bg-neutral-950">
      {/* Animated dot pattern background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Floating particles effect using CSS */}
        <div className="hero-particles" />
      </div>

      <div className="relative z-10 container-custom text-center px-4">
        {/* Small label */}
        <div className="animate-fade-in">
          <span className="inline-block text-accent-400/80 text-xs tracking-[0.3em] uppercase font-medium mb-8">
            {t('label')}
          </span>
        </div>

        {/* Main title with serif font for emotional impact */}
        <h1 className="sr-only">{t('title')}</h1>
        <picture className="animate-fade-in">
          <source srcSet="/logo-wslt.webp" type="image/webp" />
          <img
            src="/logo-wslt.png"
            alt="What's Left Together"
            width={800}
            height={80}
            className="w-full max-w-2xl mx-auto h-auto mb-8 invert hover:opacity-90 transition-opacity duration-300"
            fetchPriority="high"
          />
        </picture>

        {/* Emotional subtitle */}
        <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-4 leading-relaxed animate-slide-up font-light">
          {t('subtitle')}
        </p>

        {/* Divider */}
        <div className="w-16 h-px bg-accent-500/50 mx-auto my-8 animate-fade-in" />

        {/* Below text */}
        <p className="text-sm text-neutral-500 max-w-lg mx-auto mb-12 leading-relaxed animate-slide-up italic">
          {t('belowButton')}
        </p>

        {/* CTA Button */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <a
            href="#calculator"
            className="inline-flex items-center gap-3 px-8 py-4 bg-accent-500 hover:bg-accent-400 text-neutral-900 font-semibold rounded-full transition-all duration-300 shadow-lg shadow-accent-500/20 hover:shadow-xl hover:shadow-accent-500/30 active:scale-[0.98] text-lg group"
          >
            {t('cta')}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
        <ChevronDown size={24} className="text-neutral-500" />
      </div>
    </section>
  );
}
