import { getFunctions, httpsCallable } from 'firebase/functions';
import { Address, Order } from '../types';
import { app } from './firebase';

interface CheckoutInput {
  shippingAddress: Pick<Address, 'fullName' | 'phone' | 'street' | 'city' | 'state' | 'pincode' | 'landmark'>;
  items: Array<{ productId: string; quantity: number }>;
  couponCode: string;
}

interface OrderResponse {
  order: Order;
}

const functions = getFunctions(app, 'us-central1');

export async function getCheckoutSettings(): Promise<{
  freeShippingThreshold: number;
  standardShippingFee: number;
}> {
  const getSettings = httpsCallable<void, {
    freeShippingThreshold: number;
    standardShippingFee: number;
  }>(functions, 'getCheckoutSettings');
  const result = await getSettings();
  return result.data;
}

export async function createCashOnDeliveryOrder(input: CheckoutInput): Promise<Order> {
  const placeOrder = httpsCallable<CheckoutInput, OrderResponse>(functions, 'createCashOnDeliveryOrder');
  const result = await placeOrder(input);
  return result.data.order;
}

export async function createRazorpayOrder(input: CheckoutInput): Promise<{
  order: { id: string; amount: number; currency: string };
  keyId: string;
}> {
  const startPayment = httpsCallable<CheckoutInput, {
    order: { id: string; amount: number; currency: string };
    keyId: string;
  }>(functions, 'createRazorpayOrder');
  const result = await startPayment(input);
  return result.data;
}

export async function verifyRazorpayPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<Order> {
  const verifyPayment = httpsCallable<typeof input, OrderResponse>(functions, 'verifyRazorpayPayment');
  const result = await verifyPayment(input);
  return result.data.order;
}

export async function retryDelhiveryBooking(orderId: string): Promise<Order> {
  const retryBooking = httpsCallable<{ orderId: string }, OrderResponse>(functions, 'retryDelhiveryBooking');
  const result = await retryBooking({ orderId });
  return result.data.order;
}
