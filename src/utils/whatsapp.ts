import { Order } from '../types';

export const MILL_WHATSAPP_NUMBER = '918447423416'; // Official Arsh Agro Industry WhatsApp

export function getWhatsAppChatLink(message = 'Hello Arsh Agro Industry, I have a question about your products.') {
  return `https://wa.me/${MILL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppOrderMessage(order: Order, recipient: 'mill' | 'customer' = 'mill'): string {
  const itemsText = order.items
    .map((item, idx) => `${idx + 1}. *${item.name}* (${item.size}) × ${item.quantity} = ₹${item.price * item.quantity}`)
    .join('\n');

  if (recipient === 'mill') {
    return encodeURIComponent(
`🌿 *NEW ORDER RECEIVED - ARSH AGRO INDUSTRY* 🌿

📦 *Order ID:* ${order.id}
👤 *Customer Name:* ${order.customerName}
📞 *Mobile:* ${order.customerPhone}
✉️ *Email:* ${order.customerEmail}

📍 *Shipping Address:*
${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}

🛒 *Items Ordered:*
${itemsText}

💰 *Subtotal:* ₹${order.subtotal}
🏷️ *Discount:* -₹${order.discount}
🚚 *Delivery Fee:* ${order.deliveryFee === 0 ? 'FREE' : '₹' + order.deliveryFee}
💵 *Total Amount:* ₹${order.totalAmount}

💳 *Payment Method:* ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})
${order.razorpayPaymentId ? `🔖 *Razorpay Payment ID:* ${order.razorpayPaymentId}\n` : ''}
🚚 *Courier Partner:* ${order.courierName || 'Delhivery / Mill Logistics'}
📋 *Tracking AWB:* ${order.trackingNumber || 'Pending Dispatch'}

_Please confirm packaging and dispatch from Hathaura, Siwan mill._`
    );
  } else {
    return encodeURIComponent(
`🌿 *ARSH AGRO INDUSTRY - ORDER CONFIRMATION* 🌿
_Pure • Unrefined • Farm to Bottle_

Namaste *${order.customerName}*,
Thank you for your order! Your 100% pure cold-pressed mustard oil is being freshly packed at our Siwan, Bihar mill.

📦 *Order Number:* ${order.id}
💵 *Amount Paid:* ₹${order.totalAmount}
💳 *Payment Mode:* ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})

🛒 *Items:*
${itemsText}

📍 *Delivering To:*
${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}

🚚 *Courier Tracking AWB:* ${order.trackingNumber || 'Will be shared upon dispatch'}

For any order inquiry or support, reply directly to this message or call our Siwan mill at +91 84474 23416.
Visit: https://arshagroindustry.com`
    );
  }
}

export function getWhatsAppMillLink(order: Order): string {
  const msg = generateWhatsAppOrderMessage(order, 'mill');
  return `https://wa.me/${MILL_WHATSAPP_NUMBER}?text=${msg}`;
}

export function getWhatsAppCustomerLink(order: Order): string {
  const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');
  const targetNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const msg = generateWhatsAppOrderMessage(order, 'customer');
  return `https://wa.me/${targetNumber || MILL_WHATSAPP_NUMBER}?text=${msg}`;
}
