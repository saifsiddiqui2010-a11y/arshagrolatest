import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  QuerySnapshot,
  DocumentData,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Customer,
  DashboardData,
  InquiryStatus,
  Order,
  OrderStatus,
  Product,
  StoreSettings,
  WholesaleInquiry,
} from './types';

const ADMIN_EMAILS = new Set([
  'saif.siddiqui2010@gmail.com',
  'admin@arshagroindustry.com',
  'arshagroindustry@gmail.com',
]);

export const defaultSettings: StoreSettings = {
  freeShippingThreshold: 499,
  standardShippingFee: 60,
  millAddress: '',
  contactPhone: '+91 84474 23416',
  salesEmail: 'sales@arshagroindustry.com',
  fssaiLicense: '',
  pgsIndiaCert: '',
  delhiveryEnabled: false,
  delhiveryPickupLocationName: '',
};

function docsAs<T>(snapshot: QuerySnapshot<DocumentData>): T[] {
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as T);
}

export async function loadDashboardData(): Promise<DashboardData> {
  const [ordersSnapshot, productsSnapshot, customersSnapshot, inquiriesSnapshot, settingsSnapshot] =
    await Promise.all([
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'inquiries')),
      getDoc(doc(db, 'settings', 'store')),
    ]);

  const orders = docsAs<Order>(ordersSnapshot).sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  );
  const products = docsAs<Product>(productsSnapshot).sort((a, b) => a.name.localeCompare(b.name));
  const customers = docsAs<Customer>(customersSnapshot)
    .filter((customer) => !customer.email || !ADMIN_EMAILS.has(customer.email.toLowerCase()))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const inquiries = docsAs<WholesaleInquiry>(inquiriesSnapshot).sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  );
  const savedSettings = settingsSnapshot.data() || {};
  const settings: StoreSettings = {
    freeShippingThreshold: typeof savedSettings.freeShippingThreshold === 'number'
      ? savedSettings.freeShippingThreshold
      : defaultSettings.freeShippingThreshold,
    standardShippingFee: typeof savedSettings.standardShippingFee === 'number'
      ? savedSettings.standardShippingFee
      : defaultSettings.standardShippingFee,
    millAddress: typeof savedSettings.millAddress === 'string' ? savedSettings.millAddress : defaultSettings.millAddress,
    contactPhone: typeof savedSettings.contactPhone === 'string' ? savedSettings.contactPhone : defaultSettings.contactPhone,
    salesEmail: typeof savedSettings.salesEmail === 'string' ? savedSettings.salesEmail : defaultSettings.salesEmail,
    fssaiLicense: typeof savedSettings.fssaiLicense === 'string' ? savedSettings.fssaiLicense : defaultSettings.fssaiLicense,
    pgsIndiaCert: typeof savedSettings.pgsIndiaCert === 'string' ? savedSettings.pgsIndiaCert : defaultSettings.pgsIndiaCert,
  };

  return {
    orders,
    products,
    customers,
    inquiries,
    settings,
    stats: {
      totalRevenue: orders
        .filter((order) => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0),
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => ['placed', 'processing'].includes(order.orderStatus)).length,
      totalCustomers: customers.length,
      lowStockCount: products.filter((product) => (Number(product.stockCount) || 0) < 50).length,
      inquiriesCount: inquiries.filter((inquiry) => inquiry.status === 'new').length,
    },
  };
}

export async function saveOrderStatus(
  orderId: string,
  orderStatus: OrderStatus,
  courierName: string,
  trackingNumber: string
) {
  await updateDoc(doc(db, 'orders', orderId), {
    orderStatus,
    courierName,
    trackingNumber,
  });
}

export async function saveProduct(product: Omit<Product, 'id'>, id?: string) {
  if (id) {
    await updateDoc(doc(db, 'products', id), product);
    return id;
  }
  const reference = await addDoc(collection(db, 'products'), product);
  return reference.id;
}

export async function removeProduct(id: string) {
  await deleteDoc(doc(db, 'products', id));
}

export async function saveInquiryStatus(id: string, status: InquiryStatus) {
  await updateDoc(doc(db, 'inquiries', id), { status });
}

export async function saveStoreSettings(settings: StoreSettings) {
  await setDoc(doc(db, 'settings', 'store'), settings, { merge: true });
}
