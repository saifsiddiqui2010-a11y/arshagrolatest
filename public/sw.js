/**
 * Arsh Agro Industry Service Worker
 * Handles offline caching, background push notifications, and live order status delivery.
 */

const CACHE_NAME = 'arsh-agro-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json'
];

// Install: Cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Non-fatal precache error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache versions and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-while-revalidate for static files, Network-first for APIs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip API, non-GET requests, or chrome-extension schemes
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api') || !url.protocol.startsWith('http')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async (networkError) => {
        const cachedResponse = await caches.match(event.request) || await caches.match('/');
        if (cachedResponse) return cachedResponse;
        throw networkError;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Push: Handle incoming Web Push notifications from FCM / Web Push Protocol
self.addEventListener('push', (event) => {
  let data = {
    title: 'Arsh Agro Industry • Live Order Update',
    body: 'Your ArshSarso mustard oil shipment status has changed. Tap to view consignment timeline.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'arsh-order-update',
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        ...data,
        ...payload,
        data: { ...data.data, ...(payload.data || {}) }
      };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    tag: data.tag || 'arsh-order-update',
    renotify: true,
    vibrate: [200, 100, 200],
    data: data.data || { url: '/' },
    actions: [
      { action: 'track', title: 'Track Live' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click: Open or focus application window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and post a message
      for (const client of windowClients) {
        if ('focus' in client) {
          if (notificationData.orderId) {
            client.postMessage({
              type: 'OPEN_TRACK_ORDER',
              orderId: notificationData.orderId,
              phone: notificationData.phone || ''
            });
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Message listener for foreground or client triggered notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [150, 80, 150],
      ...options
    });
  }
});
