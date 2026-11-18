const crypto = require('node:crypto');
const { initializeApp } = require('firebase-admin/app');
const { FieldValue, Timestamp, getFirestore } = require('firebase-admin/firestore');
const { logger } = require('firebase-functions');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');

initializeApp();

const DATABASE_ID = 'ai-studio-arshagroindustry-82f583d9-79b2-45fc-816f-1719c8a891d1';
const REGION = 'us-central1';
const db = getFirestore(undefined, DATABASE_ID);
const razorpayKeyId = defineSecret('RAZORPAY_KEY_ID');
const razorpayKeySecret = defineSecret('RAZORPAY_KEY_SECRET');
const delhiveryApiToken = defineSecret('DELHIVERY_API_TOKEN');
const delhiveryApiBaseUrl = defineString('DELHIVERY_API_BASE_URL', {
  default: 'https://track.delhivery.com',
});
const defaultSettings = {
  freeShippingThreshold: 499,
  standardShippingFee: 60,
};

function getRateLimit(request) {
  const identity = request.auth?.uid
    ? `user:${request.auth.uid}`
    : request.rawRequest?.ip
      ? `ip:${request.rawRequest.ip}`
      : null;
  if (!identity) {
    throw new HttpsError('failed-precondition', 'Unable to validate this checkout request. Please try again.');
  }
  const hour = Math.floor(Date.now() / (60 * 60 * 1000));
  const id = crypto.createHash('sha256').update(`${identity}:${hour}`).digest('hex');
  return {
    ref: db.collection('checkoutRateLimits').doc(id),
    limit: request.auth?.uid ? 20 : 10,
    expiresAt: Timestamp.fromMillis((hour + 2) * 60 * 60 * 1000),
  };
}

async function consumeRateLimit(rateLimit) {
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(rateLimit.ref);
    const count = snapshot.exists ? snapshot.data().count : 0;
    if (count >= rateLimit.limit) {
      throw new HttpsError('resource-exhausted', 'Too many checkout attempts. Please wait before trying again.');
    }
    transaction.set(rateLimit.ref, { count: count + 1, expiresAt: rateLimit.expiresAt });
  });
}

function requiredText(value, field, maxLength) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new HttpsError('invalid-argument', `Enter a valid ${field}.`);
  }
  return value.trim();
}

function normalizeCheckoutRequest(data, user) {
  if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 20) {
    throw new HttpsError('invalid-argument', 'Your cart is empty or contains too many products.');
  }

  const shippingAddress = {
    fullName: requiredText(data.shippingAddress?.fullName, 'recipient name', 150),
    phone: requiredText(data.shippingAddress?.phone, 'phone number', 32),
    street: requiredText(data.shippingAddress?.street, 'street address', 300),
    city: requiredText(data.shippingAddress?.city, 'city', 100),
    state: requiredText(data.shippingAddress?.state, 'state', 100),
    pincode: requiredText(data.shippingAddress?.pincode, 'postal code', 16),
    ...(typeof data.shippingAddress?.landmark === 'string' && data.shippingAddress.landmark.trim()
      ? { landmark: data.shippingAddress.landmark.trim().slice(0, 150) }
      : {}),
  };
  if (!/^[+\d\s()-]{8,32}$/.test(shippingAddress.phone)) {
    throw new HttpsError('invalid-argument', 'Enter a valid phone number.');
  }

  const quantities = new Map();
  data.items.forEach((item) => {
    if (!item || typeof item.productId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(item.productId)) {
      throw new HttpsError('invalid-argument', 'A cart item is invalid.');
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) {
      throw new HttpsError('invalid-argument', 'Product quantity must be between 1 and 50.');
    }
    const quantity = (quantities.get(item.productId) || 0) + item.quantity;
    if (quantity > 50) {
      throw new HttpsError('invalid-argument', 'Product quantity must be between 1 and 50.');
    }
    quantities.set(item.productId, quantity);
  });
  const items = [...quantities.entries()].map(([productId, quantity]) => ({ productId, quantity }));

  return {
    uid: user?.uid || null,
    customerEmail: typeof user?.token?.email === 'string' ? user.token.email : '',
    customerName: shippingAddress.fullName,
    customerPhone: shippingAddress.phone,
    shippingAddress,
    items,
    couponCode: typeof data.couponCode === 'string' ? data.couponCode.trim().toUpperCase() : '',
  };
}

