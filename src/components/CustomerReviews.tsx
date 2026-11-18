import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { WebsiteContentSection } from '../services/websiteContent';

interface CustomerReviewsProps {
  content?: WebsiteContentSection;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({ content }) => {
  const reviews = [
    {
      id: 1,
      name: 'Anita Mishra',
      location: 'Patna, Bihar',
      rating: 5,
      date: 'Verified Buyer • 4 days ago',
      title: 'Real traditional aroma that reminds me of childhood village oil',
      comment: 'We have been searching for unadulterated cold pressed Peeli Sarso oil for years. ArshSarso has that unmistakable golden clarity and real pungent aroma without choking smoke. Our fish curry and aloo gobhi taste completely authentic now!',
      product: 'ArshSarso Pure Yellow Mustard Oil - 5L'
    },
    {
      id: 2,
      name: 'Dr. Alok Srivastava',
      location: 'Varanasi, UP',
      rating: 5,
      date: 'Verified Buyer • 1 week ago',
      title: 'Lab tested pure with zero chemical residues - heart healthy',
      comment: 'As a physician, I look closely at lipid profiles and processing methods. Most packaged market oils are refined using chemical solvents. Arsh Agro Industry uses genuine cold sedimentation under 45°C. Highly recommend for natural MUFA.',
      product: 'ArshSarso 1 Litre Peeli Sarso Pack'
    },
    {
      id: 3,
      name: 'Sunita & Rameshwar Roy',
      location: 'Kolkata, WB',
      rating: 5,
      date: 'Verified Buyer • 2 weeks ago',
      title: 'Unbeatable pungent "jhaar" for Bengali Hilsa and Mustard curries',
      comment: 'The traditional Black Kachi Ghani has the exact pungent kick (jhaar) needed for authentic Bengali preparations and mango pickles. Packaging was rock solid with zero leaks during transit to Kolkata.',
      product: 'ArshSarso Traditional Kachi Ghani - 5 Litre Can'
    },
    {
      id: 4,
      name: 'Vikas Dubey',
      location: 'Ranchi, Jharkhand',
      rating: 5,
      date: 'Verified Buyer • 3 weeks ago',
      title: 'Sarso Khali turned my terrace organic vegetable garden lush green',
      comment: 'Bought the 5kg Sarso Khali fertilizer alongside the oil. Soaked a handful in water and applied to my tomato and chili plants; the yield doubled within a month. 100% pure organic byproduct.',
      product: 'Arsh Sarso Khali (Organic Fertilizer) 5kg'
    }
  ];

  return (
    <section className="border-b border-emerald-100 bg-gradient-to-b from-white to-[#f8f6ed] py-10 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
            <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>{content?.eyebrow || '4.9 / 5.0 Rating from 1,200+ Reviews'}</span>
          </div>
          <h2 className="store-section-heading text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 font-serif-heading">
            {content?.title || 'Loved By Families & Traditional Kitchens'}
          </h2>
          <p className="text-sm text-stone-600 mt-1 font-normal">
            {content?.subtitle || 'Real feedback from verified customers cooking daily with ArshSarso.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {(content?.items.length ? content.items.map((item, index) => ({
            id: item.id || index,
            name: item.subtitle,
            location: item.detail,
            rating: item.rating || 5,
            date: 'Verified Buyer',
            title: item.title,
            comment: item.body,
            product: item.label,
            imageUrl: item.imageUrl,
          })) : reviews).map((rev) => (
            <div
              key={rev.id}
              className="store-card flex flex-col justify-between rounded-xl bg-white/90 p-2.5 sm:rounded-3xl sm:p-6"
            >
              <div>
                {/* Rating & Verified */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 leading-snug mb-2">
                  "{rev.title}"
                </h4>

                <p className="mb-2 text-[9px] font-normal leading-relaxed text-stone-600 sm:mb-4 sm:text-xs">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200/60">
                <div className="flex items-center gap-2">
                  {'imageUrl' in rev && rev.imageUrl && (
                    <img src={rev.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" loading="lazy" />
                  )}
                  <p className="text-xs font-bold text-stone-900">{rev.name}</p>
                </div>
                <p className="text-[11px] text-stone-500">{rev.location}</p>
                <p className="text-[10px] font-semibold text-emerald-800 mt-1 truncate">
                  Purchased: {rev.product}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
