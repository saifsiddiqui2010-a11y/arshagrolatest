import React from 'react';
import { Clock, CheckCircle2, Thermometer } from 'lucide-react';
import { WebsiteContentSection } from '../services/websiteContent';

interface ColdPressProcessProps {
  content?: WebsiteContentSection;
}

const stepImages = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=700&q=80',
];

export const ColdPressProcess: React.FC<ColdPressProcessProps> = ({ content }) => {
  const steps = content?.items.length
    ? content.items.map((item, index) => ({
        step: String(index + 1).padStart(2, '0'),
        title: item.title,
        subtitle: item.subtitle,
        description: item.body,
        imageUrl: item.imageUrl || stepImages[index % stepImages.length],
      }))
    : [
        {
          step: '01',
          title: 'Seed Cleaning',
          subtitle: 'Screening & Winnowing',
          description: 'Carefully selected mustard seeds are cleaned and prepared for pressing.',
          imageUrl: stepImages[0],
        },
        {
          step: '02',
          title: 'Cold Pressing',
          subtitle: 'Traditional Low RPM Press',
          description: "Slow mechanical pressing helps preserve the oil's natural aroma.",
          imageUrl: stepImages[1],
        },
        {
          step: '03',
          title: 'Natural Settling',
          subtitle: '48-Hour Gravity Settling',
          description: 'The oil rests naturally so fine sediments settle without chemical refining.',
          imageUrl: stepImages[2],
        },
        {
          step: '04',
          title: 'Fresh Bottling',
          subtitle: 'Freshly Sealed for You',
          description: 'Fresh oil is packed and sealed to keep its character protected.',
          imageUrl: stepImages[3],
        },
      ];

  return (
    <section id="process" className="scroll-mt-16 border-y border-amber-100 bg-gradient-to-b from-[#fffdf7] to-[#f7f3e7] py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-5 max-w-3xl text-center sm:mb-8">
          <div className="mb-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-800 sm:text-xs">
            <Clock className="h-3.5 w-3.5 text-emerald-700" />
            <span>{content?.eyebrow || 'Our Process'}</span>
          </div>
          <h2 className="font-serif-heading text-xl font-black text-stone-900 sm:text-3xl">
            {content?.title || 'The Journey - Seed to Bottle'}
          </h2>
          {content?.subtitle && (
            <p className="mx-auto mt-2 line-clamp-2 max-w-2xl text-xs leading-relaxed text-stone-600 sm:text-sm">
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="px-0 pb-3 sm:pb-0">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
            {steps.map((step) => (
              <article
                key={`${step.step}-${step.title}`}
                className="store-card min-w-0 overflow-hidden rounded-xl bg-white sm:rounded-2xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-amber-50">
                  <img
                    src={step.imageUrl}
                    alt={step.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[10px] font-black text-emerald-900 shadow-sm">
                    {step.step}
                  </span>
                </div>
                <div className="p-2.5 sm:p-4">
                  {step.subtitle && (
                    <p className="mb-1 line-clamp-1 text-[8px] font-bold uppercase tracking-wide text-emerald-700 sm:text-[10px]">
                      {step.subtitle}
                    </p>
                  )}
                  <h3 className="line-clamp-2 text-[10px] font-extrabold leading-tight text-stone-900 sm:text-sm">
                    {step.title}
                  </h3>
                  <p className="mt-1 line-clamp-3 text-[8px] leading-relaxed text-stone-600 sm:mt-2 sm:text-xs">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-semibold text-emerald-900 sm:mt-8 sm:text-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          Traditional cold pressing, naturally settled and freshly sealed.
        </div>

        <div className="mt-8 hidden items-center justify-between gap-6 rounded-2xl bg-emerald-950 p-6 text-emerald-100 md:flex">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-700/40">
              <Thermometer className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <h4 className="font-bold text-white">Why Low Temperature (&lt;45°C) Matters</h4>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-emerald-200">
                Slow cold churning helps protect the mustard oil's natural aroma and character.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-lg bg-emerald-400 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-950">
            100% Unrefined
          </span>
        </div>
      </div>
    </section>
  );
};
