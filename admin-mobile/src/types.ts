export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type InquiryStatus = 'new' | 'contacted' | 'closed';
export type ProductCategory = 'yellow-mustard' | 'kachi-ghani' | 'mustard-cake' | 'combo-packs';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
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
  benefits?: string[];
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  shippingStatus?: 'booking' | 'booked' | 'failed' | 'needs_configuration' | 'review_required';
  shippingError?: string;
  createdAt?: string;
  items: OrderItem[];
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export interface Customer {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
}

export interface WholesaleInquiry {
  id: string;
  name: string;
  businessName?: string;
  phone: string;
  email?: string;
  quantityNeeded?: string;
  city?: string;
  message?: string;
  status: InquiryStatus;
  createdAt?: string;
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

export interface DashboardData {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  inquiries: WholesaleInquiry[];
  settings: StoreSettings;
  stats: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalCustomers: number;
    lowStockCount: number;
    inquiriesCount: number;
  };
}
