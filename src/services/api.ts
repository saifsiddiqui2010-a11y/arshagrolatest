import { Product, Order, User, Address, WholesaleInquiry, AdminStats, StoreSettings } from '../types';

export const api = {
  // Products
  async getProducts(): Promise<{ success: boolean; products: Product[] }> {
    const res = await fetch('/api/products');
    return res.json();
  },

  async createProduct(productData: Partial<Product>): Promise<{ success: boolean; product: Product }> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<{ success: boolean; product: Product }> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Auth
  async register(name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });
    return res.json();
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async googleAuth(payload: { credential?: string; profile?: any }): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async updateProfile(userId: string, name: string, phone: string): Promise<{ success: boolean; user?: User; message?: string }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, phone }),
    });
    return res.json();
  },

  async addAddress(userId: string, address: Omit<Address, 'id'>): Promise<{ success: boolean; user?: User; address?: Address }> {
    const res = await fetch('/api/auth/address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, address }),
    });
    return res.json();
  },

  async deleteAddress(userId: string, addressId: string): Promise<{ success: boolean; user?: User }> {
    const res = await fetch(`/api/auth/address/${addressId}?userId=${userId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Orders
  async trackOrder(orderId: string, phone: string): Promise<{ success: boolean; order?: Order; message?: string }> {
    const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`);
    return res.json();
  },

  async getOrders(userId?: string, role?: string): Promise<{ success: boolean; orders: Order[] }> {
    const query = role === 'admin' ? '?role=admin' : userId ? `?userId=${userId}` : '';
    const res = await fetch(`/api/orders${query}`);
    return res.json();
  },

  async updateOrderStatus(orderId: string, statusData: {
    orderStatus?: string;
    trackingNumber?: string;
    courierName?: string;
    paymentStatus?: string;
  }): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData),
    });
    return res.json();
  },

  // Wholesale Inquiries
  async submitInquiry(data: Omit<WholesaleInquiry, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; inquiry: WholesaleInquiry }> {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getInquiries(): Promise<{ success: boolean; inquiries: WholesaleInquiry[] }> {
    const res = await fetch('/api/inquiries');
    return res.json();
  },

  async updateInquiryStatus(id: string, status: 'new' | 'contacted' | 'closed'): Promise<{ success: boolean; inquiry: WholesaleInquiry }> {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Admin stats & Settings
  async getAdminStats(): Promise<{ success: boolean; stats: AdminStats }> {
    const res = await fetch('/api/admin/stats');
    return res.json();
  },

  async getSettings(): Promise<{ success: boolean; settings: StoreSettings }> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<{ success: boolean; settings: StoreSettings }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  }
};
