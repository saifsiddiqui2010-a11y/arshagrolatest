import React, { useState } from 'react';
import { submitWholesaleInquiry } from '../services/storeData';
import { Building2, Send, CheckCircle2, Phone, Mail, MessageCircle, Truck } from 'lucide-react';
import { MILL_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { WebsiteContentSection } from '../services/websiteContent';

interface WholesaleB2BSectionProps {
  content?: WebsiteContentSection;
}

export const WholesaleB2BSection: React.FC<WholesaleB2BSectionProps> = ({ content }) => {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    quantityNeeded: '50-100 Cans (5L)',
    city: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.city) {
      setErrorMsg('Please enter your name, phone number, and city');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await submitWholesaleInquiry(formData);
      setIsSubmitted(true);
      setFormData({
        name: '',
        businessName: '',
        phone: '',
        email: '',
        quantityNeeded: '50-100 Cans (5L)',
        city: '',
        message: ''
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="wholesale" className="py-16 sm:py-20 bg-emerald-950 text-stone-100 scroll-mt-16 border-y border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Info Column */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/60 text-emerald-300 text-xs font-bold border border-emerald-600/40 mb-4">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>{content?.eyebrow || 'Direct Mill Supply & Dealership'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white font-serif-heading leading-tight mb-4">
              {content?.title || 'Wholesale & Bulk Supply For Distributors, Stores & HoReCa'}
            </h2>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-6 font-normal">
              {content?.body || 'Are you an organic retail chain, supermarket, oil distributor, or gourmet restaurant? Arsh Agro Industry supplies bulk unrefined cold-pressed Peeli Sarso & Kachi Ghani mustard oil and organic Sarso Khali with direct dispatch from Siwan, Bihar across India.'}
            </p>

            <div className="space-y-3.5 mb-8 text-xs sm:text-sm text-emerald-100">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Full truckload (FTL) & part truckload (PTL) pan-India logistics</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Tiered wholesale discounts & GST compliant commercial invoicing</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Private labeling & institutional supply options available</span>
              </div>
            </div>

            {/* Direct contact badges with WhatsApp */}
            <div className="pt-6 border-t border-emerald-800/70 flex flex-col sm:flex-row gap-4 text-xs font-semibold">
              <a 
                href={`https://wa.me/${MILL_WHATSAPP_NUMBER}?text=Hello%20Arsh%20Agro%20Industry,%20I%20am%20interested%20in%20wholesale%20dealership%20of%20mustard%20oil.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-emerald-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Wholesale Desk</span>
              </a>
              <a 
                href="tel:+918447423416"
                className="flex items-center gap-2 text-emerald-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>+91 84474 23416</span>
              </a>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-emerald-900/80 rounded-3xl p-6 sm:p-8 border border-emerald-700/60 shadow-2xl relative">
              
              {isSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-300 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Inquiry Received!</h3>
                  <p className="text-emerald-100 text-sm max-w-md mx-auto">
                    Thank you for your interest in partnering with Arsh Agro Industry. Our mill sales director will call you within 2 hours with wholesale quotations.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-emerald-700/80 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-white font-serif-heading">
                      {content?.subtitle || 'Request Wholesale Rate Card'}
                    </h3>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      Fill out the form below and our sales desk will connect directly with customized pricing.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-emerald-100 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Kumar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-emerald-100 mb-1">Business / Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Kumar Organic Mart"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-emerald-100 mb-1">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-emerald-100 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-emerald-100 mb-1">Expected Monthly Quantity</label>
                      <select
                        value={formData.quantityNeeded}
                        onChange={(e) => setFormData({ ...formData, quantityNeeded: e.target.value })}
                        className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        <option value="20-50 Cans (5L)">20 - 50 Cans (5L)</option>
                        <option value="50-100 Cans (5L)">50 - 100 Cans (5L)</option>
                        <option value="100-500 Bottles (1L)">100 - 500 Bottles (1L)</option>
                        <option value="500+ Litres Master Order">500+ Litres Master Order</option>
                        <option value="Mustard Cake (Khali) 1-10 Tons">Sarso Khali (1 - 10 Tons)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-emerald-100 mb-1">Delivery City & State *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Patna, Bihar or Delhi NCR"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-emerald-100 mb-1">Specific Requirements or Message</label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your distribution territory or specific oil packaging requirement..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/40"
                  >
                    {isSubmitting ? (
                      <span>Submitting Inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{content?.ctaLabel || 'Submit Wholesale Request'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
