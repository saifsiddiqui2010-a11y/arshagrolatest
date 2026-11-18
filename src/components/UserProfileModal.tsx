import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, Address } from '../types';
import { 
  X, 
  User, 
  MapPin, 
  Package, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Truck,
  ShieldCheck,
  Save,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder?: (orderId: string, phone: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, onTrackOrder }) => {
  const { user, updateProfile, addAddress, deleteAddress, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');

  // Profile edit state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Address add state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: 'Bihar',
    pincode: '',
    landmark: ''
  });

  // Orders state
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user && activeTab === 'orders') {
      loadOrders();
    }
  }, [isOpen, user, activeTab]);

  const loadOrders = async () => {
    if (!user) return;
    setIsLoadingOrders(true);
    try {
      const res = await api.getOrders(user.id);
      if (res.success) {
        setUserOrders(res.orders);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const success = await updateProfile(name, phone);
    setIsUpdatingProfile(false);
    if (success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.phone || !newAddr.street || !newAddr.city || !newAddr.pincode) return;
    await addAddress(newAddr);
    setShowAddAddress(false);
    setNewAddr({
      fullName: user.name,
      phone: user.phone || '',
      street: '',
      city: '',
      state: 'Bihar',
      pincode: '',
      landmark: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Green */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500"
            />
            <div>
              <h3 className="text-lg font-bold font-serif-heading">{user.name}</h3>
              <p className="text-xs text-emerald-300">{user.email} • {user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-bold text-stone-600">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'profile' ? 'border-emerald-700 text-emerald-950 bg-white' : 'border-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'addresses' ? 'border-emerald-700 text-emerald-950 bg-white' : 'border-transparent'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Saved Addresses ({user.addresses?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'orders' ? 'border-emerald-700 text-emerald-950 bg-white' : 'border-transparent'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>My Orders</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* 1. Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md mx-auto">
              <div className="border-b border-stone-100 pb-3">
                <h4 className="text-sm font-bold text-stone-900">Personal Information</h4>
                <p className="text-xs text-stone-500">Manage your contact details used for shipping updates.</p>
              </div>

              {profileSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">Email is locked to your account credentials.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Delivery Addresses</h4>
                  <p className="text-xs text-stone-500">Addresses saved for quick 1-click checkout.</p>
                </div>
                {!showAddAddress && (
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-950 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {showAddAddress && (
                <form onSubmit={handleSaveAddress} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                  <h5 className="text-xs font-bold text-emerald-950">New Shipping Destination</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Mobile Phone</label>
                      <input
                        type="tel"
                        required
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-medium mb-1">Street Address / House</label>
                      <input
                        type="text"
                        required
                        value={newAddr.street}
                        onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">City / District</label>
                      <input
                        type="text"
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">PIN Code</label>
                      <input
                        type="text"
                        required
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(!user.addresses || user.addresses.length === 0) && !showAddAddress && (
                  <div className="sm:col-span-2 text-center py-8 text-stone-400 text-xs">
                    No addresses saved yet. Click "Add New" to save your shipping location.
                  </div>
                )}
                {user.addresses?.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-stone-900">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-stone-600">{addr.street}</p>
                      <p className="text-stone-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-stone-500 mt-1">Phone: {addr.phone}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-200 flex justify-end">
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-stone-900">Order History</h4>
                <button
                  onClick={loadOrders}
                  className="text-xs text-amber-700 hover:underline font-semibold"
                >
                  Refresh
                </button>
              </div>

              {isLoadingOrders ? (
                <div className="text-center py-10 text-xs text-stone-400">Loading your orders...</div>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  <Package className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((o) => (
                    <div key={o.id} className="border border-stone-200 rounded-2xl p-4 bg-stone-50 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
                        <div>
                          <span className="font-extrabold text-stone-900 block">{o.id}</span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                            o.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            o.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-900'
                          }`}>
                            Status: {o.orderStatus}
                          </span>

                          <span className="font-black text-stone-900 text-sm">
                            ₹{o.totalAmount}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="py-2.5 space-y-1.5">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-stone-700">
                            <span>{it.name} ({it.size}) x {it.quantity}</span>
                            <span className="font-semibold">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                        <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                          <Truck className="w-3.5 h-3.5" /> AWB: {o.trackingNumber || 'Processing'}
                        </span>
                        <div className="flex items-center gap-2">
                          {onTrackOrder && (
                            <button
                              onClick={() => {
                                onClose();
                                onTrackOrder(o.id, o.customerPhone);
                              }}
                              className="text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                            >
                              Track Shipment
                            </button>
                          )}
                          <button
                            onClick={() => window.print()}
                            className="text-stone-700 hover:text-amber-800 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="text-xs font-bold text-red-600 hover:text-red-700"
          >
            Sign Out
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
