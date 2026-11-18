import React from 'react';
import { Leaf, ShieldCheck, Flame, Clock, UsersRound } from 'lucide-react';
import { WebsiteContentSection } from '../services/websiteContent';

interface TrustBadgesProps {
  content?: WebsiteContentSection;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ content }) => {
  const pillars = [
    {
      icon: Leaf,
      title: 'Our Own Cultivation',
      description: 'Sourced directly from native mustard farmers, rigorously winnowed and cleaned to select only high-oil, mature seeds.',
    },
    {
      icon: UsersRound,
      title: 'Local Farmer Partnerships',
      description: 'Working directly with local mustard farmers.',
    },
    {
      icon: Flame,
      title: 'Traditional Cold Pressing',
      description: 'Slow extraction to preserve natural aroma and character.',
    },
    {
      icon: Clock,
      title: 'Rich Aroma & Bold Flavour',
      description: 'Naturally pungent mustard oil for traditional cooking.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Argemone Adulteration',
      description: 'Every production batch is certified with zero argemone adulteration, low free fatty acids, and full FSSAI compliance.',
    }
  ];
  const items = content?.items.length
    ? content.items.slice(0, 4).map((item, index) => ({ ...pillars[index], title: item.title, description: item.body }))
    : pillars.slice(0, 4);

  return (
    <section className="border-y border-amber-200/70 bg-[#fdfbf3] py-4 sm:py-5">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <h2 className="sr-only">
          {content?.title || 'Why ArshSarso Is Different From Regular Market Oil'}
        </h2>
        <div className="grid grid-cols-4 gap-1 sm:gap-4">
          {items.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center px-1 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left"
              >
                <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-emerald-900 shadow-sm sm:mb-0 sm:h-10 sm:w-10">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="text-[9px] font-bold leading-tight text-stone-900 sm:text-xs">
                    {pillar.title}
                  </h3>
                  <p className="sr-only">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
