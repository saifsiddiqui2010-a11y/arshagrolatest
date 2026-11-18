/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { subscribeToProducts } from './services/storeData';
import { defaultWebsiteContent, subscribeToWebsiteContent, WebsiteContent } from './services/websiteContent';
import { Product, Order } from './types';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBadges } from './components/TrustBadges';
import { ProductCatalog } from './components/ProductCatalog';
import { ColdPressProcess } from './components/ColdPressProcess';
import { OilComparison } from './components/OilComparison';
import { WholesaleB2BSection } from './components/WholesaleB2BSection';
import { CustomerReviews } from './components/CustomerReviews';
import { Footer } from './components/Footer';

import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { LabReportModal } from './components/LabReportModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { NotificationModal } from './components/NotificationModal';
import { notificationService } from './services/notifications';
import { getWhatsAppChatLink } from './utils/whatsapp';
import { MessageCircle } from 'lucide-react';
import { CustomWebsiteSection } from './components/CustomWebsiteSection';
import { MobileBottomNav } from './components/MobileBottomNav';
import { StoreBanner } from './components/StoreBanner';

function MainApp() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent>(defaultWebsiteContent);
  const [isWebsiteContentReady, setIsWebsiteContentReady] = useState(false);
  const [websiteContentLoadError, setWebsiteContentLoadError] = useState('');
  const hasLoadedWebsiteContent = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLabReportOpen, setIsLabReportOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [trackOrderParams, setTrackOrderParams] = useState<{ orderId?: string; phone?: string }>({});
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showWhatsAppOrderAlert, setShowWhatsAppOrderAlert] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Service Worker message listener (e.g. user clicked on order push notification)
    const unsubscribe = notificationService.onMessage((data) => {
      if (data && data.type === 'OPEN_TRACK_ORDER' && data.orderId) {
        handleOpenTrackOrder(data.orderId, data.phone);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribeProducts = subscribeToProducts(
      (nextProducts) => {
        setProducts(nextProducts);
        setIsLoading(false);
      },
      (error) => {
        console.error('Failed to subscribe to products:', error);
        setIsLoading(false);
      }
    );
    const unsubscribeWebsiteContent = subscribeToWebsiteContent(
      (content) => {
        hasLoadedWebsiteContent.current = true;
        setWebsiteContent(content);
        setIsWebsiteContentReady(true);
        setWebsiteContentLoadError('');
      },
      (error) => {
        console.error('Failed to subscribe to website content:', error);
        if (!hasLoadedWebsiteContent.current) {
          setWebsiteContentLoadError('The latest store content could not be loaded.');
        }
      }
    );
    return () => {
      unsubscribeProducts();
      unsubscribeWebsiteContent();
    };
  }, []);

  useEffect(() => {
    if (!isWebsiteContentReady) return;
    document.title = websiteContent.seo.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = websiteContent.seo.description;
  }, [isWebsiteContentReady, websiteContent.seo]);

  useEffect(() => {
    setSelectedProduct((current) => {
      if (!current) return current;
      return products.find((product) => product.id === current.id) || null;
    });
  }, [products]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBuyNow = (product: Product, size: string) => {
    addToCart(product, size, 1);
    setIsCheckoutOpen(true);
  };

  const handleOpenTrackOrder = (orderId?: string, phone?: string) => {
    setTrackOrderParams({ orderId: orderId || '', phone: phone || '' });
    setIsTrackOrderOpen(true);
  };

  if (!isWebsiteContentReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ea] px-4 text-center">
        {websiteContentLoadError ? (
          <div role="alert" className="max-w-sm">
            <p className="text-sm font-semibold text-stone-800">{websiteContentLoadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-900"
            >
              Try again
            </button>
          </div>
        ) : (
          <div role="status" aria-live="polite">
            <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-emerald-800/20 border-t-emerald-800" />
            <p className="text-sm font-semibold text-emerald-950">Loading the latest ArshSarso store...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5ea] flex flex-col font-sans">
      {/* Main Header */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLabReport={() => setIsLabReportOpen(true)}
        onOpenWholesale={() => scrollTo('wholesale')}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        content={websiteContent.header}
      />

      <StoreBanner
        enabled={websiteContent.header.bannerEnabled}
        slides={websiteContent.header.bannerSlides}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {websiteContent.sections.filter((section) => section.visible).map((section) => {
          switch (section.type) {
            case 'hero':
              return (
                <Hero
                  key={section.id}
                  content={section}
                  onShopClick={() => scrollTo('products')}
                  onStoryClick={() => scrollTo('farm-story')}
                  onWholesaleClick={() => scrollTo('wholesale')}
                  onLabClick={() => setIsLabReportOpen(true)}
                  products={products}
                />
              );
            case 'trust':
              return <TrustBadges key={section.id} content={section} />;
            case 'products':
              return (
                <ProductCatalog
                  key={section.id}
                  products={products}
                  onSelectProduct={(product) => setSelectedProduct(product)}
                  onBuyNow={handleBuyNow}
                  searchQuery={searchQuery}
                  content={section}
                  isLoading={isLoading}
                />
              );
            case 'process':
              return <ColdPressProcess key={section.id} content={section} />;
            case 'comparison':
              return <OilComparison key={section.id} content={section} />;
            case 'wholesale':
              return <WholesaleB2BSection key={section.id} content={section} />;
            case 'reviews':
              return <CustomerReviews key={section.id} content={section} />;
            case 'custom':
              return <CustomWebsiteSection key={section.id} section={section} />;
          }
        })}
      </main>

      {/* Footer */}
      <Footer
        onOpenLabReport={() => setIsLabReportOpen(true)}
        onOpenWholesale={() => scrollTo('wholesale')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        content={{ ...websiteContent.footer, ...websiteContent.header }}
      />

      <MobileBottomNav
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <a
        href={getWhatsAppChatLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Arsh Agro Industry on WhatsApp"
        className="fixed right-4 bottom-6 z-30 hidden items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-emerald-300 sm:inline-flex"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Chat on WhatsApp</span>
      </a>

      {/* Side Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreProducts={() => scrollTo('products')}
      />

      {/* Checkout Modal with Razorpay */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order, shouldSendWhatsAppConfirmation) => {
          setCompletedOrder(order);
          setShowWhatsAppOrderAlert(shouldSendWhatsAppConfirmation);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Order Confirmed Receipt Modal */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          showWhatsAppOrderAlert={showWhatsAppOrderAlert}
          onContinueShopping={() => {
            setCompletedOrder(null);
            scrollTo('products');
          }}
          onTrackOrder={(orderId, phone) => handleOpenTrackOrder(orderId, phone)}
        />
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={handleBuyNow}
      />

      {/* Lab Report & FSSAI Modal */}
      <LabReportModal
        isOpen={isLabReportOpen}
        onClose={() => setIsLabReportOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsAuthOpen(false)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onTrackOrder={(orderId, phone) => handleOpenTrackOrder(orderId, phone)}
      />

      {/* Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        initialOrderId={trackOrderParams.orderId}
        initialPhone={trackOrderParams.phone}
      />

      {/* Browser Notification Opt-in Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onOpenTrackOrder={(orderId) => handleOpenTrackOrder(orderId)}
      />
    </div>
  );
}

function AdminRoute() {
  return (
    <div className="min-h-screen bg-stone-100">
      <AdminPanelModal
        isOpen
        onClose={() => window.location.assign('/')}
      />
    </div>
  );
}

export default function App() {
  const isAdminRoute = window.location.pathname.replace(/\/+$/, '') === '/admin';

  return (
    <AuthProvider>
      {isAdminRoute ? (
        <AdminRoute />
      ) : (
        <CartProvider>
          <MainApp />
        </CartProvider>
      )}
    </AuthProvider>
  );
}
