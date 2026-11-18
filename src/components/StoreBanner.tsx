import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { WebsiteBannerSlide } from '../services/websiteContent';

interface StoreBannerProps {
  slides: WebsiteBannerSlide[];
  enabled: boolean;
}

export const StoreBanner: React.FC<StoreBannerProps> = ({ slides, enabled }) => {
  const visibleSlides = slides.filter((slide) => slide.visible);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [visibleSlides.length]);

  useEffect(() => {
    if (!enabled || visibleSlides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleSlides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [enabled, visibleSlides.length]);

  if (!enabled || visibleSlides.length === 0) return null;

  const slide = visibleSlides[activeIndex % visibleSlides.length];
  const move = (direction: -1 | 1) => {
    setActiveIndex((current) =>
      (current + direction + visibleSlides.length) % visibleSlides.length
    );
  };

  return (
    <section
      className="relative h-[180px] w-full overflow-hidden bg-emerald-950 sm:h-[280px] lg:h-[340px]"
      aria-label="Featured promotions"
    >
      {visibleSlides.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === activeIndex % visibleSlides.length ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/70 to-emerald-950/10" />
        </div>
      ))}

      <div className="absolute inset-0 mx-auto flex max-w-7xl items-center px-5 sm:px-8 lg:px-12">
        <div className="max-w-xl text-white">
          {slide.eyebrow && (
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-amber-300 sm:text-xs">
              {slide.eyebrow}
            </p>
          )}
          <h2 className="font-serif-heading text-2xl font-black leading-[1.05] sm:text-4xl lg:text-5xl">
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="mt-2 max-w-lg text-[10px] leading-relaxed text-emerald-50/90 sm:mt-4 sm:text-base">
              {slide.subtitle}
            </p>
          )}
          {slide.ctaLabel && (
            <a
              href={slide.ctaUrl || '#products'}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-[10px] font-black text-emerald-950 shadow-lg transition hover:bg-amber-300 sm:mt-5 sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm"
            >
              {slide.ctaLabel}
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </a>
          )}
        </div>
      </div>

      {visibleSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => move(-1)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-emerald-950/40 text-white backdrop-blur hover:bg-emerald-950/70 sm:left-5 sm:h-10 sm:w-10"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-emerald-950/40 text-white backdrop-blur hover:bg-emerald-950/70 sm:right-5 sm:h-10 sm:w-10"
            aria-label="Next banner"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-5">
            {visibleSlides.map((item, index) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex % visibleSlides.length
                    ? 'w-6 bg-amber-400'
                    : 'w-1.5 bg-white/70'
                }`}
                aria-label={`Show banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
