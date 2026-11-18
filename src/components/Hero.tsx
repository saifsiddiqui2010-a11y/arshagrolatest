import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Droplet, 
  CheckCircle2, 
  Truck,
  Leaf,
  MessageCircle
} from 'lucide-react';
import { MILL_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { WebsiteContentSection } from '../services/websiteContent';
import { Product } from '../types';

interface HeroProps {
  onShopClick: () => void;
  onStoryClick: () => void;
  onWholesaleClick: () => void;
  onLabClick: () => void;
  content?: WebsiteContentSection;
  products?: Product[];
}

export const Hero: React.FC<HeroProps> = ({
  onShopClick,
  onStoryClick,
  onWholesaleClick,
  onLabClick,
  content,
  products = [],
}) => {
  const sectionItems = content?.items || [];
  const defaultFeatures = ['Wood-Cold Churned', 'Zero Argemone Adulteration', 'Siwan, Bihar Mill Direct'];
  const featureLabels = defaultFeatures.map((label, index) => sectionItems[index]?.title || label);
  const defaultMetrics = [
    { value: '< 45°C', label: 'Cold Press Temperature' },
    { value: '0%', label: 'Argemone & Chemicals' },
    { value: '48 Hours', label: 'Natural Steel Sedimentation' },
    { value: '10,000+', label: 'Happy Households Across India' },
  ];
  const metrics = defaultMetrics.map((metric, index) => ({
    value: sectionItems[index + 3]?.title || metric.value,
    label: sectionItems[index + 3]?.subtitle || metric.label,
  }));
  const ctaUrl = content?.ctaUrl && /^(https:\/\/|mailto:|tel:|#)/i.test(content.ctaUrl)
    ? content.ctaUrl
    : '#products';
  const featuredProducts = [
    products.find((product) => product.category === 'yellow-mustard'),
    products.find((product) => product.category === 'kachi-ghani'),
  ].filter((product): product is Product => Boolean(product));

  return (
    <section id="hero" className="relative isolate overflow-hidden bg-gradient-to-br from-[#faf6e9] via-[#f7f1df] to-[#efe6cc] py-6 sm:py-12 lg:py-16">
      
      <div className="absolute inset-0 -z-10 lg:hidden">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f8f1dc]/95 via-[#faf4df]/80 to-amber-100/45" />
      </div>
      <div className="pointer-events-none absolute -right-32 top-0 -z-10 hidden h-96 w-96 rounded-full bg-amber-300/30 blur-3xl lg:block" />
      <div className="pointer-events-none absolute left-[42%] top-12 -z-10 hidden h-32 w-32 rounded-full border border-emerald-900/10 lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-[1.08fr_0.92fr] items-center gap-2 sm:gap-6 lg:grid-cols-12 lg:gap-12">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="min-w-0 text-left lg:col-span-7">
            
            {/* Pill Badge */}
            <div className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-amber-200 bg-white/85 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-emerald-950 shadow-sm sm:mb-4 sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-xs">
              <Leaf className="h-3 w-3 shrink-0 text-emerald-700 sm:h-4 sm:w-4" />
              <span className="truncate">{content?.eyebrow || 'PURE • UNREFINED • FARM TO BOTTLE'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="store-section-heading mb-2 font-serif-heading text-[clamp(1.2rem,5vw,2rem)] font-black leading-[1.04] tracking-tight text-stone-900 sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.15]">
              {content?.title || 'From Our Fields to'} <br className="hidden lg:inline" />
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-950 bg-clip-text text-transparent">
                {content?.subtitle || "Your Family's Table"}
              </span>
            </h1>

            {/* Subtext */}
            <p className="mb-3 line-clamp-4 max-w-2xl text-[9px] font-normal leading-snug text-stone-700 sm:mb-6 sm:text-base sm:leading-relaxed lg:text-lg">
              {content?.body || 'Grown with care on our own farms, sourced alongside local farmers, and traditionally cold pressed to bring the authentic taste of mustard oil to your kitchen.'}
            </p>

            {/* Key feature pills */}
            <div className="mb-8 hidden max-w-lg grid-cols-2 gap-2.5 text-xs font-semibold text-stone-800 sm:grid sm:grid-cols-3">
              {[CheckCircle2, ShieldCheck, Leaf].map((Icon, index) => (
                <div key={index} className={`flex items-center gap-2 bg-emerald-50/90 border border-emerald-200/90 px-3 py-2 rounded-xl ${index === 2 ? 'col-span-2 sm:col-span-1' : ''}`}>
                  <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{featureLabels[index]}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:gap-3">
              <a
                href={ctaUrl}
                target={ctaUrl.startsWith('https://') ? '_blank' : undefined}
                rel={ctaUrl.startsWith('https://') ? 'noopener noreferrer' : undefined}
                className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-800 px-2 py-2 text-[10px] font-bold text-white shadow-md shadow-emerald-950/15 transition-all hover:-translate-y-0.5 hover:bg-emerald-900 sm:w-auto sm:gap-2 sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-base"
              >
                <span>{content?.ctaLabel || 'Shop Mustard Oil'}</span>
                <ArrowRight className="h-3 w-3 sm:h-5 sm:w-5" />
              </a>
              <button
                onClick={onStoryClick}
                className="inline-flex w-full items-center justify-center rounded-lg border border-emerald-800/30 bg-white/80 px-2 py-1.5 text-[9px] font-bold text-emerald-950 transition-colors hover:bg-white sm:w-auto sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
              >
                Our Farm Story
              </button>

              {/* Order Confirmation on WhatsApp button */}
              <a
                href={`https://wa.me/${MILL_WHATSAPP_NUMBER}?text=Namaste%20Arsh%20Agro%20Industry,%20I%20would%20like%20to%20place%20an%20order%20for%20ArshSarso%20mustard%20oil.`}
                target="_blank"
                rel="noreferrer"
                className="hidden w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-emerald-700 sm:inline-flex sm:w-auto"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Order on WhatsApp</span>
              </a>

              <button
                onClick={onWholesaleClick}
                className="hidden w-full items-center justify-center gap-2 rounded-2xl border border-stone-800 bg-stone-900 px-5 py-3.5 text-sm font-bold text-emerald-100 shadow-md transition-all hover:bg-stone-800 sm:inline-flex sm:w-auto"
              >
                <span>B2B Wholesale</span>
              </button>
            </div>

            {/* Delivery & Security Note */}
            <div className="mt-6 hidden flex-wrap items-center gap-3 text-xs text-stone-500 sm:flex">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-700" /> Doorstep Delivery across India
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Live Updates
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Razorpay Secured Checkout
              </span>
            </div>
          </div>

          <div className="relative hidden h-56 min-w-0 items-end justify-center gap-0 sm:h-72 lg:hidden">
            {featuredProducts.length ? featuredProducts.map((product) => (
              <img
                key={product.id}
                src={product.image}
                alt={product.name}
                className="h-[88%] w-1/2 object-contain drop-shadow-xl"
              />
            )) : (
              <img
                src={content?.imageUrl || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'}
                alt="ArshSarso mustard oil"
                className="h-full w-full rounded-2xl object-cover shadow-lg"
              />
            )}
          </div>

          {/* Right Column: High Visual Product Feature Card */}
          <div className="relative col-span-1 mt-1 block lg:col-span-5 lg:mt-0">
            <div className="relative mx-auto max-w-sm sm:max-w-md">
              
              {/* Main Visual Display */}
              <div className="store-card relative overflow-hidden rounded-xl border-2 border-white bg-gradient-to-br from-emerald-100 via-emerald-50 to-stone-100 shadow-xl sm:rounded-3xl sm:border-4 sm:shadow-2xl">
                <img
                  src={content?.imageUrl || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'}
                  alt="ArshSarso Pure Yellow Mustard Oil bottle"
                  className="h-40 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-96"
                />

                {/* Overlaid Badges */}
                <div className="absolute left-1.5 top-1.5 rounded-md border border-emerald-200 bg-white/95 px-1.5 py-1 shadow-md backdrop-blur-md sm:left-4 sm:top-4 sm:rounded-xl sm:px-3 sm:py-1.5">
                  <p className="text-[6px] font-bold uppercase tracking-wider text-emerald-800 sm:text-[10px]">Flagship Variant</p>
                  <p className="text-[8px] font-extrabold text-stone-900 sm:text-sm">Peeli Sarso (Yellow Mustard)</p>
                </div>

                <div className="absolute right-1.5 top-1.5 rounded-md bg-emerald-800 px-1.5 py-1 text-center text-white shadow-md sm:right-4 sm:top-4 sm:rounded-xl sm:px-3 sm:py-1.5">
                  <span className="block text-[7px] font-black tracking-wide sm:text-xs">FSSAI & PGS</span>
                  <span className="block text-[6px] opacity-90 sm:text-[10px]">Certified</span>
                </div>

                {/* Bottom glassmorphic showcase badge */}
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between rounded-lg border border-emerald-100 bg-white/95 p-1.5 shadow-lg backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:rounded-2xl sm:p-3.5">
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-700 font-bold text-white shadow-xs sm:h-10 sm:w-10 sm:rounded-xl">
                      <Droplet className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="text-[8px] font-extrabold text-stone-900 sm:text-xs">ArshSarso Pure 1L Pack</p>
                      <p className="text-[7px] text-stone-500 sm:text-[11px]">
                        <span className="text-[9px] font-bold text-emerald-800 sm:text-sm">₹299</span> <span className="text-stone-400 line-through">₹395</span> (24% OFF)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onShopClick}
                    className="rounded-lg bg-amber-400 px-1.5 py-1 text-[7px] font-black text-emerald-950 shadow-sm transition-colors hover:bg-amber-300 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Floating Quality Seal */}
              <div className="absolute -bottom-5 -left-2 flex items-center gap-1.5 rounded-xl border border-emerald-800 bg-emerald-950 p-1.5 text-emerald-100 shadow-xl sm:-bottom-6 sm:-left-6 sm:gap-3 sm:rounded-2xl sm:p-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">48-Hour Gravity Settling</p>
                  <p className="text-[10px] text-emerald-300">Natural Raw Golden Clarity</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Metrics Bar */}
        <div className="mt-12 hidden grid-cols-2 gap-4 border-t border-emerald-200/60 pt-8 text-center md:grid md:grid-cols-4 md:gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="p-3 bg-white/80 rounded-2xl border border-emerald-100 shadow-xs">
              <p className={`text-2xl sm:text-3xl font-black font-serif-heading ${index % 2 ? 'text-emerald-700' : 'text-emerald-900'}`}>{metric.value}</p>
              <p className="text-xs font-semibold text-stone-600 mt-0.5">{metric.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
