import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  Truck, 
  ShieldCheck,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { MILL_WHATSAPP_NUMBER } from '../utils/whatsapp';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreProducts: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onExploreProducts,
}) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartCount,
    subtotal,
    discount,
    deliveryFee,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    amountNeededForFreeShipping
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', message: res.message });
    }
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const getWhatsAppCartOrderLink = () => {
    const itemsText = cart
      .map((it, i) => `${i + 1}. *${it.product.name}* (${it.selectedSize}) x ${it.quantity} = ₹${it.product.price * it.quantity}`)
      .join('\n');
    const msg = encodeURIComponent(
`Namaste Arsh Agro Industry, I would like to order from my cart:

${itemsText}

💰 *Subtotal:* ₹${subtotal}
🏷️ *Discount:* -₹${discount}
🚚 *Delivery:* ${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee}
💵 *Total Amount:* ₹${total}

Please guide me with payment and delivery confirmation!`
    );
    return `https://wa.me/${MILL_WHATSAPP_NUMBER}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h3 className="font-extrabold text-stone-900 text-base font-serif-heading">
              Your Oil Basket ({cartCount})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-emerald-100/70 px-5 py-3 border-b border-emerald-200 text-xs">
          {amountNeededForFreeShipping > 0 ? (
            <div>
              <p className="font-bold text-emerald-950 flex items-center gap-1.5 mb-1.5">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                Add <span className="text-emerald-800 font-black">₹{amountNeededForFreeShipping}</span> more for <strong>FREE Doorstep Delivery</strong>!
              </p>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-emerald-300">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              🎉 Congratulations! You have unlocked <strong>FREE Delivery</strong> across India!
            </p>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-700">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-stone-800">Your basket is empty</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 mb-6">
                Freshly extracted cold-pressed oils from our Siwan mill are waiting for your kitchen!
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onExploreProducts();
                }}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
              >
                Explore Pure Oils
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div 
                key={`${item.product.id}-${item.selectedSize}-${idx}`}
                className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 hover:border-emerald-200 transition-colors"
              >
                {/* Thumbnail */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-emerald-50 shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-stone-900 truncate">
                    {item.product.name}
                  </h5>
                  <p className="text-[11px] text-emerald-800 font-semibold">
                    Size: {item.selectedSize}
                  </p>
                  <p className="text-xs font-extrabold text-stone-900 mt-0.5">
                    ₹{item.product.price}
                  </p>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-bold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-100"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                      className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Total for this line */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-stone-900">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Coupon Code Section */}
        {cart.length > 0 && (
          <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/50">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Coupon {appliedCoupon} applied!</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-stone-400 hover:text-red-600 font-bold ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Coupon: ARSHFIRST or SARSO50"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full text-xs bg-white border border-stone-300 rounded-xl px-3 py-2 uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Apply
                  </button>
                </form>
                {couponFeedback && (
                  <p className={`text-[11px] font-semibold mt-1.5 ${
                    couponFeedback.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {couponFeedback.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer & Checkout Trigger */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-emerald-100 bg-white space-y-3">
            {/* Bill Summary */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Doorstep Delivery</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-stone-900 font-black text-sm pt-1 border-t border-stone-200">
                <span>Total Amount</span>
                <span className="text-emerald-950 text-base">₹{total}</span>
              </div>
            </div>

            {/* Checkout with Razorpay */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick WhatsApp Checkout Option */}
            <a
              href={getWhatsAppCartOrderLink()}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Confirm Order on WhatsApp</span>
            </a>

            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
