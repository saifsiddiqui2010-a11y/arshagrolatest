import React, { useState } from 'react';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck, 
  Search, 
  ChevronDown,
  LogOut,
  FileText,
  MessageCircle,
  Truck,
  Bell,
  Headphones,
  Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MILL_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { WebsiteContent } from '../services/websiteContent';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenLabReport: () => void;
  onOpenWholesale: () => void;
  onOpenTrackOrder: () => void;
  onOpenNotifications: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  content?: WebsiteContent['header'];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenProfile,
  onOpenLabReport,
  onOpenWholesale,
  onOpenTrackOrder,
  onOpenNotifications,
  searchQuery,
  setSearchQuery,
  content,
}) => {
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const brandTitle = (content?.tagline || 'Arsh Sarso • Pure • Unrefined • Farm to Bottle')
    .split('•')[0]
    .trim()
    .replace(/ArshSarso/i, 'Arsh Sarso');
  const brandSubtitle = content?.brandName || 'ARSH AGRO INDUSTRY';

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-800 bg-emerald-950 shadow-[0_4px_24px_rgba(16,45,34,0.18)] transition-all">
      <div className="bg-emerald-950 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-3 items-center gap-1 px-2 py-2 text-center text-[8px] font-semibold sm:px-6 sm:text-[11px] lg:px-8">
          <span className="flex items-center justify-center gap-1 whitespace-nowrap">
            <Truck className="h-3 w-3 shrink-0 text-amber-300" />
            Pan India Delivery
          </span>
          <span className="flex items-center justify-center gap-1 whitespace-nowrap">
            <ShieldCheck className="h-3 w-3 shrink-0 text-amber-300" />
            Secure Payments
          </span>
          <a href={`tel:${MILL_WHATSAPP_NUMBER}`} className="flex items-center justify-center gap-1 whitespace-nowrap hover:text-amber-200">
            <Headphones className="h-3 w-3 shrink-0 text-amber-300" />
            Bulk &amp; Wholesale
            <span className="hidden lg:inline">: {MILL_WHATSAPP_NUMBER}</span>
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4 lg:h-18">
          
          {/* Logo */}
          <div className="flex min-w-0 cursor-pointer items-center gap-2 sm:gap-3" onClick={() => scrollToSection('hero')}>
            <button
              onClick={(event) => {
                event.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="rounded-lg p-1.5 text-white hover:bg-emerald-800 md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-emerald-900 sm:h-11 sm:w-11">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="max-w-[120px] truncate font-serif text-[15px] font-black tracking-tight text-white sm:max-w-none sm:text-xl">
                  {brandTitle}
                </span>
              </div>
              <p className="truncate text-[7px] font-bold uppercase tracking-wider text-emerald-200 sm:text-[11px]">
                {brandSubtitle}
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm relative">
            <input
              type="text"
              placeholder="Search Peeli Sarso, 5L Can, Khali..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-emerald-900/70 text-white text-sm pl-10 pr-4 py-2 rounded-full border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-emerald-900 transition-all placeholder:text-emerald-200"
            />
            <Search className="w-4 h-4 text-emerald-200 absolute left-3.5 top-2.5" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-emerald-50">
            <button 
              onClick={() => scrollToSection('hero')} 
              className="hover:text-amber-300 transition-colors py-1 cursor-pointer"
            >
              {content?.navigation.home || 'Home'}
            </button>
            <button 
              onClick={() => scrollToSection('products')} 
              className="hover:text-amber-300 transition-colors py-1 cursor-pointer"
            >
              {content?.navigation.shop || 'Shop Oil'}
            </button>
            <button 
              onClick={() => scrollToSection('process')} 
              className="hover:text-amber-300 transition-colors py-1 cursor-pointer"
            >
              {content?.navigation.process || 'Cold-Press Process'}
            </button>
            <button 
              onClick={() => scrollToSection('comparison')} 
              className="hover:text-amber-300 transition-colors py-1 cursor-pointer"
            >
              {content?.navigation.comparison || 'Why ArshSarso'}
            </button>
            <button 
              onClick={onOpenLabReport} 
              className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors py-1 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{content?.navigation.labReports || 'Lab Reports & FSSAI'}</span>
            </button>
            <button 
              onClick={onOpenTrackOrder} 
              className="inline-flex items-center gap-1 text-emerald-50 hover:text-amber-300 transition-colors py-1 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>{content?.navigation.trackOrder || 'Track Order'}</span>
            </button>
            <button 
              onClick={onOpenWholesale} 
              className="text-emerald-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl border border-amber-300 transition-all font-bold cursor-pointer"
            >
              {content?.navigation.wholesale || 'B2B Wholesale'}
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="p-2 text-white hover:text-amber-300 lg:hidden rounded-lg hover:bg-emerald-800 transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-transparent p-1 hover:border-emerald-200 hover:bg-emerald-50 sm:px-3 sm:py-2"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                className="hidden h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/30 sm:block"
                  />
              <UserIcon className="h-5 w-5 text-white sm:hidden" />
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-white leading-tight max-w-[90px] truncate">{user.name}</p>
                    <p className="text-[10px] text-amber-300 font-medium capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-500">Signed in as</p>
                      <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium flex items-center gap-2 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-600" />
                      <span>My Profile & Orders</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenTrackOrder();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Track Live Order</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenNotifications();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span>Push Notification Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenLabReport();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium flex items-center gap-2 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>FSSAI Quality Certificate</span>
                    </button>

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700 p-1.5 text-white transition-all hover:bg-emerald-800 sm:rounded-xl sm:border-amber-300/70 sm:bg-amber-400 sm:px-4 sm:py-2 sm:text-sm sm:font-bold sm:text-emerald-950 sm:shadow-xs"
              >
                <UserIcon className="w-4 h-4 text-white sm:text-emerald-950" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Push Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="hidden rounded-xl border border-emerald-700 p-2.5 text-white transition-all hover:bg-emerald-800 sm:flex sm:items-center sm:justify-center"
              title="Order Status Alerts"
              aria-label="Order Status Alerts"
            >
              <Bell className="w-5 h-5 text-amber-300" />
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center rounded-lg p-1.5 text-white transition-all hover:bg-emerald-800 sm:rounded-xl sm:border sm:border-amber-300/70 sm:bg-amber-400 sm:p-2.5 sm:text-emerald-950 sm:shadow-md sm:hover:bg-amber-300"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-stone-900 ring-2 ring-white sm:-right-1.5 sm:-top-1.5 sm:h-5 sm:w-5 sm:text-[11px]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        {isSearchVisible && (
          <div className="pb-3 lg:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, sizes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-emerald-900 text-white text-sm pl-10 pr-4 py-2.5 rounded-xl border border-emerald-700 placeholder:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                autoFocus
              />
              <Search className="w-4 h-4 text-emerald-200 absolute left-3.5 top-3" />
            </div>
          </div>
        )}

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-800 py-4 px-2 space-y-2 bg-emerald-950 rounded-b-2xl shadow-lg">
            <button
              onClick={() => scrollToSection('hero')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-white hover:bg-emerald-800 hover:text-amber-300 font-semibold text-sm"
            >
              {content?.navigation.home || 'Home'}
            </button>
            <button
              onClick={() => scrollToSection('products')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-white hover:bg-emerald-800 hover:text-amber-300 font-semibold text-sm"
            >
              {content?.navigation.shop || 'Shop Cold-Pressed Oil'}
            </button>
            <button
              onClick={() => scrollToSection('process')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-white hover:bg-emerald-800 hover:text-amber-300 font-semibold text-sm"
            >
              {content?.navigation.process || 'Cold-Press & Sedimentation Process'}
            </button>
            <button
              onClick={() => scrollToSection('comparison')}
              className="w-full text-left px-4 py-2.5 rounded-xl text-white hover:bg-emerald-800 hover:text-amber-300 font-semibold text-sm"
            >
              {content?.navigation.comparison || 'Why ArshSarso vs Refined Oil'}
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLabReport();
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-white hover:bg-emerald-800 hover:text-amber-300 font-semibold text-sm flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{content?.navigation.labReports || 'Lab Reports & FSSAI Lic.'}</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenTrackOrder();
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-white hover:bg-emerald-800 hover:text-amber-300 font-semibold text-sm flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-amber-300" />
              <span>{content?.navigation.trackOrder || 'Track Live Order'}</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenNotifications();
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-white hover:bg-emerald-800 hover:text-amber-300 font-semibold text-sm flex items-center gap-2"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              <span>Push Notification Settings</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenWholesale();
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl bg-amber-400 text-emerald-950 font-bold text-sm border border-amber-300"
            >
              {content?.navigation.wholesale || 'B2B Wholesale / Dealership Inquiry'}
            </button>

            <a
              href={`https://wa.me/${MILL_WHATSAPP_NUMBER}?text=Hello%20Arsh%20Agro%20Industry,%20I%20would%20like%20to%20order.`}
              target="_blank"
              rel="noreferrer"
              className="w-full text-left px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order on WhatsApp (+91 84474 23416)</span>
            </a>

          </div>
        )}
      </div>
    </header>
  );
};
