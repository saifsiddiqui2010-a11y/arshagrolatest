import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order, Address } from '../types';
import {
  createCashOnDeliveryOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../services/orders';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  MapPin, 
  Lock, 
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MILL_WHATSAPP_NUMBER } from '../utils/whatsapp';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order, sendWhatsAppConfirmation: boolean) => void;
  onOpenAuth: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const getCheckoutErrorMessage = (error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : '';
  if (/unexpected token|not valid json|<!doctype/i.test(message)) {
    return 'Secure checkout is unavailable. Your order or payment status could not be confirmed. Please contact store support before retrying.';
  }
  return message || fallback;
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  onOpenAuth,
}) => {
  const { user, addAddress } = useAuth();
  const { cart, subtotal, discount, deliveryFee, total, appliedCoupon, clearCart } = useCart();

  // Form states
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: 'Bihar',
    pincode: '',
    landmark: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [sendWhatsAppConfirmation, setSendWhatsAppConfirmation] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setIsAddingNewAddress(false);
    } else {
      setIsAddingNewAddress(true);
      if (user) {
        setAddressForm((prev) => ({
          ...prev,
          fullName: user.name || prev.fullName,
          phone: user.phone || prev.phone
        }));
      }
    }
  }, [user]);

  if (!isOpen) return null;

  const getEffectiveAddress = (): Address | {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  } => {
    if (!isAddingNewAddress && user?.addresses && selectedAddressId) {
      const found = user.addresses.find((a) => a.id === selectedAddressId);
      if (found) return found;
    }
    return addressForm;
  };

  const createCheckoutInput = () => ({
    shippingAddress: getEffectiveAddress(),
    items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
    couponCode: appliedCoupon || '',
  });

  const completeOrder = (order: Order) => {
    clearCart();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    onOrderSuccess(order, sendWhatsAppConfirmation);
    onClose();
  };

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const currentAddr = getEffectiveAddress();
    if (!currentAddr.fullName || !currentAddr.phone || !currentAddr.street || !currentAddr.city || !currentAddr.pincode) {
      setErrorMessage('Please complete all required shipping address fields.');
      return;
    }

    // Save address for logged-in user if new
    if (user && isAddingNewAddress) {
      addAddress({
        fullName: addressForm.fullName,
        phone: addressForm.phone,
        street: addressForm.street,
        city: addressForm.city,
        state: addressForm.state,
        pincode: addressForm.pincode,
        landmark: addressForm.landmark,
        isDefault: true
      });
    }

    setIsProcessing(true);

    // 1. Cash on Delivery Flow
    if (paymentMethod === 'cod') {
      try {
        const order = await createCashOnDeliveryOrder(createCheckoutInput());
        completeOrder(order);
      } catch (err: unknown) {
        setErrorMessage(getCheckoutErrorMessage(err, 'Error processing Cash on Delivery order.'));
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // 2. Razorpay Payment Gateway Flow
    try {
      const { order: razorpayOrder, keyId } = await createRazorpayOrder(createCheckoutInput());
      if (typeof window.Razorpay !== 'function') {
        throw new Error('Secure online checkout is unavailable. Please try again later or choose Cash on Delivery.');
      }

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Arsh Agro Industry',
        description: 'ArshSarso Pure Cold Pressed Mustard Oil',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&q=80',
        order_id: razorpayOrder.id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setIsProcessing(true);
          try {
            const order = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id || razorpayOrder.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            completeOrder(order);
          } catch (error) {
            setErrorMessage(getCheckoutErrorMessage(error, 'Payment verification failed.'));
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: currentAddr.fullName,
          email: user?.email || '',
          contact: currentAddr.phone,
        },
        theme: { color: '#15803d' },
        modal: { ondismiss: () => setIsProcessing(false) },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', (response: { error?: { description?: string } }) => {
        setErrorMessage(response.error?.description || 'Payment failed.');
        setIsProcessing(false);
      });
      rzpInstance.open();
      setIsProcessing(false);
    } catch (err: unknown) {
      setErrorMessage(getCheckoutErrorMessage(err, 'Unable to start secure online payment.'));
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div 
          className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[95vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Green */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-emerald-50/70">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-stone-900 text-lg font-serif-heading">
                  Secure Checkout
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Arsh Agro Industry • Direct Mill Dispatch, Siwan Bihar
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleStartPayment} className="p-5 overflow-y-auto space-y-6">
            
            {/* User Login Prompt if Guest */}
            {!user && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block">Already have an account?</span>
                  <span className="text-stone-600">Sign in to use your saved addresses and track orders.</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Shipping Address */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>1. Delivery Address</span>
                </h4>
                {user?.addresses && user.addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                    className="text-xs font-bold text-emerald-800 hover:underline"
                  >
                    {isAddingNewAddress ? 'Select Saved Address' : '+ Add New Address'}
                  </button>
                )}
              </div>

              {/* Saved Address Cards */}
              {!isAddingNewAddress && user?.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-xs ${
                        selectedAddressId === addr.id
                          ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                          : 'border-stone-200 hover:border-emerald-300 bg-stone-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-stone-900">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded-md font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-stone-600 line-clamp-2">{addr.street}</p>
                      <p className="text-stone-600 font-medium">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-stone-500 mt-1">Phone: {addr.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                /* New Address Fields */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50/60 p-4 rounded-2xl border border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Receiver's name"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      House / Flat No., Road / Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 301, Sunshine Heights, Bailey Road"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">City / District *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Siwan, Patna, Delhi"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="6-digit PIN code"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method Selection */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-3">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>2. Payment Option</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Razorpay Option */}
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                      : 'border-stone-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-emerald-700 flex items-center justify-center">
                        {paymentMethod === 'razorpay' && <span className="w-2 h-2 rounded-full bg-emerald-700"></span>}
                      </span>
                      <span className="font-extrabold text-stone-900 text-sm">
                        Razorpay Secure
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2 py-0.5 rounded-full">
                      Instant
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 pl-6">
                    UPI (Google Pay, PhonePe, Paytm, QR), Credit/Debit Cards, NetBanking.
                  </p>
                </div>

                {/* Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                      : 'border-stone-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-stone-300 flex items-center justify-center">
                        {paymentMethod === 'cod' && <span className="w-2 h-2 rounded-full bg-emerald-700"></span>}
                      </span>
                      <span className="font-extrabold text-stone-900 text-sm">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    <Truck className="w-4 h-4 text-stone-400" />
                  </div>
                  <p className="text-xs text-stone-600 pl-6">
                    Pay with cash when courier delivers the oil can/bottles at your door.
                  </p>
                </div>

              </div>
            </div>

            {/* WhatsApp order alert opt-in */}
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="wa_confirm"
                checked={sendWhatsAppConfirmation}
                onChange={(e) => setSendWhatsAppConfirmation(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-stone-300"
              />
              <label htmlFor="wa_confirm" className="text-xs text-stone-700 cursor-pointer">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Prepare an order alert for WhatsApp
                </span>
                <span className="text-[11px] text-stone-600 block mt-0.5">
                  A Send Order Alert button will appear after checkout. WhatsApp will prepare the order details; tap Send to notify our desk.
                </span>
              </label>
            </div>

            {/* Step 3: Order Items Summary */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs">
              <h5 className="font-bold text-stone-800 mb-2">Order Items ({cart.length})</h5>
              <div className="divide-y divide-stone-200/60 max-h-36 overflow-y-auto">
                {cart.map((item, i) => (
                  <div key={i} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-stone-900">{item.product.name}</span>
                      <span className="text-stone-500 ml-1">({item.selectedSize}) x {item.quantity}</span>
                    </div>
                    <span className="font-bold text-stone-800">₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 mt-3 border-t border-stone-200 space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Doorstep Delivery</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-black text-sm pt-1 border-t border-stone-200">
                  <span>Total Payable</span>
                  <span className="text-emerald-950 text-base">₹{total}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-400 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <span>Processing Transaction...</span>
              ) : paymentMethod === 'razorpay' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{total} via Razorpay Gateway</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Confirm Cash on Delivery Order (₹{total})</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-stone-400 font-medium">
              🔒 100% Protected by Razorpay 256-Bit SSL Encryption • Instant Refund Policy
            </div>

          </form>
        </div>
      </div>

    </>
  );
};
