import { 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  MessageCircle,
  Truck
} from 'lucide-react';
import { MILL_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { WebsiteContent } from '../services/websiteContent';

interface FooterProps {
  onOpenLabReport: () => void;
  onOpenWholesale: () => void;
  onOpenAuth: () => void;
  onOpenTrackOrder: () => void;
  content?: WebsiteContent['footer'] & WebsiteContent['header'];
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLabReport,
  onOpenWholesale,
  onOpenAuth,
  onOpenTrackOrder,
  content,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-emerald-950 text-stone-300 pt-16 pb-24 md:pb-12 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-5 pb-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-5 border-b border-emerald-900/70">
          
          {/* Brand & Mill Story Column */}
          <div className="col-span-2 space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-serif font-black text-xl shadow-md">
                A
              </div>
              <div>
                <span className="font-serif text-xl font-black text-white uppercase tracking-tight">
                  {content?.brandName || 'Arsh Agro Industry'}
                </span>
                <p className="text-[11px] font-semibold text-emerald-400 tracking-wider">
                  {content?.tagline || 'ArshSarso • Pure • Unrefined • Farm to Bottle'}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
              {content?.description || 'Based in Siwan, Bihar, Arsh Agro Industry is dedicated to reviving native Indian cold-pressing traditions. We extract 100% pure Kachi Ghani and Peeli Sarso mustard oil under 45°C with 48-hour gravity sedimentation, delivering authentic aroma and unadulterated heart nutrition.'}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-emerald-300">
              <span className="bg-emerald-900/80 border border-emerald-800 px-3 py-1 rounded-full">
                FSSAI Lic. 10423000001289
              </span>
              <span className="bg-emerald-900/80 border border-emerald-800 px-3 py-1 rounded-full">
                PGS-India Certified Organic
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Explore Store
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/70">
              <li>
                <button onClick={() => scrollTo('hero')} className="hover:text-white transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('products')} className="hover:text-white transition-colors cursor-pointer">
                  Shop Cold-Pressed Oil
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('process')} className="hover:text-white transition-colors cursor-pointer">
                  4-Step Extraction Process
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('comparison')} className="hover:text-white transition-colors cursor-pointer">
                  ArshSarso vs Refined Oil
                </button>
              </li>
              <li>
                <button onClick={onOpenLabReport} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                  <span>Lab Reports & Purity</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                </button>
              </li>
              <li>
                <button onClick={onOpenWholesale} className="hover:text-white transition-colors cursor-pointer font-bold text-emerald-400">
                  B2B Wholesale Inquiry
                </button>
              </li>
              <li>
                <button onClick={onOpenTrackOrder} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Track Your Order</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Product Offerings */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Our Lineup
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/70">
              {(content?.offerings || [
                'Peeli Sarso (Yellow Mustard) 1L',
                'Peeli Sarso Oil 5L Family Can',
                'Traditional Black Kachi Ghani 1L',
                'Traditional Black Kachi Ghani 5L',
                'Sarso Khali (Organic Fertilizer) 5kg',
                '10L Family Master Box (2x5L)',
                '200ml Trial Glass Bottle',
              ]).map((offering, index) => <li key={`${offering}-${index}`}>{offering}</li>)}
            </ul>
          </div>

          {/* Mill Contact Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Mill & Office
            </h4>
            <div className="space-y-3 text-xs text-emerald-100/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {content?.address || 'Arsh Agro Industry, Hathaura, Hussainganj, Siwan, Bihar - 841237, India'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${(content?.phone || '+91 84474 23416').replace(/[^\d+]/g, '')}`} className="hover:text-white transition-colors">
                  {content?.phone || '+91 84474 23416'}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a 
                  href={`https://wa.me/${MILL_WHATSAPP_NUMBER}?text=Hello%20Arsh%20Agro%20Industry,%20I%20would%20like%20to%20order%20ArshSarso%20mustard%20oil.`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-emerald-300 hover:text-white font-bold"
                >
                  WhatsApp Orders Desk
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${content?.email || 'sales@arshagroindustry.com'}`} className="hover:text-white transition-colors">
                  {content?.email || 'sales@arshagroindustry.com'}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Payment gateways & copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/60">
          <p>
            © {new Date().getFullYear()} Arsh Agro Industry (ArshSarso). All Rights Reserved. Made in Siwan, Bihar.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-300">Secured Payments by:</span>
            <div className="flex items-center gap-2 font-bold text-emerald-100">
              <span className="bg-emerald-900 border border-emerald-800 px-2.5 py-1 rounded-md text-[10px] text-blue-300">
                Razorpay
              </span>
              <span className="bg-emerald-900 border border-emerald-800 px-2 py-1 rounded-md text-[10px]">
                UPI
              </span>
              <span className="bg-emerald-900 border border-emerald-800 px-2 py-1 rounded-md text-[10px]">
                RuPay
              </span>
              <span className="bg-emerald-900 border border-emerald-800 px-2 py-1 rounded-md text-[10px]">
                Cards
              </span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
