'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

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

    // Generate dot positions with a natural scatter pattern
    const dots: { x: number; y: number; size: number; opacity: number; delay: number }[] = [];
    const clampedDots = Math.min(totalDots, 500); // Cap for performance
    const seed = totalDots * 7 + 13;

    // Simple seeded random
    let rng = seed;
    const random = () => {
      rng = (rng * 16807 + 0) % 2147483647;
      return rng / 2147483647;
    };

    for (let i = 0; i < clampedDots; i++) {
      const progress = i / clampedDots;
      // Create a gentle curve distribution - more dots early, fewer later
      const x = 40 + (width - 80) * progress + (random() - 0.5) * 60;
      // Y follows a decay curve with scatter
      const baseY = height * 0.2 + height * 0.5 * (1 - Math.pow(1 - progress, 0.7));
      const y = baseY + (random() - 0.5) * height * 0.35;

      dots.push({
        x: Math.max(20, Math.min(width - 20, x)),
        y: Math.max(20, Math.min(height - 40, y)),
        size: 2 + random() * 3,
        opacity: 0.4 + random() * 0.6,
        delay: i * 2,
      });
    }

    // Animation
    let startTime: number | null = null;
    const animDuration = 2000; // ms

    const draw = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animDuration, 1);

      ctx.clearRect(0, 0, width, height);

      // Draw axis lines (subtle)
      ctx.strokeStyle = isDarkMode ? 'rgba(163, 163, 163, 0.15)' : 'rgba(163, 163, 163, 0.2)';
      ctx.lineWidth = 1;

      // Y axis
      ctx.beginPath();
      ctx.moveTo(35, 10);
      ctx.lineTo(35, height - 30);
      ctx.stroke();

      // X axis
      ctx.beginPath();
      ctx.moveTo(35, height - 30);
      ctx.lineTo(width - 20, height - 30);
      ctx.stroke();

      // Y axis label
      ctx.save();
      ctx.translate(12, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = isDarkMode ? 'rgba(163, 163, 163, 0.5)' : 'rgba(115, 115, 115, 0.6)';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, 0, 0);
      ctx.restore();

      // Draw dots with staggered animation
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dotProgress = Math.max(0, Math.min(1, (progress * animDuration - dot.delay) / 300));

        if (dotProgress <= 0) continue;

        const eased = 1 - Math.pow(1 - dotProgress, 3); // ease out cubic
        const currentOpacity = dot.opacity * eased;
        const currentSize = dot.size * eased;

        // Warm amber/gold color with varying opacity
        const hue = 35 + (dots[i].x / width) * 10; // slight hue shift across
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${currentOpacity})`;
        ctx.fill();

        // Glow effect for larger dots
        if (currentSize > 3) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, currentSize + 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${currentOpacity * 0.15})`;
          ctx.fill();
        }
      }

      // X axis year labels
      const currentYear = new Date().getFullYear();
      const yearsToShow = Math.min(Math.ceil(clampedDots / 12), 30);
      const labelStep = Math.max(1, Math.floor(yearsToShow / 6));
      ctx.fillStyle = isDarkMode ? 'rgba(163, 163, 163, 0.5)' : 'rgba(115, 115, 115, 0.6)';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';

      for (let yr = 0; yr <= yearsToShow; yr += labelStep) {
        const xPos = 40 + ((width - 80) * yr) / yearsToShow;
        ctx.fillText(`${currentYear + yr}`, xPos, height - 12);
      }
      if (yearsToShow > 6) {
        const xPos = 40 + (width - 80);
        ctx.fillText(`${currentYear + yearsToShow}+`, xPos, height - 12);
      }

      // Y axis tick labels (encounter scale)
      const maxEncounters = Math.ceil(totalDots / yearsToShow);
      for (let i = 0; i <= 4; i++) {
        const val = Math.round((maxEncounters * (4 - i)) / 4);
        const yPos = 20 + ((height - 50) * i) / 4;
        ctx.textAlign = 'right';
        ctx.fillText(`${val}`, 30, yPos + 4);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Draw all at once without animation
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

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      // Force re-render by updating a dependency
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
