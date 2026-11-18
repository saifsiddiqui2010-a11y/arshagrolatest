import React, { useState } from 'react';
import { Order } from '../types';
import { 
  CheckCircle2, 
  X, 
  Printer, 
  Truck, 
  MessageCircle, 
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { 
  getWhatsAppMillLink, 
  generateWhatsAppOrderMessage
} from '../utils/whatsapp';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onContinueShopping: () => void;
  onTrackOrder?: (orderId: string, phone: string) => void;
  showWhatsAppOrderAlert?: boolean;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onContinueShopping,
  onTrackOrder,
  showWhatsAppOrderAlert = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!order) return null;

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCopyMessage = () => {
    const rawMessage = decodeURIComponent(generateWhatsAppOrderMessage(order, 'mill'));
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-300 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Success Banner - Emerald Forest Green */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-white text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-serif-heading">
            Order Successfully Placed!
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Thank you for choosing pure, unrefined ArshSarso oil from Siwan, Bihar.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Order Details Header */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 flex flex-col sm:flex-row justify-between gap-3 text-xs">
            <div>
              <span className="text-stone-400 block font-medium">Order Number</span>
              <strong className="text-base text-stone-900 font-black">{order.id}</strong>
            </div>

            <div>
              <span className="text-stone-400 block font-medium">Payment Mode</span>
              <span className="inline-flex items-center gap-1 font-extrabold capitalize text-stone-800">
                {order.paymentMethod === 'razorpay' ? (
                  <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Paid via Razorpay
                  </span>
                ) : (
                  <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    Cash on Delivery
                  </span>
                )}
              </span>
            </div>

            {order.razorpayPaymentId && (
              <div>
                <span className="text-stone-400 block font-medium">Razorpay Txn ID</span>
                <span className="font-mono text-stone-700 text-[11px]">{order.razorpayPaymentId}</span>
              </div>
            )}
          </div>

          {showWhatsAppOrderAlert && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight">WhatsApp Order Alert</h4>
                  <p className="text-[11px] text-emerald-100">Review the prepared message and tap Send in WhatsApp.</p>
                </div>
              </div>
              <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Ready
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <a
                href={getWhatsAppMillLink(order)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Send order alert to Arsh Agro</span>
              </a>
            </div>

            {/* Toggle Preview */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-100">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="underline hover:text-white cursor-pointer font-medium"
              >
                {showPreview ? 'Hide Message Preview' : 'View Formatted WhatsApp Message'}
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1 hover:text-white cursor-pointer font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            {/* Message preview snippet */}
            {showPreview && (
              <div className="bg-black/30 backdrop-blur-xs p-3 rounded-xl text-[11px] font-mono text-emerald-100 whitespace-pre-wrap max-h-40 overflow-y-auto border border-emerald-400/30">
                {decodeURIComponent(generateWhatsAppOrderMessage(order, 'mill'))}
              </div>
            )}
          </div>
          )}

          {/* Logistics & Tracking info */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Mill Dispatch & Tracking Information</span>
            </div>
            <p className="text-stone-700">
              Courier Partner: <strong className="text-stone-900">{order.courierName || 'Delhivery Express'}</strong>
            </p>
            <p className="text-stone-700">
              Tracking AWB: <strong className="font-mono text-stone-900">{order.trackingNumber}</strong>
            </p>
            <p className="text-stone-500 text-[11px]">
              For dispatch or tracking questions, use the WhatsApp chat button. Updates are not sent automatically.
            </p>
          </div>

          {/* Delivery Address */}
          <div className="text-xs">
            <h5 className="font-bold text-stone-700 mb-1">Delivering to:</h5>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-800">
              <p className="font-bold">{order.customerName} ({order.customerPhone})</p>
              <p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="text-xs">
            <h5 className="font-bold text-stone-700 mb-1">Items Purchased:</h5>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-emerald-50" />
                    <div>
                      <p className="font-bold text-stone-900">{item.name}</p>
                      <p className="text-[11px] text-stone-500">Size: {item.size} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-stone-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between text-sm font-black p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-emerald-950">Total Paid Amount:</span>
            <span className="text-emerald-800 text-base">₹{order.totalAmount}</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrintInvoice}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-500" />
              <span>Print Invoice</span>
            </button>

            {onTrackOrder && (
              <button
                onClick={() => {
                  onClose();
                  onTrackOrder(order.id, order.customerPhone);
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition-colors cursor-pointer"
              >
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Track Shipment</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onContinueShopping();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
