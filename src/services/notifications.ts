/**
 * Arsh Agro Industry - Browser Push Notifications & Service Worker Service
 * Allows users to opt-in for live order status updates directly in their browser.
 */

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface NotificationSubscriptionInfo {
  endpoint?: string;
  orderId?: string;
  phone?: string;
  createdAt: string;
}

const STORAGE_KEY_OPT_IN = 'arsh_notifications_enabled';
const STORAGE_KEY_SUBSCRIBED_ORDERS = 'arsh_subscribed_orders';

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private messageListeners: Array<(data: any) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initServiceWorker();
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window;
  }

  public getPermission(): NotificationPermissionState {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission as NotificationPermissionState;
  }

  public async initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) return null;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      this.swRegistration = reg;

      // Listen for messages from Service Worker (e.g. user clicked notification)
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.messageListeners.forEach((listener) => listener(event.data));
      });

      return reg;
    } catch (err) {
      console.warn('[NotificationService] Service Worker registration failed:', err);
      return null;
    }
  }

  public onMessage(callback: (data: any) => void): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Request user permission to receive browser notifications.
   */
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem(STORAGE_KEY_OPT_IN, 'true');
        await this.initServiceWorker();
        return true;
      } else {
        localStorage.setItem(STORAGE_KEY_OPT_IN, 'false');
        return false;
      }
    } catch (err) {
      console.error('[NotificationService] Error requesting notification permission:', err);
      return false;
    }
  }

  /**
   * Send a test browser notification to verify active permissions.
   */
  public async sendTestAlert(): Promise<boolean> {
    const perm = this.getPermission();
    if (perm !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    const title = 'Arsh Agro Industry • Notification Enabled';
    const body = 'Live order tracking alerts are active! You will receive updates as your ArshSarso mustard oil is pressed and shipped from Siwan, Bihar.';

    return this.showNotification(title, {
      body,
      tag: 'arsh-test-alert',
      data: { url: '/' }
    });
  }

  /**
   * Send live order milestone notification
   */
  public async sendOrderMilestoneAlert(
    orderId: string,
    status: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
    details?: { courierName?: string; trackingNumber?: string; city?: string }
  ): Promise<boolean> {
    if (this.getPermission() !== 'granted') {
      return false;
    }

    let title = `ArshSarso Order #${orderId}`;
    let body = 'Your cold-pressed oil order status has updated.';

    switch (status) {
      case 'placed':
        title = `Order Confirmed • #${orderId}`;
        body = 'Your order is confirmed at the Siwan mill campus. Native cold-pressing queue scheduled.';
        break;
      case 'processing':
        title = `Wood-Cold Pressing Underway • #${orderId}`;
        body = 'Your mustard seeds are currently being cold-pressed under 45°C and sedimented for purity.';
        break;
      case 'shipped':
        title = `Consignment Dispatched • #${orderId}`;
        body = `Handed to ${details?.courierName || 'Delhivery Express'}! AWB: ${details?.trackingNumber || 'AAG9928172'}. Tap to track.`;
        break;
      case 'delivered':
        title = `ArshSarso Delivered • #${orderId}`;
        body = `Consignment safely delivered to ${details?.city || 'your doorstep'}. Enjoy authentic pure mustard aroma!`;
        break;
      case 'cancelled':
        title = `Order Cancelled • #${orderId}`;
        body = 'Your order has been cancelled. For refunds or re-ordering assistance, tap to connect on WhatsApp.';
        break;
    }

    return this.showNotification(title, {
      body,
      tag: `order-${orderId}-${status}`,
      data: {
        orderId,
        url: `/?track=${encodeURIComponent(orderId)}`
      }
    });
  }

  /**
   * Display notification via ServiceWorker or fallback Notification API
   */
  private async showNotification(title: string, options: NotificationOptions): Promise<boolean> {
    try {
      if (this.swRegistration && 'showNotification' in this.swRegistration) {
        await this.swRegistration.showNotification(title, {
          icon: '/icon.svg',
          badge: '/icon.svg',
          ...options
        } as any);
        return true;
      } else if ('Notification' in window) {
        new Notification(title, {
          icon: '/icon.svg',
          badge: '/icon.svg',
          ...options
        });
        return true;
      }
    } catch (err) {
      console.warn('[NotificationService] Fallback to standard notification:', err);
      try {
        new Notification(title, options);
        return true;
      } catch (e2) {
        console.error('[NotificationService] Could not show notification:', e2);
      }
    }
    return false;
  }

  /**
   * Subscribe an order to receive browser updates
   */
  public subscribeOrder(orderId: string, phone?: string): void {
    const list = this.getSubscribedOrders();
    if (!list.includes(orderId)) {
      list.push(orderId);
      localStorage.setItem(STORAGE_KEY_SUBSCRIBED_ORDERS, JSON.stringify(list));
    }

    // Inform backend if needed
    fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, phone, permission: this.getPermission() })
    }).catch((e) => console.warn('Could not post subscription to backend:', e));
  }

  public unsubscribeOrder(orderId: string): void {
    const list = this.getSubscribedOrders().filter((id) => id !== orderId);
    localStorage.setItem(STORAGE_KEY_SUBSCRIBED_ORDERS, JSON.stringify(list));
  }

  public isOrderSubscribed(orderId: string): boolean {
    return this.getSubscribedOrders().includes(orderId);
  }

  public getSubscribedOrders(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SUBSCRIBED_ORDERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const notificationService = new NotificationService();
