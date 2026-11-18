import React, { useState, useEffect } from 'react';
import { Order, Product, WholesaleInquiry, AdminStats, StoreSettings } from '../types';
import {
  deleteProduct,
  getAdminData,
  saveProduct,
  saveStoreSettings,
  updateInquiry,
  updateOrder,
} from '../services/storeData';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings as SettingsIcon, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Plus, 
  Phone, 
  Mail, 
  Lock,
  FileText,
  Printer,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { getWhatsAppCustomerLink, MILL_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { notificationService } from '../services/notifications';
import { retryDelhiveryBooking } from '../services/orders';
import { useAuth } from '../context/AuthContext';
import { WebsiteContentEditor } from './WebsiteContentEditor';
import { ImageUploadField } from './ImageUploadField';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsUpdated?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onProductsUpdated,
}) => {
  const { user, isAdmin, isLoading: isAuthLoading, loginWithGoogle, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'inventory' | 'leads' | 'website' | 'settings'>('stats');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [dataError, setDataError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<WholesaleInquiry[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('');

  // New/Edit product state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductImageUploading, setIsProductImageUploading] = useState(false);

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadAllAdminData();
    }
  }, [isOpen, isAdmin]);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    setDataError('');
    try {
      const data = await getAdminData();
      setStats(data.stats);
      setOrders(data.orders);
      setProducts(data.products);
      setLeads(data.inquiries);
      setSettings(data.settings);
    } catch (e) {
      console.error('Error loading admin data:', e);
      setDataError(e instanceof Error ? e.message : 'Could not load admin data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError('');
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setAuthError(result.message || 'Google sign-in failed.');
      }
    } catch (error) {
      console.error('Admin Google sign-in failed:', error);
      setAuthError('Google sign-in could not be completed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
        <section className="w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-300 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-emerald-950 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-amber-300" />
              <h1 className="font-bold">Arsh Agro Admin</h1>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-emerald-200 hover:bg-emerald-900" aria-label="Close admin">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4 p-6 text-center">
            {isAuthLoading ? (
              <p className="text-sm text-stone-600">Checking sign-in status…</p>
            ) : user ? (
              <>
                <h2 className="text-lg font-bold text-stone-900">Administrator access required</h2>
                <p className="text-sm text-stone-600">
                  The signed-in account ({user.email}) is not authorized for this page.
                </p>
                <button onClick={logout} className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-bold text-stone-700 hover:bg-stone-200">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-stone-900">Administrator sign-in</h2>
                <p className="text-sm text-stone-600">Continue with an authorized Google account to access store administration.</p>
                {authError && <p role="alert" className="text-sm font-medium text-red-700">{authError}</p>}
                <button
                  onClick={() => void handleGoogleSignIn()}
                  disabled={isSigningIn}
                  className="rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSigningIn ? 'Signing in…' : 'Continue with Google'}
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    );
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setActionError('');
    try {
      const order = await updateOrder(orderId, {
        orderStatus: newStatus as Order['orderStatus'],
        ...(trackingInput ? { trackingNumber: trackingInput } : {}),
        ...(courierInput ? { courierName: courierInput } : {}),
      });
      setOrders(orders.map((o) => (o.id === orderId ? order : o)));
      setEditingOrder(null);
      setTrackingInput('');
      setCourierInput('');

      // Dispatch live browser push notification
      notificationService.sendOrderMilestoneAlert(
        order.id,
        order.orderStatus,
        {
          courierName: order.courierName,
          trackingNumber: order.trackingNumber,
          city: order.shippingAddress.city
        }
      );
    } catch (error) {
      console.error('Could not update order:', error);
      setActionError(error instanceof Error ? error.message : 'Could not update order status.');
    }
  };

  const handleRetryDelhivery = async (orderId: string) => {
    setActionError('');
    try {
      const order = await retryDelhiveryBooking(orderId);
      setOrders((current) => current.map((item) => item.id === orderId ? order : item));
    } catch (error) {
      console.error('Could not create Delhivery shipment:', error);
      setActionError(error instanceof Error ? error.message : 'Could not create Delhivery shipment.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProductImageUploading) return;
    if (!editingProduct?.name || editingProduct.price === undefined) {
      setActionError('Enter a product name and price before saving.');
      return;
    }

    setActionError('');
    setIsSaving(true);
    try {
      const product = await saveProduct({
        ...editingProduct,
        image: editingProduct.image || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
        category: editingProduct.category || 'yellow-mustard',
        rating: 5.0,
        reviewCount: 1,
        featured: false
      });
      setProducts((current) => editingProduct.id
        ? current.map((item) => item.id === product.id ? product : item)
        : [...current, product]);
      setShowProductForm(false);
      setEditingProduct(null);
      onProductsUpdated?.();
    } catch (error) {
      console.error('Could not save product:', error);
      setActionError(error instanceof Error ? error.message : 'Could not save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setActionError('');
      try {
        await deleteProduct(id);
        setProducts((current) => current.filter((product) => product.id !== id));
        onProductsUpdated?.();
      } catch (error) {
        console.error('Could not delete product:', error);
        setActionError(error instanceof Error ? error.message : 'Could not delete product.');
      }
    }
  };

  const handleLeadStatus = async (id: string, status: 'new' | 'contacted' | 'closed') => {
    setActionError('');
    try {
      const inquiry = await updateInquiry(id, status);
      setLeads(leads.map((l) => (l.id === id ? inquiry : l)));
    } catch (error) {
      console.error('Could not update inquiry:', error);
      setActionError(error instanceof Error ? error.message : 'Could not update inquiry status.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.orderStatus === statusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-300 flex flex-col h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar - Green */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center font-bold text-white shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight font-serif-heading">
                Arsh Agro Industry • Admin Control Center
              </h3>
              <p className="text-[11px] text-emerald-300">
                Mill Operations • Orders • WhatsApp Dispatch • Razorpay Transactions • Wholesale
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllAdminData}
              disabled={isLoading}
              className="p-2 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-900 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Administrator Status */}
        <div className="bg-emerald-900/10 border-b border-emerald-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-bold text-emerald-950">Active Administrator:</span>
            <span className="text-emerald-800 font-semibold">{user?.name} ({user?.email})</span>
            <span className="bg-emerald-200/90 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-md">
              VERIFIED ADMIN
            </span>
          </div>
          <div className="text-[11px] text-emerald-800 font-medium hidden sm:block">
            Full Mill Operations & Catalog Management Enabled
          </div>
        </div>

        {/* Tab Navbar (Responsive scrollable) */}
        <div className="flex border-b border-stone-200 bg-stone-50 overflow-x-auto text-xs font-bold text-stone-600 px-4">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'stats' ? 'border-emerald-700 text-emerald-950 bg-white' : 'border-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard & Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'orders' ? 'border-emerald-700 text-emerald-950 bg-white' : 'border-transparent'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders Management ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'inventory' ? 'border-emerald-700 text-emerald-950 bg-white' : 'border-transparent'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Products & Stock ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'leads' ? 'border-emerald-700 text-emerald-950 bg-white' : 'border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>B2B Wholesale Inquiries ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'settings' ? 'border-emerald-700 text-emerald-950 bg-white' : 'border-transparent'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Gateway & Mill Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('website')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'website' ? 'border-emerald-700 text-emerald-950 bg-white' : 'border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Website Content</span>
          </button>
        </div>

        {/* Tab View Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-emerald-50/20">
          {(dataError || actionError) && (
            <div role="alert" className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {dataError || actionError}
            </div>
          )}
          {isLoading && <p className="mb-4 text-sm text-stone-600">Loading store data…</p>}
          
          {/* TAB 1: Dashboard Stats */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-xs font-bold text-stone-500 uppercase">Total Sales Revenue</span>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                    Razorpay & Prepaid Completed
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-xs font-bold text-stone-500 uppercase">Total Orders</span>
                  <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                    {stats.totalOrders}
                  </p>
                  <span className="text-[10px] text-stone-500 font-semibold mt-1 block">
                    {stats.pendingOrders} pending shipment
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-xs font-bold text-stone-500 uppercase">Active Customers</span>
                  <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                    {stats.totalCustomers}
                  </p>
                  <span className="text-[10px] text-stone-500 font-semibold mt-1 block">
                    Registered users in database
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-xs font-bold text-stone-500 uppercase">Wholesale B2B Leads</span>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1">
                    {stats.inquiriesCount}
                  </p>
                  <span className="text-[10px] text-stone-500 font-semibold mt-1 block">
                    Direct bulk distributor queries
                  </span>
                </div>
              </div>

              {/* Quick Status Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200">
                <h4 className="text-sm font-bold text-stone-900 mb-4 font-serif-heading">
                  Recent Orders & Fulfillment Pipeline
                </h4>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900">{ord.id}</span>
                          <span className="text-stone-400">•</span>
                          <span className="font-bold text-stone-700">{ord.customerName}</span>
                          <span className="text-[10px] text-stone-400">({ord.customerPhone})</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {ord.items.map((i) => `${i.name} (${i.size}) x${i.quantity}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.paymentMethod}: {ord.paymentStatus}
                        </span>
                        <span className="font-black text-emerald-950 text-sm">
                          ₹{ord.totalAmount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Orders Management */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-500">Filter Status:</span>
                  {['all', 'placed', 'processing', 'shipped', 'delivered'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                        statusFilter === st ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <span className="text-stone-400">{filteredOrders.length} orders found</span>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 text-xs shadow-xs">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-stone-100 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-stone-900">{order.id}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.orderStatus === 'processing' ? 'bg-amber-100 text-amber-800' :
                            'bg-stone-100 text-stone-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Placed on: {new Date(order.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-emerald-950">₹{order.totalAmount}</span>
                        <p className="text-[10px] text-stone-500">
                          Mode: <strong className="uppercase">{order.paymentMethod}</strong> ({order.paymentStatus})
                        </p>
                      </div>
                    </div>

                    {/* Customer & Shipping info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 text-stone-700">
                      <div>
                        <p className="font-bold text-stone-900">Customer Details:</p>
                        <p>{order.customerName}</p>
                        <p>{order.customerEmail} • {order.customerPhone}</p>
                        {order.razorpayPaymentId && (
                          <p className="text-[11px] text-stone-400 font-mono mt-1">
                            Razorpay ID: {order.razorpayPaymentId}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-stone-900">Shipping Address:</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 mb-3 space-y-1">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex justify-between items-center text-stone-700">
                          <span>{it.name} ({it.size}) x {it.quantity}</span>
                          <span className="font-bold">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-[11px]">
                      <p className="font-bold text-blue-950">
                        Delhivery: {order.shippingStatus || 'Not booked'}
                        {order.trackingNumber ? ` · AWB ${order.trackingNumber}` : ''}
                      </p>
                      {order.shippingError && <p className="mt-1 text-red-700">{order.shippingError}</p>}
                      {order.shippingStatus === 'review_required' && (
                        <p className="mt-1 text-amber-800">Check the Delhivery dashboard before retrying to avoid duplicate bookings.</p>
                      )}
                    </div>

                    {/* Action & Status Update row */}
                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-600">Update Status:</span>
                        {['processing', 'shipped', 'delivered'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateOrderStatus(order.id, st)}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 font-bold rounded-lg text-[10px] uppercase transition-colors"
                          >
                            Mark {st}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {order.shippingStatus !== 'booked' && order.shippingStatus !== 'booking' &&
                          order.shippingStatus !== 'review_required' && (
                            <button
                              onClick={() => void handleRetryDelhivery(order.id)}
                              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-bold"
                            >
                              Book with Delhivery
                            </button>
                          )}
                        {/* WhatsApp Customer Update Button */}
                        <a
                          href={getWhatsAppCustomerLink(order)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Confirmation</span>
                        </a>

                        {order.trackingNumber ? (
                          <span className="font-mono text-[11px] text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            AWB: {order.trackingNumber}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              const tracking = prompt('Enter Courier Tracking Number (e.g. DEL99281928):');
                              if (tracking) {
                                handleUpdateOrderStatus(order.id, 'shipped');
                              }
                            }}
                            className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold"
                          >
                            + Add Tracking ID
                          </button>
                        )}

                        <button
                          onClick={() => window.print()}
                          className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                          title="Print GST Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Inventory Management */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-stone-900">Product Lineup & Stock</h4>
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      category: 'yellow-mustard',
                      price: 299,
                      mrp: 395,
                      size: '1 Litre',
                      stockCount: 100,
                      description: '100% Pure Cold-Pressed Mustard Oil from Siwan Bihar.'
                    });
                    setShowProductForm(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Product Form Modal */}
              {showProductForm && editingProduct && (
                <form onSubmit={handleSaveProduct} className="bg-white p-5 rounded-3xl border border-emerald-300 shadow-lg space-y-4 text-xs">
                  <h5 className="text-sm font-bold text-stone-900">
                    {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Product Title</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Category</label>
                      <select
                        value={editingProduct.category || 'yellow-mustard'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5"
                      >
                        <option value="yellow-mustard">Peeli Sarso (Yellow Mustard)</option>
                        <option value="kachi-ghani">Black Kachi Ghani</option>
                        <option value="mustard-cake">Mustard Cake (Khali)</option>
                        <option value="combo-packs">Combos & 10L Boxes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.price || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">MRP (₹)</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.mrp || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Pack Size Label (e.g. 1 Litre, 5L Can)</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.size || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Packed shipping weight (grams)</label>
                      <input
                        type="number"
                        min="1"
                        value={editingProduct.shippingWeightGrams || ''}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          shippingWeightGrams: Number(e.target.value) || 0,
                        })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Stock Count</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.stockCount || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <ImageUploadField
                        value={editingProduct.image || ''}
                        folder="products"
                        onChange={(image) => setEditingProduct((current) => current ? { ...current, image } : current)}
                        onUploadingChange={(delta) => setIsProductImageUploading((current) => delta > 0 ? true : false)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      disabled={isSaving || isProductImageUploading}
                      className="px-4 py-2 text-stone-600 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || isProductImageUploading}
                      className="px-6 py-2 bg-emerald-700 text-white rounded-xl font-bold disabled:opacity-60"
                    >
                      {isProductImageUploading ? 'Uploading image…' : isSaving ? 'Saving…' : 'Save Product'}
                    </button>
                  </div>
                </form>
              )}

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4 font-bold text-stone-700">Product</th>
                      <th className="py-3 px-3 font-bold text-stone-700">Size</th>
                      <th className="py-3 px-3 font-bold text-stone-700">Price</th>
                      <th className="py-3 px-3 font-bold text-stone-700">MRP</th>
                      <th className="py-3 px-3 font-bold text-stone-700">Stock</th>
                      <th className="py-3 px-4 font-bold text-stone-700 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-emerald-50/20">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-stone-100 shrink-0" />
                          <div>
                            <span className="font-bold text-stone-900 block">{p.name}</span>
                            <span className="text-[10px] text-stone-400 capitalize">{p.category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-stone-700">{p.size}</td>
                        <td className="py-3 px-3 font-black text-emerald-950">₹{p.price}</td>
                        <td className="py-3 px-3 text-stone-400 line-through">₹{p.mrp}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            p.stockCount < 50 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.stockCount} units
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setShowProductForm(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-emerald-700 rounded-lg hover:bg-stone-100"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: B2B Wholesale Leads */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-stone-900">Distributor & Dealership Inquiries</h4>
              <div className="space-y-3">
                {leads.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-xs">No wholesale inquiries yet.</div>
                ) : (
                  leads.map((l) => (
                    <div key={l.id} className="bg-white p-5 rounded-2xl border border-stone-200 text-xs shadow-xs">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-stone-100 gap-2">
                        <div>
                          <span className="text-sm font-bold text-stone-900">{l.name}</span>
                          {l.businessName && (
                            <span className="text-stone-500 ml-2 font-medium">({l.businessName})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            l.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                            l.status === 'closed' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 text-stone-700">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <a href={`tel:${l.phone}`} className="hover:underline font-bold">{l.phone}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <a 
                            href={`https://wa.me/${(l.phone || '').replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(l.name)},%20regarding%20your%20wholesale%20mustard%20oil%20inquiry%20from%20Arsh%20Agro%20Industry.`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="hover:underline text-emerald-700 font-bold"
                          >
                            Chat on WhatsApp
                          </a>
                        </div>
                        <div>
                          <span>Quantity: <strong className="text-stone-900">{l.quantityNeeded}</strong></span>
                        </div>
                      </div>

                      {l.message && (
                        <p className="p-3 bg-stone-50 rounded-xl text-stone-600 border border-stone-200/60 mb-3">
                          "{l.message}"
                        </p>
                      )}

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-stone-400 text-[10px]">Location: {l.city}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLeadStatus(l.id, 'contacted')}
                            className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg font-bold text-[10px]"
                          >
                            Mark Contacted
                          </button>
                          <button
                            onClick={() => handleLeadStatus(l.id, 'closed')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-bold text-[10px]"
                          >
                            Mark Deal Closed
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Settings */}
          {activeTab === 'settings' && settings && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 max-w-xl mx-auto space-y-4 text-xs">
              <h4 className="text-base font-bold text-stone-900 font-serif-heading">Store Configuration</h4>

              <div>
                <label className="block font-semibold mb-1">Free Delivery Threshold (₹)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Mill Physical Address</label>
                <input
                  type="text"
                  value={settings.millAddress}
                  onChange={(e) => setSettings({ ...settings, millAddress: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5"
                />
              </div>

              <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                <label className="flex items-center gap-2 font-semibold text-blue-950">
                  <input
                    type="checkbox"
                    checked={settings.delhiveryEnabled || false}
                    onChange={(e) => setSettings({ ...settings, delhiveryEnabled: e.target.checked })}
                  />
                  Automatically book eligible orders with Delhivery
                </label>
                <label className="block font-semibold text-blue-950">Delhivery registered pickup location name</label>
                <input
                  type="text"
                  value={settings.delhiveryPickupLocationName || ''}
                  onChange={(e) => setSettings({ ...settings, delhiveryPickupLocationName: e.target.value })}
                  className="w-full bg-white border border-blue-200 rounded-xl p-2.5"
                  placeholder="Use the exact pickup location name from Delhivery"
                />
                <p className="text-[11px] text-blue-900">
                  Bookings require a Delhivery API token and packed weight on every product. Configure the token in Firebase Secrets, not here.
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setActionError('');
                  setIsSaving(true);
                  try {
                    await saveStoreSettings(settings);
                    alert('Settings saved successfully!');
                  } catch (error) {
                    console.error('Could not save settings:', error);
                    setActionError(error instanceof Error ? error.message : 'Could not save settings.');
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all shadow-md"
              >
                Save Settings
              </button>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-stone-900">Website page builder</h4>
                <p className="mt-1 text-sm text-stone-600">Edit section content, add custom sections, hide or reorder sections, and publish changes to the storefront.</p>
              </div>
              <WebsiteContentEditor />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
