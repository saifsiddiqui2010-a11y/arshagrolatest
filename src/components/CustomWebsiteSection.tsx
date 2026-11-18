import React from 'react';
import { ArrowRight } from 'lucide-react';
import { WebsiteContentSection } from '../services/websiteContent';

interface CustomWebsiteSectionProps {
  section: WebsiteContentSection;
}

const safeImageUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
};

const safeLinkUrl = (value: string) =>
  /^(https:\/\/|mailto:|tel:|#)/i.test(value.trim()) ? value.trim() : '#products';

export const CustomWebsiteSection: React.FC<CustomWebsiteSectionProps> = ({ section }) => {
  const isBanner = section.layout === 'banner';
  const imageUrl = safeImageUrl(section.imageUrl);
  const linkUrl = safeLinkUrl(section.ctaUrl);
  const copy = (
    <div className="space-y-4">
      {section.eyebrow && (
        <p className={`text-xs font-bold uppercase tracking-widest ${isBanner ? 'text-emerald-200' : 'text-emerald-800'}`}>
          {section.eyebrow}
        </p>
      )}
      {section.title && (
        <h2 className={`text-2xl font-black font-serif-heading sm:text-3xl ${isBanner ? 'text-white' : 'text-stone-900'}`}>
          {section.title}
        </h2>
      )}
      {section.subtitle && <p className={isBanner ? 'text-emerald-100' : 'text-stone-600'}>{section.subtitle}</p>}
      {section.body && <p className={`whitespace-pre-line text-sm leading-relaxed ${isBanner ? 'text-emerald-50' : 'text-stone-600'}`}>{section.body}</p>}
      {section.ctaLabel && (
        <a
          href={linkUrl}
          target={linkUrl.startsWith('https://') ? '_blank' : undefined}
          rel={linkUrl.startsWith('https://') ? 'noopener noreferrer' : undefined}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors ${isBanner ? 'bg-white text-emerald-950 hover:bg-emerald-50' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}
        >
          {section.ctaLabel}<ArrowRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );

  return (
    <section
      id={section.id}
      className={`scroll-mt-20 py-8 sm:py-14 ${isBanner ? 'bg-gradient-to-r from-emerald-950 to-teal-900' : section.layout === 'cards' ? 'bg-emerald-50/50' : section.id === 'farm-story' ? 'bg-[#f7f1df]' : 'bg-white'}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {section.layout === 'split' ? (
          <div className="grid grid-cols-2 items-center gap-2 sm:gap-5 md:gap-8 lg:gap-14">
            {imageUrl && <img src={imageUrl} alt={section.title} className="max-h-[22rem] min-h-48 w-full rounded-2xl object-cover shadow-lg sm:rounded-3xl" loading="lazy" />}
            {copy}
          </div>
        ) : section.layout === 'banner' ? (
          <div className="mx-auto max-w-4xl text-center">{copy}</div>
        ) : (
          <div className="mx-auto max-w-5xl">
            <div className="text-center">{copy}</div>
            {section.items.length > 0 && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item) => {
                  const itemImage = safeImageUrl(item.imageUrl);
                  return (
                    <article key={item.id}                     className="overflow-hidden rounded-xl border border-emerald-100 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-5">
                      {itemImage && <img src={itemImage} alt={item.title} className="mb-4 h-40 w-full rounded-xl object-cover" loading="lazy" />}
                      {item.label && <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-emerald-700">{item.label}</p>}
                      {item.title && <h3 className="font-bold text-stone-900">{item.title}</h3>}
                      {item.subtitle && <p className="mt-1 text-xs font-semibold text-emerald-800">{item.subtitle}</p>}
                      {item.body && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-600">{item.body}</p>}
                      {item.detail && <p className="mt-2 text-xs text-stone-500">{item.detail}</p>}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