exports.getCheckoutSettings = onCall({ region: REGION }, async () => {
  const snapshot = await db.doc('settings/store').get();
  const savedSettings = snapshot.exists ? snapshot.data() : {};
  return {
    freeShippingThreshold: Number.isFinite(savedSettings.freeShippingThreshold) && savedSettings.freeShippingThreshold >= 0
      ? savedSettings.freeShippingThreshold
      : defaultSettings.freeShippingThreshold,
    standardShippingFee: Number.isFinite(savedSettings.standardShippingFee) && savedSettings.standardShippingFee >= 0
      ? savedSettings.standardShippingFee
      : defaultSettings.standardShippingFee,
  };
});

async function quoteOrder(orderRequest) {
  const productSnapshots = await Promise.all(
    orderRequest.items.map((item) => db.collection('products').doc(item.productId).get())
  );
  const items = orderRequest.items.map((item, index) => {
    const snapshot = productSnapshots[index];
    if (!snapshot.exists) {
      throw new HttpsError('failed-precondition', 'A product in your cart is no longer available.');
    }
    const product = snapshot.data();
    if (!Number.isFinite(product.price) || product.price <= 0 ||
        !Number.isInteger(product.stockCount) || product.stockCount < item.quantity) {
      throw new HttpsError('failed-precondition', `${product.name || 'A product'} is out of stock.`);
    }
    return {
      productId: snapshot.id,
      name: requiredText(product.name, 'product name', 200),
      price: product.price,
      quantity: item.quantity,
      size: requiredText(product.size, 'product size', 64),
      image: typeof product.image === 'string' ? product.image : '',
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const couponDiscount = orderRequest.couponCode === 'ARSHFIRST'
    ? Math.round(subtotal * 0.1)
    : orderRequest.couponCode === 'SARSO50'
      ? Math.min(50, subtotal)
      : 0;
  const settingsSnapshot = await db.doc('settings/store').get();
  const savedSettings = settingsSnapshot.exists ? settingsSnapshot.data() : {};
  const settings = {
    freeShippingThreshold: Number.isFinite(savedSettings.freeShippingThreshold) && savedSettings.freeShippingThreshold >= 0
      ? savedSettings.freeShippingThreshold
      : defaultSettings.freeShippingThreshold,
    standardShippingFee: Number.isFinite(savedSettings.standardShippingFee) && savedSettings.standardShippingFee >= 0
      ? savedSettings.standardShippingFee
      : defaultSettings.standardShippingFee,
  };
  const freeDelivery = subtotal >= settings.freeShippingThreshold || orderRequest.couponCode === 'SIWANFREE';
  const deliveryFee = freeDelivery ? 0 : settings.standardShippingFee;

  return {
    items,
    subtotal,
    discount: couponDiscount,
    deliveryFee,
    totalAmount: Math.max(0, subtotal - couponDiscount + deliveryFee),
  };
}

async function createOrder(orderRequest, quote, payment, checkoutRef, rateLimit) {
  const orderRef = db.collection('orders').doc();
  const productRefs = quote.items.map((item) => db.collection('products').doc(item.productId));
  return db.runTransaction(async (transaction) => {
    const rateLimitSnapshot = rateLimit ? await transaction.get(rateLimit.ref) : null;
    if (checkoutRef) {
      const checkoutSnapshot = await transaction.get(checkoutRef);
      if (!checkoutSnapshot.exists) {
        throw new HttpsError('not-found', 'The payment session could not be found.');
      }
      const checkout = checkoutSnapshot.data();
      if (checkout.status === 'completed' && checkout.orderId) {
        const existingOrder = await transaction.get(db.collection('orders').doc(checkout.orderId));
        if (existingOrder.exists) return existingOrder.data();
      }
      if (checkout.status !== 'created') {
        throw new HttpsError('failed-precondition', 'This payment session is no longer available.');
      }
    }
    if (rateLimit) {
      const currentCount = rateLimitSnapshot.exists ? rateLimitSnapshot.data().count : 0;
      if (currentCount >= rateLimit.limit) {
        throw new HttpsError('resource-exhausted', 'Too many checkout attempts. Please wait before trying again.');
      }
    }

    const snapshots = await Promise.all(productRefs.map((ref) => transaction.get(ref)));
    snapshots.forEach((snapshot, index) => {
      const current = snapshot.data();
      const quantity = quote.items[index].quantity;
      if (!snapshot.exists || !Number.isInteger(current.stockCount) || current.stockCount < quantity) {
        throw new HttpsError('failed-precondition', `${quote.items[index].name} is no longer available in the requested quantity.`);
      }
    });

    snapshots.forEach((snapshot, index) => {
      const stockCount = snapshot.data().stockCount - quote.items[index].quantity;
      transaction.update(productRefs[index], { stockCount, inStock: stockCount > 0 });
    });

    const newOrder = {
      id: orderRef.id,
      userId: orderRequest.uid || `guest_${orderRef.id}`,
      customerName: orderRequest.customerName,
      customerEmail: orderRequest.customerEmail,
      customerPhone: orderRequest.customerPhone,
      shippingAddress: orderRequest.shippingAddress,
      items: quote.items,
      subtotal: quote.subtotal,
      discount: quote.discount,
      deliveryFee: quote.deliveryFee,
      totalAmount: quote.totalAmount,
      paymentMethod: payment.method,
      razorpayOrderId: payment.razorpayOrderId || null,
      razorpayPaymentId: payment.razorpayPaymentId || null,
      paymentStatus: payment.status,
      orderStatus: 'placed',
      createdAt: new Date().toISOString(),
    };
    transaction.create(orderRef, newOrder);
    if (rateLimit) {
      transaction.set(rateLimit.ref, {
        count: (rateLimitSnapshot.exists ? rateLimitSnapshot.data().count : 0) + 1,
        expiresAt: rateLimit.expiresAt,
      });
    }
    if (checkoutRef) {
      transaction.update(checkoutRef, {
        status: 'completed',
        orderId: orderRef.id,
        paymentId: payment.razorpayPaymentId,
        completedAt: new Date().toISOString(),
      });
    }
    return newOrder;
  });
}

async function razorpayRequest(path, method, body, keyId, keySecret) {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
    'Content-Type': 'application/json',
  };
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    logger.error('Razorpay API request failed', { path, status: response.status });
    throw new HttpsError('failed-precondition', 'Payment gateway could not complete the request.');
  }
  return result;
}

exports.createCashOnDeliveryOrder = onCall({ region: REGION }, async (request) => {
  const orderRequest = normalizeCheckoutRequest(request.data || {}, request.auth);
  const quote = await quoteOrder(orderRequest);
  const order = await createOrder(
    orderRequest,
    quote,
    { method: 'cod', status: 'pending' },
    null,
    getRateLimit(request)
  );
  return { order };
});

exports.createRazorpayOrder = onCall({
  region: REGION,
  secrets: [razorpayKeyId, razorpayKeySecret],
}, async (request) => {
  await consumeRateLimit(getRateLimit(request));
  const orderRequest = normalizeCheckoutRequest(request.data || {}, request.auth);
  const quote = await quoteOrder(orderRequest);
  const keyId = razorpayKeyId.value();
  const keySecret = razorpayKeySecret.value();
  if (!keyId || !keySecret) {
    throw new HttpsError('failed-precondition', 'Online payments are not configured yet.');
  }

  const receipt = `arsh_${crypto.randomBytes(10).toString('hex')}`;
  const razorpayOrder = await razorpayRequest(
    'orders',
    'POST',
    { amount: Math.round(quote.totalAmount * 100), currency: 'INR', receipt },
    keyId,
    keySecret
  );
  await db.collection('pendingCheckouts').doc(razorpayOrder.id).create({
    orderRequest,
    quote,
    status: 'created',
    createdAt: new Date().toISOString(),
    expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    order: { id: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency },
    keyId,
  };
});

exports.verifyRazorpayPayment = onCall({
  region: REGION,
  secrets: [razorpayKeyId, razorpayKeySecret],
}, async (request) => {
  const orderId = requiredText(request.data?.razorpay_order_id, 'Razorpay order ID', 128);
  const paymentId = requiredText(request.data?.razorpay_payment_id, 'Razorpay payment ID', 128);
  const signature = requiredText(request.data?.razorpay_signature, 'payment signature', 256);
  const keyId = razorpayKeyId.value();
  const keySecret = razorpayKeySecret.value();
  if (!keyId || !keySecret) {
    throw new HttpsError('failed-precondition', 'Online payments are not configured yet.');
  }

  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest();
  let received;
  try {
    received = Buffer.from(signature, 'hex');
  } catch {
    throw new HttpsError('invalid-argument', 'Payment signature is invalid.');
  }
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    throw new HttpsError('permission-denied', 'Payment signature verification failed.');
  }

  const checkoutRef = db.collection('pendingCheckouts').doc(orderId);
  const checkoutSnapshot = await checkoutRef.get();
  if (!checkoutSnapshot.exists) {
    throw new HttpsError('not-found', 'The payment session could not be found.');
  }
  const checkout = checkoutSnapshot.data();
  if (checkout.orderRequest.uid && checkout.orderRequest.uid !== request.auth?.uid) {
    throw new HttpsError('permission-denied', 'This payment belongs to a different account.');
  }
  if (checkout.status === 'completed' && checkout.orderId) {
    const existing = await db.collection('orders').doc(checkout.orderId).get();
    if (existing.exists) return { order: existing.data() };
  }

  const payment = await razorpayRequest(`payments/${encodeURIComponent(paymentId)}`, 'GET', null, keyId, keySecret);
  if (payment.order_id !== orderId || payment.amount !== Math.round(checkout.quote.totalAmount * 100) ||
      payment.currency !== 'INR' || payment.status !== 'captured') {
    throw new HttpsError('failed-precondition', 'The payment has not been captured for this order.');
  }

  let order;
  try {
    order = await createOrder(checkout.orderRequest, checkout.quote, {
      method: 'razorpay',
      status: 'paid',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    }, checkoutRef);
  } catch (error) {
    if (!(error instanceof HttpsError) || error.code !== 'failed-precondition' ||
        !error.message.includes('no longer available in the requested quantity')) {
      throw error;
    }
    logger.error('Captured payment could not be converted to an order; requesting refund.', { orderId, paymentId });
    try {
      await razorpayRequest(
        `payments/${encodeURIComponent(paymentId)}/refund`,
        'POST',
        { amount: payment.amount },
        keyId,
        keySecret
      );
    } catch (refundError) {
      logger.error('Automatic refund request failed; customer support follow-up is required.', {
        orderId,
        paymentId,
        error: refundError instanceof Error ? refundError.message : String(refundError),
      });
      throw new HttpsError('internal', `Payment was captured but the order could not be placed. Contact support with payment ID ${paymentId}.`);
    }
    throw new HttpsError('failed-precondition', 'Stock changed after payment. A refund was requested; contact the store if it is not received.');
  }

  return { order };
});

function getDelhiveryErrorMessage(responseData) {
  const packageRemarks = responseData?.packages?.[0]?.remarks;
  const candidate = Array.isArray(packageRemarks)
    ? packageRemarks.find((remark) => typeof remark === 'string' && remark.trim())
    : null;
  return (candidate || responseData?.rmk || 'Delhivery did not accept the shipment.').toString().slice(0, 240);
}

async function setDelhiveryStatus(orderRef, shippingStatus, shippingError) {
  await orderRef.update({
    shippingStatus,
    shippingError: shippingError || FieldValue.delete(),
    shippingUpdatedAt: new Date().toISOString(),
  });
  const snapshot = await orderRef.get();
  return snapshot.data();
}

async function createDelhiveryShipment(orderId) {
  const orderRef = db.collection('orders').doc(orderId);
  const orderSnapshot = await orderRef.get();
  if (!orderSnapshot.exists) {
    throw new HttpsError('not-found', 'Order was not found.');
  }
  const order = orderSnapshot.data();
  if (order.shippingStatus === 'booked' || order.courierName === 'Delhivery' && order.trackingNumber) {
    return order;
  }
  if (order.shippingStatus === 'booking' || order.shippingStatus === 'review_required') {
    throw new HttpsError('failed-precondition', 'Check the Delhivery dashboard before retrying this shipment.');
  }
  if (order.paymentMethod !== 'cod' && order.paymentStatus !== 'paid') {
    throw new HttpsError('failed-precondition', 'Only COD or successfully paid orders can be sent to Delhivery.');
  }

  const settingsSnapshot = await db.doc('settings/store').get();
  const settings = settingsSnapshot.exists ? settingsSnapshot.data() : {};
  if (settings.delhiveryEnabled !== true) {
    throw new HttpsError('failed-precondition', 'Enable Delhivery booking in Store Settings first.');
  }
  const pickupLocationName = typeof settings.delhiveryPickupLocationName === 'string'
    ? settings.delhiveryPickupLocationName.trim()
    : '';
  if (!pickupLocationName) {
    return setDelhiveryStatus(orderRef, 'needs_configuration', 'Set the registered Delhivery pickup location name in Store Settings.');
  }

  const apiToken = delhiveryApiToken.value();
  if (!apiToken) {
    return setDelhiveryStatus(orderRef, 'needs_configuration', 'Configure DELHIVERY_API_TOKEN in Firebase Secrets.');
  }

  if (!Array.isArray(order.items) || !order.items.length) {
    return setDelhiveryStatus(orderRef, 'needs_configuration', 'This order has no product details for shipment booking.');
  }
  if (order.items.some((item) =>
    typeof item.productId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(item.productId) ||
    !Number.isInteger(item.quantity) || item.quantity < 1
  )) {
    return setDelhiveryStatus(orderRef, 'needs_configuration', 'Order items are missing valid product IDs or quantities.');
  }
  const itemRefs = order.items.map((item) => db.collection('products').doc(item.productId));
  const productSnapshots = await Promise.all(itemRefs.map((ref) => ref.get()));
  const missingWeight = productSnapshots.findIndex((snapshot) =>
    !snapshot.exists ||
    !Number.isFinite(snapshot.data().shippingWeightGrams) ||
    snapshot.data().shippingWeightGrams <= 0
  );
  if (missingWeight !== -1) {
    const name = order.items[missingWeight]?.name || 'A product';
    return setDelhiveryStatus(orderRef, 'needs_configuration', `Add its packed shipping weight to ${name} in Inventory.`);
  }
  const weightGrams = order.items.reduce(
    (sum, item, index) => sum + productSnapshots[index].data().shippingWeightGrams * item.quantity,
    0
  );
  const address = order.shippingAddress || {};
  const requiredAddressFields = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'];
  if (requiredAddressFields.some((field) => typeof address[field] !== 'string' || !address[field].trim())) {
    return setDelhiveryStatus(orderRef, 'needs_configuration', 'The order is missing required delivery address details.');
  }

  const baseUrl = delhiveryApiBaseUrl.value().replace(/\/+$/, '');
  let apiUrl;
  try {
    apiUrl = new URL(baseUrl);
  } catch {
    return setDelhiveryStatus(orderRef, 'needs_configuration', 'DELHIVERY_API_BASE_URL is invalid.');
  }
  if (apiUrl.protocol !== 'https:' || apiUrl.port || apiUrl.username || apiUrl.password ||
      apiUrl.pathname !== '/' || apiUrl.search || apiUrl.hash ||
      !['track.delhivery.com', 'staging-express.delhivery.com'].includes(apiUrl.hostname)) {
    return setDelhiveryStatus(orderRef, 'needs_configuration', 'Delhivery API base URL must use an approved Delhivery host.');
  }

  const claimed = await db.runTransaction(async (transaction) => {
    const currentSnapshot = await transaction.get(orderRef);
    if (!currentSnapshot.exists) {
      throw new HttpsError('not-found', 'Order was not found.');
    }
    const current = currentSnapshot.data();
    if (current.shippingStatus === 'booked' || current.courierName === 'Delhivery' && current.trackingNumber) {
      return false;
    }
    if (current.shippingStatus === 'booking' || current.shippingStatus === 'review_required') {
      throw new HttpsError('failed-precondition', 'Check the Delhivery dashboard before retrying this shipment.');
    }
    transaction.update(orderRef, {
      courierName: 'Delhivery',
      shippingStatus: 'booking',
      shippingError: FieldValue.delete(),
      shippingUpdatedAt: new Date().toISOString(),
    });
    return true;
  });
  if (!claimed) {
    const current = await orderRef.get();
    return current.data();
  }

  const productsDescription = order.items
    .map((item) => `${item.name} x${item.quantity}`)
    .join(', ')
    .slice(0, 240);
  const payload = {
    shipments: [{
      name: address.fullName,
      add: address.street,
      pin: address.pincode,
      city: address.city,
      state: address.state,
      country: 'India',
      phone: address.phone,
      order: order.id,
      payment_mode: order.paymentMethod === 'cod' ? 'COD' : 'Pre-paid',
      cod_amount: order.paymentMethod === 'cod' ? order.totalAmount : 0,
      total_amount: order.totalAmount,
      products_desc: productsDescription,
      quantity: String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
      weight: Math.ceil(weightGrams),
      seller_inv: order.id,
    }],
    pickup_location: { name: pickupLocationName },
  };
  const form = new URLSearchParams({
    format: 'json',
    data: JSON.stringify(payload),
  });

  try {
    const response = await fetch(`${baseUrl}/api/cmu/create.json`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      const state = response.status >= 500 ? 'review_required' : 'failed';
      return setDelhiveryStatus(
        orderRef,
        state,
        state === 'review_required'
          ? 'Delhivery response was inconclusive. Check its dashboard before retrying.'
          : `Delhivery rejected the shipment (HTTP ${response.status}).`
      );
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      return setDelhiveryStatus(
        orderRef,
        'review_required',
        'Delhivery response could not be read. Check its dashboard before retrying.'
      );
    }

    const packageResult = responseData?.packages?.[0];
    if (responseData?.success !== true || packageResult?.status !== 'Success' ||
        typeof packageResult?.waybill !== 'string' || !packageResult.waybill) {
      return setDelhiveryStatus(orderRef, 'failed', getDelhiveryErrorMessage(responseData));
    }

    await orderRef.update({
      courierName: 'Delhivery',
      trackingNumber: packageResult.waybill,
      shippingStatus: 'booked',
      shippingError: FieldValue.delete(),
      shippingUpdatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Delhivery booking result is unknown; manual verification is required.', {
      orderId,
      error: error instanceof Error ? error.message : String(error),
    });
    return setDelhiveryStatus(
      orderRef,
      'review_required',
      'Booking result could not be confirmed. Check Delhivery before retrying to avoid a duplicate shipment.'
    );
  }

  const completed = await orderRef.get();
  logger.info('Delhivery shipment booked.', { orderId, waybill: completed.data()?.trackingNumber });
  return completed.data();
}

exports.bookDelhiveryShipmentOnOrder = onDocumentCreated({
  document: 'orders/{orderId}',
  database: DATABASE_ID,
  region: REGION,
  secrets: [delhiveryApiToken],
}, async (event) => {
  const order = event.data?.data();
  if (!order || (order.paymentMethod !== 'cod' && order.paymentStatus !== 'paid')) return;
  const settings = await db.doc('settings/store').get();
  if (!settings.exists || settings.data().delhiveryEnabled !== true) return;

  try {
    await createDelhiveryShipment(event.params.orderId);
  } catch (error) {
    logger.error('Automatic Delhivery booking did not complete.', {
      orderId: event.params.orderId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

exports.retryDelhiveryBooking = onCall({
  region: REGION,
  secrets: [delhiveryApiToken],
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in as an administrator to book shipments.');
  }
  const email = typeof request.auth.token.email === 'string' ? request.auth.token.email.toLowerCase() : '';
  const allowedEmails = new Set([
    'saif.siddiqui2010@gmail.com',
    'admin@arshagroindustry.com',
    'arshagroindustry@gmail.com',
  ]);
  const adminDocument = await db.doc(`admins/${request.auth.uid}`).get();
  if (!allowedEmails.has(email) && !adminDocument.exists) {
    throw new HttpsError('permission-denied', 'Administrator access is required.');
  }
  const orderId = requiredText(request.data?.orderId, 'order ID', 128);
  const order = await createDelhiveryShipment(orderId);
  return { order };
});

exports.sendNewOrderAdminPush = onDocumentCreated({
  document: 'orders/{orderId}',
  database: DATABASE_ID,
  region: REGION,
  retry: true,
}, async (event) => {
  const order = event.data?.data();
  if (!order) return;

  const adminDevices = await db.collection('admin_devices').get();
  const tokenEntries = adminDevices.docs.flatMap((snapshot) =>
    (Array.isArray(snapshot.data().expoPushTokens) ? snapshot.data().expoPushTokens : [])
      .filter((token) => typeof token === 'string' && token.startsWith('ExponentPushToken['))
      .map((token) => ({ token, ref: snapshot.ref }))
  );
  const tokens = [...new Set(tokenEntries.map((entry) => entry.token))];
  if (!tokens.length) {
    logger.warn('New order has no registered admin push devices.', { orderId: event.params.orderId });
    return;
  }

  for (let index = 0; index < tokens.length; index += 100) {
    const chunk = tokens.slice(index, index + 100);
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(chunk.map((to) => ({
        to,
        title: 'New Arsh Agro order',
        body: `Order ${event.params.orderId} received • ₹${order.totalAmount}`,
        sound: 'default',
        data: { orderId: event.params.orderId, screen: 'orders' },
      }))),
    });
    if (!response.ok) {
      throw new Error(`Expo push service returned HTTP ${response.status}.`);
    }
    const result = await response.json();
    const tickets = Array.isArray(result.data) ? result.data : [];
    if (tickets.some((ticket) => ticket.status === 'error' && ticket.details?.error !== 'DeviceNotRegistered')) {
      throw new Error('Expo push service rejected one or more admin notifications.');
    }
    const invalidTokens = tickets.flatMap((ticket, ticketIndex) =>
      ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered' ? [chunk[ticketIndex]] : []
    );
    if (invalidTokens.length) {
      const updates = tokenEntries
        .filter((entry) => invalidTokens.includes(entry.token))
        .map((entry) => entry.ref.update({ expoPushTokens: FieldValue.arrayRemove(...invalidTokens) }));
      await Promise.all(updates);
    }
  }
});
