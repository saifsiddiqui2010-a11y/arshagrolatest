export interface NutritionFacts {
  energy?: string;
  mufa?: string;
  pufa?: string;
  sfa?: string;
  omega3?: string;
  transFat?: string;
  cholesterol?: string;
  nitrogen?: string;
  phosphorus?: string;
  potassium?: string;
  organicMatter?: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'yellow-mustard' | 'kachi-ghani' | 'mustard-cake' | 'combo-packs';
  price: number;
  mrp: number;
  size: string;
  image: string;
  description: string;
  inStock: boolean;
  stockCount: number;
  shippingWeightGrams?: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  nutrition?: NutritionFacts;
  benefits?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
  addresses?: Address[];
  googleId?: string;
  createdAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address | {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'razorpay' | 'cod';
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  courierName?: string;
  trackingNumber?: string;
  shippingStatus?: 'booking' | 'booked' | 'failed' | 'needs_configuration' | 'review_required';
  shippingError?: string;
  createdAt: string;
}

export interface WholesaleInquiry {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  quantityNeeded: string;
  city: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  inquiriesCount: number;
}

export interface StoreSettings {
  freeShippingThreshold: number;
  standardShippingFee: number;
  millAddress: string;
  contactPhone: string;
  salesEmail: string;
  fssaiLicense: string;
  pgsIndiaCert: string;
  delhiveryEnabled?: boolean;
  delhiveryPickupLocationName?: string;
}
