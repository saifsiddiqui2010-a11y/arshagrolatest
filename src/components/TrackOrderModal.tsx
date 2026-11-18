import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageCircle, 
  AlertCircle,
  Printer,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Bell,
  BellRing
} from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';
import { MILL_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { notificationService } from '../services/notifications';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  initialPhone?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
  initialPhone = '',
}) => {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [isSubscribedToPush, setIsSubscribedToPush] = useState(false);
  const [isRequestingPush, setIsRequestingPush] = useState(false);
  const [pushToast, setPushToast] = useState('');

  useEffect(() => {
    if (initialOrderId) setOrderIdInput(initialOrderId);
    if (initialPhone) setPhoneInput(initialPhone);
    if (initialOrderId && initialPhone && isOpen) {
      handleSearch(initialOrderId, initialPhone);
    }
  }, [initialOrderId, initialPhone, isOpen]);

  useEffect(() => {
    if (trackedOrder) {
      setIsSubscribedToPush(notificationService.isOrderSubscribed(trackedOrder.id));
    }
  }, [trackedOrder]);

  if (!isOpen) return null;

  const handleSearch = async (orderIdToSearch?: string, phoneToSearch?: string) => {
    const targetOrderId = (orderIdToSearch || orderIdInput).trim();
    const targetPhone = (phoneToSearch || phoneInput).trim();

    if (!targetOrderId) {
      setErrorMessage('Please enter your Order ID (e.g. ARSH-2026-7821)');
      return;
    }
    if (!targetPhone) {
      setErrorMessage('Please enter the 10-digit mobile number used when ordering.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Fetch from backend API
      const res = await api.trackOrder(targetOrderId, targetPhone);
      if (res.success && res.order) {
        setTrackedOrder(res.order);
        setIsLoading(false);
        return;
      }

      // 2. Fallback check directly in Firestore if available
      try {
        const cleanOId = targetOrderId.toUpperCase();
        const docRef = doc(db, 'orders', cleanOId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Order;
          const cleanPhoneDigits = targetPhone.replace(/\D/g, '');
          const orderPhoneDigits = String(data.customerPhone || '').replace(/\D/g, '');
          
          if (cleanPhoneDigits.length >= 5 && (orderPhoneDigits.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(orderPhoneDigits))) {
            setTrackedOrder(data);
            setIsLoading(false);
            return;
          }
        }
      } catch (fsErr) {
        // Defensive log using handleFirestoreError pattern
        console.warn('Firestore fallback track check skipped:', fsErr);
      }

      setErrorMessage(
        res.message || 'No matching order was found. Please check your Order ID and phone number or connect with our mill dispatch desk on WhatsApp.'
      );
    } catch (err: any) {
      setErrorMessage('Could not connect to tracking service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const handleFillDemo = (orderId: string, phone: string) => {
    setOrderIdInput(orderId);
    setPhoneInput(phone);
    handleSearch(orderId, phone);
  };

  const handleOptInPush = async () => {
    if (!trackedOrder) return;
    setIsRequestingPush(true);
    const granted = await notificationService.requestPermission();
    setIsRequestingPush(false);

    if (granted) {
      notificationService.subscribeOrder(trackedOrder.id, trackedOrder.customerPhone);
      setIsSubscribedToPush(true);
      await notificationService.sendOrderMilestoneAlert(
        trackedOrder.id,
        trackedOrder.orderStatus,
        {
          courierName: trackedOrder.courierName,
          trackingNumber: trackedOrder.trackingNumber,
          city: trackedOrder.shippingAddress.city
        }
      );
      setPushToast('Browser push notifications enabled! A test alert was delivered to your screen.');
      setTimeout(() => setPushToast(''), 4000);
    } else {
      setPushToast('Notification permission was dismissed or blocked in your browser.');
      setTimeout(() => setPushToast(''), 4000);
    }
  };

  const handleSendSamplePush = async () => {
    if (!trackedOrder) return;
    await notificationService.sendOrderMilestoneAlert(
      trackedOrder.id,
      trackedOrder.orderStatus,
      {
        courierName: trackedOrder.courierName,
        trackingNumber: trackedOrder.trackingNumber,
        city: trackedOrder.shippingAddress.city
      }
    );
    setPushToast('Sample order notification sent! Check your notification panel.');
    setTimeout(() => setPushToast(''), 4000);
  };

  const getStatusStepIndex = (status: Order['orderStatus']) => {
    switch (status) {
      case 'placed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Just now';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const currentStep = trackedOrder ? getStatusStepIndex(trackedOrder.orderStatus) : 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Deep Emerald */}
        <div className="bg-emerald-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Truck className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-heading text-white">
                Track Order & Live Shipment
              </h3>
              <p className="text-xs text-emerald-300 font-medium">
                Arsh Agro Industry • Siwan Mill Dispatch Desk
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Tracking Search Form */}
          <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 mb-3 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-emerald-700" />
              <span>Enter Order Credentials</span>
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Order ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ARSH-2026-7821"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Registered Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                {/* Demo Orders Quick Test */}
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 flex-wrap">
                  <span className="font-medium text-stone-600">Quick Test:</span>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('ARSH-2026-7821', '9876543210')}
                    className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    Delhivery Shipped (7821)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('ARSH-2026-7815', '9431288472')}
                    className="px-2 py-0.5 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    Processing COD (7815)
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Fetching Status...' : 'Track Shipment'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
              <a
                href={`https://wa.me/${MILL_WHATSAPP_NUMBER}?text=Namaste%20Arsh%20Agro,%20I%20am%20unable%20to%20track%20my%20order%20${encodeURIComponent(orderIdInput)}.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contact Mill WhatsApp</span>
              </a>
            </div>
          )}

          {/* Tracked Order Details View */}
          {trackedOrder && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Top Overview Strip */}
              <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-medium">Order Reference:</span>
                    <strong className="text-base font-black text-stone-900 font-mono tracking-tight">
                      {trackedOrder.id}
                    </strong>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Placed on {formatDateTime(trackedOrder.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                    trackedOrder.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    trackedOrder.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                    trackedOrder.orderStatus === 'processing' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    'bg-stone-200 text-stone-800'
                  }`}>
                    {trackedOrder.orderStatus === 'placed' && '1. Order Confirmed'}
                    {trackedOrder.orderStatus === 'processing' && '2. Mill Packing'}
                    {trackedOrder.orderStatus === 'shipped' && '3. In Transit'}
                    {trackedOrder.orderStatus === 'delivered' && '4. Delivered'}
                    {trackedOrder.orderStatus === 'cancelled' && 'Cancelled'}
                  </span>

                  <span className="text-xs font-extrabold text-stone-700 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                    {trackedOrder.paymentMethod === 'razorpay' ? 'Paid (Razorpay)' : 'Cash on Delivery'}
                  </span>
                </div>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
                <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Shipment Milestone Timeline</span>
                </h5>

                {/* Desktop Horizontal / Mobile Vertical Stepper */}
                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                    
                    {/* Step 1: Placed */}
                    <div className="flex sm:flex-col items-start gap-3 sm:gap-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        currentStep >= 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-stone-200 text-stone-500'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-stone-900">Order Placed</h6>
                        <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                          Payment confirmed & extraction scheduled
                        </p>
                        <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                          {formatDateTime(trackedOrder.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="flex sm:flex-col items-start gap-3 sm:gap-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        currentStep >= 2 ? 'bg-emerald-600 text-white shadow-sm' : 
                        currentStep === 1 ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400' : 'bg-stone-200 text-stone-500'
                      }`}>
                        {currentStep >= 2 ? <Check className="w-4 h-4" /> : '2'}
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-stone-900">Cold-Pressing & Pack</h6>
                        <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                          Wood-cold pressed, 48h sedimentation & induction seal
                        </p>
                        {currentStep >= 2 && (
                          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                            Siwan Mill Campus
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex sm:flex-col items-start gap-3 sm:gap-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        currentStep >= 3 ? 'bg-emerald-600 text-white shadow-sm' : 
                        currentStep === 2 ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-400' : 'bg-stone-200 text-stone-500'
                      }`}>
                        {currentStep >= 3 ? <Check className="w-4 h-4" /> : '3'}
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-stone-900">Handed to Courier</h6>
                        <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                          {trackedOrder.courierName || 'Delhivery Express'} dispatch
                        </p>
                        {trackedOrder.trackingNumber && (
                          <span className="text-[10px] font-mono text-stone-600 block mt-1">
                            AWB: {trackedOrder.trackingNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex sm:flex-col items-start gap-3 sm:gap-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        currentStep >= 4 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-stone-200 text-stone-500'
                      }`}>
                        {currentStep >= 4 ? <Check className="w-4 h-4" /> : '4'}
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-stone-900">Doorstep Delivery</h6>
                        <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                          {trackedOrder.shippingAddress.city}, {trackedOrder.shippingAddress.state}
                        </p>
                        <span className="text-[10px] text-stone-500 font-medium block mt-1">
                          Est: 2–4 business days
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Courier & AWB Card */}
              <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-emerald-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-emerald-200 uppercase font-bold tracking-wider block">
                        Assigned Courier Partner
                      </span>
                      <strong className="text-sm font-bold text-white">
                        {trackedOrder.courierName || 'Arsh Agro Mill Logistics / Delhivery Surface'}
                      </strong>
                    </div>
                  </div>

                  {trackedOrder.trackingNumber && (
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                      <div>
                        <span className="text-[10px] text-emerald-200 block leading-none">Courier Tracking AWB</span>
                        <span className="font-mono font-bold text-xs text-white">{trackedOrder.trackingNumber}</span>
                      </div>
                      <button
                        onClick={() => handleCopyAwb(trackedOrder.trackingNumber || '')}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        title="Copy AWB Number"
                      >
                        {copiedAwb ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-emerald-300 font-medium block">Recipient Customer:</span>
                    <p className="text-white font-bold">{trackedOrder.customerName}</p>
                    <p className="text-emerald-100/90">{trackedOrder.customerPhone}</p>
                  </div>

                  <div>
                    <span className="text-emerald-300 font-medium block">Shipping Destination:</span>
                    <p className="text-white font-medium">
                      {trackedOrder.shippingAddress.street}, {trackedOrder.shippingAddress.city}, {trackedOrder.shippingAddress.state} - {trackedOrder.shippingAddress.pincode}
                    </p>
                  </div>
                </div>

                {/* WhatsApp Live Update Button */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href={`https://wa.me/${MILL_WHATSAPP_NUMBER}?text=Namaste%20Arsh%20Agro,%20I%20am%20tracking%20my%20order%20${encodeURIComponent(trackedOrder.id)}%20(Phone:%20${encodeURIComponent(trackedOrder.customerPhone)}).%20Please%20provide%20live%20dispatch%20status.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-4 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                    <span>Get Real-Time WhatsApp Live Update</span>
                  </a>
                </div>
              </div>

              {/* Browser Push Notifications Opt-in Card */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    {isSubscribedToPush ? (
                      <BellRing className="w-5 h-5 text-emerald-100 animate-pulse" />
                    ) : (
                      <Bell className="w-5 h-5 text-emerald-100" />
                    )}
                  </div>
                  <div>
                    <h6 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <span>{isSubscribedToPush ? 'Browser Push Notifications Active' : 'Opt-in for Browser Push Notifications'}</span>
                      {isSubscribedToPush && (
                        <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          Enabled
                        </span>
                      )}
                    </h6>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      {isSubscribedToPush 
                        ? `Live updates for order ${trackedOrder.id} will pop up on this screen.`
                        : 'Get native alerts as your cold-pressed oil is extracted and dispatched from Siwan.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isSubscribedToPush ? (
                    <button
                      type="button"
                      onClick={handleSendSamplePush}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      Test Alert
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOptInPush}
                      disabled={isRequestingPush}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{isRequestingPush ? 'Enabling...' : 'Opt-in for Alerts'}</span>
                    </button>
                  )}
                </div>
              </div>

              {pushToast && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{pushToast}</span>
                </div>
              )}

              {/* Items in Order */}
              <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/70 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-700" />
                    <span>Items in this Consignment ({trackedOrder.items.length})</span>
                  </h5>
                  <span className="font-bold text-stone-600">
                    Total: <strong className="text-stone-900 font-extrabold text-sm">₹{trackedOrder.totalAmount}</strong>
                  </span>
                </div>

                <div className="divide-y divide-stone-200 bg-white rounded-xl border border-stone-200 overflow-hidden">
                  {trackedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-11 h-11 object-cover rounded-lg bg-emerald-50 shrink-0" 
                        />
                        <div>
                          <p className="font-bold text-stone-900">{item.name}</p>
                          <p className="text-[11px] text-stone-500">Size: {item.size} • Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-black text-stone-900">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset or Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTrackedOrder(null);
                    setErrorMessage('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-emerald-800 font-bold cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Track a Different Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 font-bold border border-stone-300 bg-white hover:bg-stone-50 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-500" />
                  <span>Print Receipt</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>FSSAI Certified Cold-Pressed Mill Facility</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
