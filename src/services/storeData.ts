import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { AdminStats, Order, Product, StoreSettings, WholesaleInquiry } from '../types';

const settingsDocumentId = 'store';

export const defaultStoreSettings: StoreSettings = {
  freeShippingThreshold: 499,
  standardShippingFee: 60,
  millAddress: 'Arsh Agro Industry, Hathaura, Siwan, Bihar - 841237',
  contactPhone: '+91 84474 23416',
  salesEmail: 'sales@arshagroindustry.com',
  fssaiLicense: 'FSSAI Lic. No: 10423000001289 (Govt. of India)',
  pgsIndiaCert: 'PGS-India Certified Organic Processor',
  delhiveryEnabled: false,
  delhiveryPickupLocationName: '',
};

const getCollection = async <T extends { id: string }>(name: string): Promise<T[]> => {
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id } as T));
};

export const getProducts = () => getCollection<Product>('products');

export const subscribeToProducts = (
  onProducts: (products: Product[]) => void,
  onError: (error: Error) => void
) =>
  onSnapshot(
    collection(db, 'products'),
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.metadata.fromCache) return;
      onProducts(snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id } as Product)));
    },
    onError
  );

export const submitWholesaleInquiry = async (
  inquiry: Omit<WholesaleInquiry, 'id' | 'status' | 'createdAt'>
) => {
  const createdAt = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'inquiries'), {
    ...inquiry,
    status: 'new',
    createdAt,
  });
  return { ...inquiry, id: docRef.id, status: 'new' as const, createdAt };
};

export const getAdminData = async (): Promise<{
  stats: AdminStats;
  orders: Order[];
  products: Product[];
  inquiries: WholesaleInquiry[];
  settings: StoreSettings;
}> => {
  const [orders, products, inquiries, users, settingsSnapshot] = await Promise.all([
    getCollection<Order>('orders'),
    getProducts(),
    getCollection<WholesaleInquiry>('inquiries'),
    getCollection<{ id: string }>('users'),
    getDoc(doc(db, 'settings', settingsDocumentId)),
  ]);
  const settings = settingsSnapshot.exists()
    ? { ...defaultStoreSettings, ...settingsSnapshot.data() } as StoreSettings
    : defaultStoreSettings;
  const stats: AdminStats = {
    totalRevenue: orders.reduce(
      (total, order) => total + (order.paymentStatus === 'paid' ? order.totalAmount : 0),
      0
    ),
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => ['placed', 'processing'].includes(order.orderStatus)).length,
    totalCustomers: users.length,
    lowStockCount: products.filter((product) => product.stockCount < 50).length,
    inquiriesCount: inquiries.length,
  };
  return { stats, orders, products, inquiries, settings };
};

export const updateOrder = async (
  orderId: string,
  changes: Pick<Order, 'orderStatus'> & Partial<Pick<Order, 'trackingNumber' | 'courierName'>>
) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, changes);
  const snapshot = await getDoc(orderRef);
  return { ...snapshot.data(), id: snapshot.id } as Order;
};

export const saveProduct = async (product: Partial<Product>): Promise<Product> => {
  const { id, ...fields } = product;
  if (id) {
    const updatedProduct = {
      ...product,
      id,
      ...(fields.stockCount !== undefined ? { inStock: fields.stockCount > 0 } : {}),
    } as Product;
    await updateDoc(doc(db, 'products', id), {
      ...fields,
      ...(fields.stockCount !== undefined ? { inStock: updatedProduct.inStock } : {}),
    });
    return updatedProduct;
  }
  const productRef = doc(collection(db, 'products'));
  const newProduct = { ...fields, inStock: (fields.stockCount ?? 0) > 0 } as Omit<Product, 'id'>;
  await setDoc(productRef, newProduct);
  return { ...newProduct, id: productRef.id };
};

export const deleteProduct = (productId: string) =>
  deleteDoc(doc(db, 'products', productId));

export const updateInquiry = async (
  inquiryId: string,
  status: WholesaleInquiry['status']
) => {
  const inquiryRef = doc(db, 'inquiries', inquiryId);
  await updateDoc(inquiryRef, { status });
  const snapshot = await getDoc(inquiryRef);
  return { ...snapshot.data(), id: snapshot.id } as WholesaleInquiry;
};

export const saveStoreSettings = async (settings: StoreSettings) => {
  await setDoc(doc(db, 'settings', settingsDocumentId), settings, { merge: true });
};
