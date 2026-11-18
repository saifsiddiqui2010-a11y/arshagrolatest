import React from 'react';
import { Check, X, Award, Sparkles } from 'lucide-react';
import { WebsiteContentSection } from '../services/websiteContent';

interface OilComparisonProps {
  content?: WebsiteContentSection;
}

export const OilComparison: React.FC<OilComparisonProps> = ({ content }) => {
  const comparisons = [
    {
      feature: 'Extraction Technique',
      arsh: 'Slow Mechanical Cold Churning (Wood Kolhu / Ghani style)',
      commercial: 'Chemical Hexane Solvent Extraction & high-pressure expellers',
      isArshSuperior: true
    },
    {
      feature: 'Max Extraction Temperature',
      arsh: 'Strictly Below 45°C (Zero thermal breakdown)',
      commercial: 'Exceeds 200°C (Generates trans fats & destroys nutrients)',
      isArshSuperior: true
    },
    {
      feature: 'Refining & Clarification',
      arsh: '48-Hour Natural Gravity Sedimentation in SS304 Steel Tanks',
      commercial: 'Treated with Caustic Soda, Bleaching Earths & Deodorizers',
      isArshSuperior: true
    },
    {
      feature: 'Natural Pungency (Jhaar)',
      arsh: '100% Intact Allyl Isothiocyanate from native seeds',
      commercial: 'Loss of natural aroma; often reinforced with synthetic flavor',
      isArshSuperior: true
    },
    {
      feature: 'Vitamin E & Omega-3 Content',
      arsh: 'Fully Preserved (Natural Tocopherols & Healthy MUFA)',
      commercial: 'Significantly degraded due to intense heat processing',
      isArshSuperior: true
    },
    {
      feature: 'Argemone Oil Adulteration',
      arsh: 'Guaranteed 0% (Every batch tested & certified negative)',
      commercial: 'Variable purity in unbranded, bulk market oils',
      isArshSuperior: true
    }
  ];

  return (
    <section id="comparison" className="py-16 sm:py-20 bg-emerald-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            <span>{content?.eyebrow || 'Health & Purity Face-Off'}</span>
          </div>
          <h2 className="store-section-heading text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 font-serif-heading">
            {content?.title || 'ArshSarso vs Common Refined Oil'}
          </h2>
          <p className="text-sm text-stone-600 mt-2 font-normal">
            {content?.subtitle || 'Understand exactly what goes into your family’s daily cooking oil.'}
          </p>
        </div>

        {/* Responsive Table Card */}
        <div className="store-card overflow-hidden rounded-2xl bg-white sm:rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="py-5 px-6 font-bold text-stone-500 uppercase tracking-wider w-1/3">
                    Quality Parameter
                  </th>
                  <th className="py-5 px-6 font-extrabold text-emerald-950 bg-emerald-100/70 w-1/3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>ArshSarso Cold-Pressed</span>
                    </div>
                  </th>
                  <th className="py-5 px-6 font-bold text-stone-400 bg-stone-50 w-1/3">
                    Regular Refined / Market Oil
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(content?.items.length ? content.items.map((item) => ({
                  feature: item.title,
                  arsh: item.body,
                  commercial: item.detail,
                  isArshSuperior: true,
                })) : comparisons).map((row, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-stone-900">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-950 bg-emerald-50/50">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.arsh}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-stone-500 bg-stone-50/40">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{row.commercial}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
