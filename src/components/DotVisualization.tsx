'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface DotVisualizationProps {
  totalDots: number;
  label: string;
}

/**
 * Scatter-style dot visualization where each dot represents an encounter opportunity.
 * Creates an emotional, visual representation of remaining visits.
 */
export default function DotVisualization({ totalDots, label }: DotVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Responsive margins based on canvas width
    const isMobile = width < 400;
    const leftMargin = isMobile ? 28 : 40;
    const rightMargin = isMobile ? 12 : 20;
    const topMargin = isMobile ? 12 : 16;
    const bottomMargin = isMobile ? 36 : 40;
    const fontSize = isMobile ? 9 : 11;
    const plotLeft = leftMargin + 5;
    const plotRight = width - rightMargin;
    const plotTop = topMargin;
    const plotBottom = height - bottomMargin;

    // Generate dot positions with a natural scatter pattern
    const dots: { x: number; y: number; size: number; opacity: number; delay: number }[] = [];
    const clampedDots = Math.min(totalDots, 500);
    const seed = totalDots * 7 + 13;

    let rng = seed;
    const random = () => {
      rng = (rng * 16807 + 0) % 2147483647;
      return rng / 2147483647;
    };

    for (let i = 0; i < clampedDots; i++) {
      const progress = i / clampedDots;
      const x =
        plotLeft + (plotRight - plotLeft) * progress + (random() - 0.5) * (isMobile ? 30 : 60);
      const baseY =
        plotTop +
        (plotBottom - plotTop) * 0.15 +
        (plotBottom - plotTop) * 0.55 * (1 - Math.pow(1 - progress, 0.7));
      const y = baseY + (random() - 0.5) * (plotBottom - plotTop) * 0.35;

      dots.push({
        x: Math.max(plotLeft, Math.min(plotRight, x)),
        y: Math.max(plotTop, Math.min(plotBottom, y)),
        size: (isMobile ? 1.5 : 2) + random() * (isMobile ? 2.5 : 3),
        opacity: 0.4 + random() * 0.6,
        delay: i * 2,
      });
    }

    let startTime: number | null = null;
    const animDuration = 2000;

    const draw = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animDuration, 1);

      ctx.clearRect(0, 0, width, height);

      // Draw axis lines
      ctx.strokeStyle = isDarkMode ? 'rgba(163, 163, 163, 0.15)' : 'rgba(163, 163, 163, 0.2)';
      ctx.lineWidth = 1;

      // Y axis
      ctx.beginPath();
      ctx.moveTo(leftMargin, plotTop);
      ctx.lineTo(leftMargin, plotBottom);
      ctx.stroke();

      // X axis
      ctx.beginPath();
      ctx.moveTo(leftMargin, plotBottom);
      ctx.lineTo(plotRight, plotBottom);
      ctx.stroke();

      // Y axis label (rotated)
      ctx.save();
      ctx.translate(isMobile ? 8 : 12, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = isDarkMode ? 'rgba(163, 163, 163, 0.5)' : 'rgba(115, 115, 115, 0.6)';
      ctx.font = `${fontSize}px Sora, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(label, 0, 0);
      ctx.restore();

      // Draw dots
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dotProgress = Math.max(0, Math.min(1, (progress * animDuration - dot.delay) / 300));
        if (dotProgress <= 0) continue;

        const eased = 1 - Math.pow(1 - dotProgress, 3);
        const currentOpacity = dot.opacity * eased;
        const currentSize = dot.size * eased;

        const hue = 35 + (dot.x / width) * 10;
        const lightness = isDarkMode ? 60 : 45;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 90%, ${lightness}%, ${currentOpacity})`;
        ctx.fill();

        if (currentSize > 3) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, currentSize + 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 90%, ${lightness}%, ${currentOpacity * 0.15})`;
          ctx.fill();
        }
      }

      // X axis year labels — use round intervals (5 or 10 years) for clean appearance
      const currentYear = new Date().getFullYear();
      const yearsToShow = Math.min(Math.ceil(clampedDots / 12), 30);
      ctx.fillStyle = isDarkMode ? 'rgba(163, 163, 163, 0.5)' : 'rgba(115, 115, 115, 0.6)';
      ctx.font = `${fontSize}px Sora, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      const labelY = height - (isMobile ? 6 : 10);

      // Pick a clean step: 5 or 10 years depending on range and screen
      const niceStep = yearsToShow <= 10 ? (isMobile ? 3 : 2) : isMobile ? 5 : 5;
      const endYear = currentYear + yearsToShow;

      // Always show first year
      ctx.fillText(`${currentYear}`, plotLeft, labelY);

      // Show intermediate years at round intervals
      for (let year = currentYear + niceStep; year < endYear; year += niceStep) {
        const yr = year - currentYear;
        const xPos = plotLeft + ((plotRight - plotLeft) * yr) / yearsToShow;
        // Skip if too close to the end label
        const endXPos = plotRight;
        if (endXPos - xPos < (isMobile ? 28 : 36)) continue;
        ctx.fillText(`${year}`, xPos, labelY);
      }

      // Always show last year
      ctx.fillText(`${endYear}`, plotRight, labelY);

      // Y axis tick labels
      const maxEncounters = Math.ceil(totalDots / yearsToShow);
      const yTicks = isMobile ? 3 : 4;
      for (let i = 0; i <= yTicks; i++) {
        const val = Math.round((maxEncounters * (yTicks - i)) / yTicks);
        const yPos = plotTop + ((plotBottom - plotTop) * i) / yTicks;
        ctx.textAlign = 'right';
        ctx.fillText(`${val}`, leftMargin - 4, yPos + 3);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      startTime = -animDuration;
      draw(0);
    } else {
      animationRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [totalDots, isDarkMode, label]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="scatter-container bg-neutral-900 dark:bg-neutral-950">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
