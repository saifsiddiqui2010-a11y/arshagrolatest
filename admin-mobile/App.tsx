import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { arrayUnion, doc, setDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { auth, db } from './src/firebase';
import {
  loadDashboardData,
  removeProduct,
  saveInquiryStatus,
  saveOrderStatus,
  saveProduct,
  saveStoreSettings,
} from './src/adminData';
import {
  DashboardData,
  InquiryStatus,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
} from './src/types';

WebBrowser.maybeCompleteAuthSession();

type AdminTab = 'dashboard' | 'orders' | 'products' | 'customers' | 'wholesale' | 'settings';

const ADMIN_EMAILS = new Set([
  'saif.siddiqui2010@gmail.com',
  'admin@arshagroindustry.com',
  'arshagroindustry@gmail.com',
]);
const TABS: { id: AdminTab; label: string }[] = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'customers', label: 'Customers' },
  { id: 'wholesale', label: 'Wholesale' },
  { id: 'settings', label: 'Settings' },
];
const PRODUCT_CATEGORIES: ProductCategory[] = [
  'yellow-mustard',
  'kachi-ghani',
  'mustard-cake',
  'combo-packs',
];

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  category: 'yellow-mustard',
  price: 0,
  mrp: 0,
  size: '',
  image: '',
  description: '',
  inStock: true,
  stockCount: 0,
  featured: false,
  rating: 5,
  reviewCount: 0,
};

function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && ADMIN_EMAILS.has(email.toLowerCase()));
}

function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function formatCurrency(value: number) {
  return `₹${(Number(value) || 0).toLocaleString('en-IN')}`;
}

