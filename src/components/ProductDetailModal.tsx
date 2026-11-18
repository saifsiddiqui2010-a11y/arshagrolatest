import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Star, 
  ShieldCheck, 
  Check, 
  Truck, 
  RotateCcw, 
  ShoppingBag, 
  Zap,
  Droplet,
  MessageCircle
} from 'lucide-react';
import { MILL_WHATSAPP_NUMBER } from '../utils/whatsapp';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, size: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow,
}) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(product?.size || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  if (!product) return null;

  const currentSize = selectedSize || product.size;
  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAdd = () => {
    addToCart(product, currentSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const getWhatsAppProductInquiry = () => {
    const msg = encodeURIComponent(
      `Hello Arsh Agro Industry, I am looking to buy *${product.name}* (${currentSize}, Qty: ${quantity}). Price: ₹${product.price * quantity}. Please confirm availability and shipping.`
    );
    return `https://wa.me/${MILL_WHATSAPP_NUMBER}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-stone-100 text-stone-600 shadow-md transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image */}
        <div className="w-full md:w-1/2 bg-emerald-50/50 relative flex items-center justify-center p-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-h-72 md:max-h-96 object-contain rounded-2xl"
          />
          <div className="absolute bottom-4 left-4 bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900 shadow-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>FSSAI Certified Pure</span>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                {product.category.replace('-', ' ')}
              </span>
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-stone-400 font-normal">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug font-serif-heading mb-2">
              {product.name}
            </h2>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl sm:text-3xl font-black text-emerald-950">
                ₹{product.price}
              </span>
              <span className="text-sm font-semibold text-stone-400 line-through">
                ₹{product.mrp}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-5">
              {product.description}
            </p>

            {/* Nutrition Facts Table */}
            {product.nutrition && (
              <div className="mb-5 bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-100 text-xs">
                <p className="font-bold text-emerald-950 mb-2 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-emerald-700" /> Key Nutritional Profile (per 100g)
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-xl shadow-2xs">
                    <span className="block text-stone-400 text-[10px]">Energy</span>
                    <span className="font-bold text-stone-800">{product.nutrition.energy || '884 kcal'}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl shadow-2xs">
                    <span className="block text-stone-400 text-[10px]">MUFA (Good Fat)</span>
                    <span className="font-bold text-emerald-700">{product.nutrition.mufa || '65g'}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl shadow-2xs">
                    <span className="block text-stone-400 text-[10px]">Omega-3</span>
                    <span className="font-bold text-emerald-800">{product.nutrition.omega3 || '11g'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center gap-4 mb-5">
              <span className="text-xs font-bold text-stone-700">Quantity:</span>
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-stone-600 hover:bg-stone-200 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1 text-xs font-bold text-stone-900 bg-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-stone-600 hover:bg-stone-200 font-bold"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                Subtotal: <strong className="text-stone-900">₹{product.price * quantity}</strong>
              </span>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 mb-5 font-medium">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fast Dispatch from Siwan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Damaged transit replacement</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAdd}
                className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAdded
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onClose();
                  onBuyNow(product, currentSize);
                }}
                className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy with Razorpay</span>
              </button>
            </div>

            {/* Direct WhatsApp purchase link */}
            <a
              href={getWhatsAppProductInquiry()}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3 bg-emerald-100/70 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>Confirm This Order on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