function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  secondary = false,
  destructive = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        secondary && styles.secondaryButton,
        destructive && styles.destructiveButton,
        disabled && styles.disabledButton,
      ]}
    >
      <Text style={[styles.actionButtonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

function App() {
  const extra = Constants.expoConfig?.extra || {};
  const googleAndroidClientId = extra.googleAndroidClientId as string | undefined;
  const googleIosClientId = extra.googleIosClientId as string | undefined;
  const googleWebClientId = extra.googleWebClientId as string | undefined;
  const hasPlatformClientId = Platform.OS === 'ios'
    ? Boolean(googleIosClientId)
    : Boolean(googleAndroidClientId);
  const [googleRequest, googleResponse, promptGoogleSignIn] = Google.useAuthRequest({
    androidClientId: googleAndroidClientId || undefined,
    iosClientId: googleIosClientId || undefined,
    webClientId: googleWebClientId || undefined,
    scopes: ['openid', 'profile', 'email'],
  });

  const [authReady, setAuthReady] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>();
  const [productDraft, setProductDraft] = useState<Omit<Product, 'id'>>(EMPTY_PRODUCT);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [orderStatusDraft, setOrderStatusDraft] = useState<OrderStatus>('placed');
  const [courierDraft, setCourierDraft] = useState('');
  const [trackingDraft, setTrackingDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setAuthReady(true);
      if (!firebaseUser) {
        setAdminEmail(null);
        setData(null);
        return;
      }

      if (!isAdminEmail(firebaseUser.email)) {
        setAuthError('This Google account is not authorized to manage the store.');
        setAdminEmail(null);
        void signOut(auth);
        return;
      }

      setAuthError('');
      setAdminEmail(firebaseUser.email);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!adminEmail || !auth.currentUser) return;
    let active = true;
    const registerForOrderAlerts = async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Order alerts',
            importance: Notifications.AndroidImportance.MAX,
          });
        }

        const permission = await Notifications.getPermissionsAsync();
        const granted = permission.granted
          ? permission
          : await Notifications.requestPermissionsAsync();
        if (!granted.granted) {
          Alert.alert('Notifications disabled', 'Enable notifications in device settings to receive new-order alerts.');
          return;
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        if (!projectId) {
          Alert.alert('Push setup incomplete', 'The admin app needs its EAS project ID before it can register for order alerts.');
          return;
        }

        const token = await Notifications.getExpoPushTokenAsync({ projectId });
        const uid = auth.currentUser?.uid;
        if (!uid || !active) return;
        await setDoc(doc(db, 'admin_devices', uid), {
          expoPushTokens: arrayUnion(token.data),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (error) {
        Alert.alert('Could not enable order alerts', messageFromError(error));
      }
    };

    void registerForOrderAlerts();
    const received = Notifications.addNotificationReceivedListener((notification) => {
      Alert.alert(
        notification.request.content.title || 'Arsh Agro alert',
        notification.request.content.body || 'A new notification arrived.'
      );
    });
    const response = Notifications.addNotificationResponseReceivedListener((notificationResponse) => {
      if (notificationResponse.notification.request.content.data?.screen === 'orders') {
        setActiveTab('orders');
      }
    });

    return () => {
      active = false;
      received.remove();
      response.remove();
    };
  }, [adminEmail]);

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const idToken = googleResponse.params.id_token;
    if (!idToken) {
      setAuthError('Google did not return an ID token. Check the native OAuth client setup.');
      return;
    }

    signInWithCredential(auth, GoogleAuthProvider.credential(idToken))
      .catch((error: unknown) => setAuthError(messageFromError(error)));
  }, [googleResponse]);

  const refresh = useCallback(async () => {
    if (!adminEmail) return;
    setIsLoading(true);
    setPageError('');
    try {
      setData(await loadDashboardData());
    } catch (error) {
      setPageError(`Could not load live Firebase data: ${messageFromError(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [adminEmail]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = async (action: () => Promise<void>, successMessage?: string) => {
    setSaving(true);
    try {
      await action();
      await refresh();
      if (successMessage) Alert.alert('Saved', successMessage);
    } catch (error) {
      Alert.alert('Unable to save', messageFromError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleEmailSignIn = async () => {
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      setAuthError(messageFromError(error));
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setActiveTab('dashboard');
  };

  const beginNewProduct = () => {
    setEditingProductId(undefined);
    setProductDraft(EMPTY_PRODUCT);
    setProductModalOpen(true);
  };

  const beginEditProduct = (product: Product) => {
    const { id, ...draft } = product;
    setEditingProductId(id);
    setProductDraft({ ...EMPTY_PRODUCT, ...draft });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productDraft.name.trim() || !productDraft.size.trim() || productDraft.price <= 0) {
      Alert.alert('Check product details', 'Name, size, and a price greater than zero are required.');
      return;
    }

    setSaving(true);
    try {
      await saveProduct(
        { ...productDraft, name: productDraft.name.trim(), inStock: productDraft.stockCount > 0 },
        editingProductId
      );
      setProductModalOpen(false);
      await refresh();
    } catch (error) {
      Alert.alert('Unable to save product', messageFromError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert('Delete product?', `Remove "${product.name}" from the catalog?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void runAction(() => removeProduct(product.id)),
      },
    ]);
  };

  const openOrderEditor = (order: Order) => {
    setOrderToEdit(order);
    setOrderStatusDraft(order.orderStatus);
    setCourierDraft(order.courierName || '');
    setTrackingDraft(order.trackingNumber || '');
  };

  const handleSaveOrder = async () => {
    if (!orderToEdit) return;
    await runAction(async () => {
      await saveOrderStatus(orderToEdit.id, orderStatusDraft, courierDraft.trim(), trackingDraft.trim());
      setOrderToEdit(null);
    });
  };

  const renderContent = () => {
    if (!data) return null;

    if (activeTab === 'dashboard') {
      const cards = [
        ['Revenue collected', formatCurrency(data.stats.totalRevenue)],
        ['Orders', String(data.stats.totalOrders)],
        ['Needs attention', String(data.stats.pendingOrders)],
        ['Customers', String(data.stats.totalCustomers)],
        ['Low stock items', String(data.stats.lowStockCount)],
        ['New wholesale leads', String(data.stats.inquiriesCount)],
      ];
      return (
        <View>
          <Text style={styles.sectionTitle}>Store overview</Text>
          <Text style={styles.sectionSubtitle}>Live totals from the configured Firebase database.</Text>
          <View style={styles.metricsGrid}>
            {cards.map(([label, value]) => (
              <View key={label} style={styles.metricCard}>
                <Text style={styles.metricValue}>{value}</Text>
                <Text style={styles.metricLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Latest orders</Text>
          {data.orders.slice(0, 5).map((order) => (
            <OrderCard key={order.id} order={order} onEdit={() => openOrderEditor(order)} />
          ))}
          {data.orders.length === 0 && <EmptyState text="No orders are present in Firestore yet." />}
        </View>
      );
    }

    if (activeTab === 'orders') {
      return (
        <View>
          <Text style={styles.sectionTitle}>Orders</Text>
          <Text style={styles.sectionSubtitle}>{data.orders.length} orders in Firestore</Text>
          {data.orders.map((order) => (
            <OrderCard key={order.id} order={order} onEdit={() => openOrderEditor(order)} />
          ))}
          {data.orders.length === 0 && <EmptyState text="No orders are present in Firestore yet." />}
        </View>
      );
    }

    if (activeTab === 'products') {
      return (
        <View>
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text style={styles.sectionTitle}>Products & stock</Text>
              <Text style={styles.sectionSubtitle}>{data.products.length} products</Text>
            </View>
            <ActionButton label="+ Add product" onPress={beginNewProduct} />
          </View>
          {data.products.map((product) => (
            <View key={product.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{product.name}</Text>
                  <Text style={styles.mutedText}>{product.size} · {product.category}</Text>
                  <Text style={styles.cardMeta}>
                    {formatCurrency(product.price)} · Stock: {product.stockCount ?? 0}
                  </Text>
                </View>
                <View style={styles.inlineActions}>
                  <ActionButton label="Edit" secondary onPress={() => beginEditProduct(product)} />
                  <ActionButton label="Delete" destructive onPress={() => handleDeleteProduct(product)} />
                </View>
              </View>
            </View>
          ))}
          {data.products.length === 0 && <EmptyState text="No products are present in Firestore yet." />}
        </View>
      );
    }

    if (activeTab === 'customers') {
      return (
        <View>
          <Text style={styles.sectionTitle}>Customers</Text>
          <Text style={styles.sectionSubtitle}>{data.customers.length} customer profiles</Text>
          {data.customers.map((customer) => (
            <View key={customer.id} style={styles.card}>
              <Text style={styles.cardTitle}>{customer.name || 'Customer'}</Text>
              <Text style={styles.cardMeta}>{customer.email || 'No email'}</Text>
              <Text style={styles.mutedText}>{customer.phone || 'No phone number'}</Text>
            </View>
          ))}
          {data.customers.length === 0 && <EmptyState text="No customer profiles are present in Firestore yet." />}
        </View>
      );
    }

    if (activeTab === 'wholesale') {
      return (
        <View>
          <Text style={styles.sectionTitle}>Wholesale inquiries</Text>
          <Text style={styles.sectionSubtitle}>{data.inquiries.length} inquiries</Text>
          {data.inquiries.map((inquiry) => (
            <View key={inquiry.id} style={styles.card}>
              <Text style={styles.cardTitle}>{inquiry.businessName || inquiry.name}</Text>
              <Text style={styles.cardMeta}>{inquiry.name} · {inquiry.phone}</Text>
              <Text style={styles.mutedText}>{inquiry.city || 'Location not provided'} · {inquiry.status}</Text>
              {inquiry.message ? <Text style={styles.bodyText}>{inquiry.message}</Text> : null}
              <View style={styles.inlineActions}>
                {(['new', 'contacted', 'closed'] as InquiryStatus[]).map((status) => (
                  <ActionButton
                    key={status}
                    label={status}
                    secondary={inquiry.status !== status}
                    disabled={saving || inquiry.status === status}
                    onPress={() => void runAction(() => saveInquiryStatus(inquiry.id, status))}
                  />
                ))}
              </View>
            </View>
          ))}
          {data.inquiries.length === 0 && <EmptyState text="No wholesale inquiries are present in Firestore yet." />}
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Store settings</Text>
        <Text style={styles.sectionSubtitle}>These settings are stored in the Firestore settings/store document.</Text>
        <TextField
          label="Free shipping threshold (₹)"
          value={String(data.settings.freeShippingThreshold)}
          keyboardType="numeric"
          onChangeText={(value) => setData({ ...data, settings: { ...data.settings, freeShippingThreshold: Number(value) || 0 } })}
        />
        <TextField
          label="Standard shipping fee (₹)"
          value={String(data.settings.standardShippingFee)}
          keyboardType="numeric"
          onChangeText={(value) => setData({ ...data, settings: { ...data.settings, standardShippingFee: Number(value) || 0 } })}
        />
        <TextField
          label="Mill address"
          value={data.settings.millAddress}
          onChangeText={(value) => setData({ ...data, settings: { ...data.settings, millAddress: value } })}
        />
        <TextField
          label="Contact phone"
          value={data.settings.contactPhone}
          keyboardType="phone-pad"
          onChangeText={(value) => setData({ ...data, settings: { ...data.settings, contactPhone: value } })}
        />
        <TextField
          label="Sales email"
          value={data.settings.salesEmail}
          keyboardType="email-address"
          onChangeText={(value) => setData({ ...data, settings: { ...data.settings, salesEmail: value } })}
        />
        <TextField
          label="FSSAI license"
          value={data.settings.fssaiLicense}
          onChangeText={(value) => setData({ ...data, settings: { ...data.settings, fssaiLicense: value } })}
        />
        <TextField
          label="PGS-India certificate"
          value={data.settings.pgsIndiaCert}
          onChangeText={(value) => setData({ ...data, settings: { ...data.settings, pgsIndiaCert: value } })}
        />
        <ActionButton
          label={saving ? 'Saving…' : 'Save settings'}
          disabled={saving}
          onPress={() => void runAction(() => saveStoreSettings(data.settings), 'Store settings saved.')}
        />
      </View>
    );
  };

  if (!authReady) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text style={styles.mutedText}>Checking administrator access…</Text>
      </SafeAreaView>
    );
  }

  if (!adminEmail) {
    const platformLabel = Platform.OS === 'ios' ? 'iOS' : 'Android';
    return (
      <SafeAreaView style={styles.authScreen}>
        <StatusBar style="light" />
        <View style={styles.authCard}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>A</Text></View>
          <Text style={styles.authTitle}>Arsh Agro Admin</Text>
          <Text style={styles.authSubtitle}>Sign in with an authorized store administrator account.</Text>
          {authError ? <Text accessibilityRole="alert" style={styles.errorText}>{authError}</Text> : null}
          <TextField label="Administrator email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <ActionButton label="Sign in with email" onPress={() => void handleEmailSignIn()} />
          <View style={styles.orDivider}><View style={styles.divider} /><Text style={styles.mutedText}>OR</Text><View style={styles.divider} /></View>
          <ActionButton
            label={`Continue with Google (${platformLabel})`}
            secondary
            disabled={!googleRequest || !hasPlatformClientId}
            onPress={() => void promptGoogleSignIn()}
          />
          {!hasPlatformClientId && (
            <Text style={styles.setupNote}>
              Native Google sign-in needs a {platformLabel} OAuth client ID. Add it to the app environment before building.
            </Text>
          )}
          <Text style={styles.securityNote}>Only the authorized administrator accounts can access store data.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appScreen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={styles.headerEyebrow}>ARSH AGRO INDUSTRY</Text>
          <Text style={styles.headerTitle}>Admin dashboard</Text>
          <Text style={styles.mutedText}>{adminEmail}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" onPress={() => void refresh()} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>↻</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => void handleSignOut()} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {pageError ? <Text accessibilityRole="alert" style={styles.pageError}>{pageError}</Text> : null}
      {isLoading && !data ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.green} /><Text style={styles.mutedText}>Loading dashboard…</Text></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {renderContent()}
        </ScrollView>
      )}

      <Modal visible={productModalOpen} animationType="slide" onRequestClose={() => setProductModalOpen(false)}>
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingProductId ? 'Edit product' : 'Add product'}</Text>
            <Pressable onPress={() => setProductModalOpen(false)}><Text style={styles.cancelText}>Cancel</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <TextField label="Name" value={productDraft.name} onChangeText={(name) => setProductDraft({ ...productDraft, name })} />
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.statusOptions}>
              {PRODUCT_CATEGORIES.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setProductDraft({ ...productDraft, category })}
                  style={[styles.statusOption, productDraft.category === category && styles.selectedStatus]}
                >
                  <Text style={[styles.statusOptionText, productDraft.category === category && styles.selectedStatusText]}>
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.twoColumns}>
              <View style={styles.column}><TextField label="Price (₹)" value={String(productDraft.price || '')} keyboardType="numeric" onChangeText={(value) => setProductDraft({ ...productDraft, price: Number(value) || 0 })} /></View>
              <View style={styles.column}><TextField label="MRP (₹)" value={String(productDraft.mrp || '')} keyboardType="numeric" onChangeText={(value) => setProductDraft({ ...productDraft, mrp: Number(value) || 0 })} /></View>
            </View>
            <View style={styles.twoColumns}>
              <View style={styles.column}><TextField label="Pack size" value={productDraft.size} onChangeText={(size) => setProductDraft({ ...productDraft, size })} /></View>
              <View style={styles.column}><TextField label="Stock count" value={String(productDraft.stockCount || '')} keyboardType="numeric" onChangeText={(value) => setProductDraft({ ...productDraft, stockCount: Number(value) || 0 })} /></View>
            </View>
            <TextField
              label="Packed shipping weight (grams)"
              value={String(productDraft.shippingWeightGrams || '')}
              keyboardType="numeric"
              onChangeText={(value) => setProductDraft({ ...productDraft, shippingWeightGrams: Number(value) || 0 })}
            />
            <TextField label="Image URL" value={productDraft.image} onChangeText={(image) => setProductDraft({ ...productDraft, image })} />
            <TextField label="Description" value={productDraft.description} onChangeText={(description) => setProductDraft({ ...productDraft, description })} multiline />
            <ActionButton label={saving ? 'Saving…' : 'Save product'} disabled={saving} onPress={() => void handleSaveProduct()} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={Boolean(orderToEdit)} animationType="slide" transparent onRequestClose={() => setOrderToEdit(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.orderModal}>
            <Text style={styles.modalTitle}>Update order</Text>
            <Text style={styles.mutedText}>{orderToEdit?.id} · {orderToEdit?.customerName}</Text>
            <Text style={styles.fieldLabel}>Order status</Text>
            <View style={styles.statusOptions}>
              {(['placed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                <Pressable key={status} onPress={() => setOrderStatusDraft(status)} style={[styles.statusOption, orderStatusDraft === status && styles.selectedStatus]}>
                  <Text style={[styles.statusOptionText, orderStatusDraft === status && styles.selectedStatusText]}>{status}</Text>
                </Pressable>
              ))}
            </View>
            <TextField label="Courier" value={courierDraft} onChangeText={setCourierDraft} />
            <TextField label="Tracking number" value={trackingDraft} onChangeText={setTrackingDraft} />
            <View style={styles.modalActions}>
              <ActionButton label="Cancel" secondary onPress={() => setOrderToEdit(null)} />
              <ActionButton label={saving ? 'Saving…' : 'Save update'} disabled={saving} onPress={() => void handleSaveOrder()} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function OrderCard({ order, onEdit }: { order: Order; onEdit: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{order.customerName || 'Customer'}</Text>
          <Text style={styles.mutedText}>{order.id} · {order.customerPhone}</Text>
        </View>
        <Text style={styles.orderAmount}>{formatCurrency(order.totalAmount)}</Text>
      </View>
      <Text style={styles.cardMeta}>Status: {order.orderStatus} · Payment: {order.paymentStatus}</Text>
      <Text style={styles.mutedText}>
        Delhivery: {order.shippingStatus || 'Not booked'}{order.trackingNumber ? ` · AWB ${order.trackingNumber}` : ''}
      </Text>
      {order.shippingError ? <Text style={styles.errorText}>{order.shippingError}</Text> : null}
      <Text style={styles.mutedText}>{(order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(', ') || 'No item details'}</Text>
      {order.shippingAddress?.city ? <Text style={styles.mutedText}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</Text> : null}
      <ActionButton label="Update status / tracking" secondary onPress={onEdit} />
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return <Text style={styles.emptyState}>{text}</Text>;
}

const COLORS = {
  green: '#047857',
  darkGreen: '#064e3b',
  ink: '#1c1917',
  muted: '#78716c',
  border: '#e7e5e4',
  background: '#f5f5f4',
  white: '#ffffff',
  red: '#b91c1c',
};

const styles = StyleSheet.create({
  appScreen: { flex: 1, backgroundColor: COLORS.background },
  authScreen: { flex: 1, backgroundColor: COLORS.darkGreen, justifyContent: 'center', padding: 20 },
  authCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 22 },
  brandMark: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.green, marginBottom: 16 },
  brandMarkText: { color: COLORS.white, fontSize: 26, fontWeight: '900' },
  authTitle: { color: COLORS.ink, fontSize: 24, fontWeight: '800' },
  authSubtitle: { color: COLORS.muted, marginTop: 6, marginBottom: 14, lineHeight: 20 },
  authError: { color: COLORS.red },
  errorText: { color: COLORS.red, marginBottom: 12, fontWeight: '600' },
  securityNote: { color: COLORS.muted, textAlign: 'center', fontSize: 12, marginTop: 16 },
  setupNote: { color: '#92400e', backgroundColor: '#fffbeb', borderRadius: 10, padding: 10, fontSize: 12, marginTop: 12, lineHeight: 18 },
  orDivider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginVertical: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 18, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerEyebrow: { color: COLORS.green, letterSpacing: 1.2, fontSize: 10, fontWeight: '800' },
  headerTitle: { fontSize: 21, fontWeight: '800', color: COLORS.ink, marginTop: 3 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  iconButtonText: { color: COLORS.green, fontWeight: '900', fontSize: 24 },
  signOutButton: { paddingVertical: 10, paddingHorizontal: 12 },
  signOutText: { color: COLORS.green, fontWeight: '700' },
  tabs: { flexGrow: 0, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: COLORS.green },
  tabText: { color: COLORS.muted, fontWeight: '700' },
  activeTabText: { color: COLORS.darkGreen },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.ink, marginBottom: 4, marginTop: 8 },
  sectionSubtitle: { color: COLORS.muted, marginBottom: 16, lineHeight: 18 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  metricCard: { width: '48%', minHeight: 94, flexGrow: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: COLORS.border },
  metricValue: { color: COLORS.darkGreen, fontSize: 22, fontWeight: '900' },
  metricLabel: { color: COLORS.muted, fontSize: 12, marginTop: 7 },
  card: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, marginBottom: 10, gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  inlineActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 },
  flex: { flex: 1 },
  cardTitle: { color: COLORS.ink, fontSize: 15, fontWeight: '800' },
  cardMeta: { color: COLORS.ink, fontSize: 12, fontWeight: '600' },
  mutedText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  bodyText: { color: COLORS.ink, lineHeight: 20, fontSize: 13 },
  orderAmount: { color: COLORS.darkGreen, fontSize: 16, fontWeight: '900' },
  emptyState: { textAlign: 'center', backgroundColor: COLORS.white, padding: 18, borderRadius: 14, color: COLORS.muted, marginVertical: 10 },
  field: { marginBottom: 13 },
  fieldLabel: { color: COLORS.ink, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 12, color: COLORS.ink, fontSize: 14 },
  multilineInput: { minHeight: 92, textAlignVertical: 'top' },
  actionButton: { backgroundColor: COLORS.green, borderRadius: 11, paddingVertical: 11, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0' },
  destructiveButton: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  disabledButton: { opacity: 0.45 },
  actionButtonText: { color: COLORS.white, fontWeight: '800', fontSize: 12 },
  secondaryButtonText: { color: COLORS.darkGreen },
  pageError: { marginHorizontal: 16, marginTop: 12, padding: 12, backgroundColor: '#fef2f2', color: COLORS.red, borderRadius: 12, lineHeight: 18 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: COLORS.background },
  modalScreen: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { padding: 18, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: COLORS.ink, fontSize: 20, fontWeight: '800' },
  cancelText: { color: COLORS.green, fontWeight: '700' },
  modalContent: { padding: 18, paddingBottom: 40 },
  twoColumns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1 },
  modalBackdrop: { flex: 1, justifyContent: 'center', backgroundColor: '#0009', padding: 16 },
  orderModal: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18 },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, marginTop: 4 },
  statusOption: { borderRadius: 16, paddingVertical: 8, paddingHorizontal: 11, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  selectedStatus: { backgroundColor: COLORS.darkGreen, borderColor: COLORS.darkGreen },
  statusOptionText: { color: COLORS.ink, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  selectedStatusText: { color: COLORS.white },
  modalActions: { flexDirection: 'row', gap: 10 },
});

export default App;
