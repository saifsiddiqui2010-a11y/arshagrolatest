import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Truck, 
  Package, 
  Sparkles,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { notificationService, NotificationPermissionState } from '../services/notifications';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTrackOrder?: (orderId?: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onOpenTrackOrder,
}) => {
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [subscribedOrders, setSubscribedOrders] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPermission(notificationService.getPermission());
      setSubscribedOrders(notificationService.getSubscribedOrders());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnableAlerts = async () => {
    setIsRequesting(true);
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.getPermission());
    setIsRequesting(false);

    if (granted) {
      await notificationService.sendTestAlert();
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  const handleSendTest = async () => {
    await notificationService.sendTestAlert();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  const handleUnsubscribe = (orderId: string) => {
    notificationService.unsubscribeOrder(orderId);
    setSubscribedOrders(notificationService.getSubscribedOrders());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Deep Emerald */}
        <div className="bg-emerald-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <BellRing className="w-5 h-5 text-emerald-100 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif-heading text-white">
                Live Order Push Alerts
              </h3>
              <p className="text-xs text-emerald-300 font-medium">
                Browser Service Worker & FCM Web Push
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Current Status Card */}
          <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            permission === 'granted' 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : permission === 'denied'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2.5">
              {permission === 'granted' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : permission === 'denied' ? (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              ) : (
                <Bell className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <span className="font-bold block text-sm">
                  {permission === 'granted' && 'Push Alerts are Active'}
                  {permission === 'denied' && 'Browser Notifications Blocked'}
                  {permission === 'default' && 'Alerts Not Yet Enabled'}
                  {permission === 'unsupported' && 'Browser Does Not Support Notifications'}
                </span>
                <span className="text-[11px] text-stone-600">
                  {permission === 'granted' && 'You will receive native alerts whenever your oil moves.'}
                  {permission === 'denied' && 'Click the lock icon in your browser URL bar to allow notifications.'}
                  {permission === 'default' && 'Click below to opt in for live order status delivery.'}
                </span>
              </div>
            </div>

            {permission === 'granted' && (
              <span className="bg-emerald-200/80 text-emerald-900 font-black text-[10px] px-2.5 py-1 rounded-full uppercase shrink-0">
                Active
              </span>
            )}
          </div>

          {/* Test notification feedback banner */}
          {testSent && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Test notification dispatched to your browser! Look at your desktop/system tray.</span>
            </div>
          )}

          {/* What alerts you will receive */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Live Milestone Notifications
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-stone-900 block">Wood-Cold Pressing Update</strong>
                  <p className="text-stone-500 text-[11px]">Alert when your yellow/black mustard seeds are pressed below 45°C at our Siwan mill.</p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-stone-900 block">Courier Dispatch & Live AWB</strong>
                  <p className="text-stone-500 text-[11px]">Instant alert with Delhivery/DTDC tracking number as soon as the can leaves the mill campus.</p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-stone-900 block">Out for Delivery Alert</strong>
                  <p className="text-stone-500 text-[11px]">Notice when the courier agent is on the way to your doorstep.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribed Orders List */}
          {subscribedOrders.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Subscribed Orders ({subscribedOrders.length})
              </h4>
              <div className="space-y-1.5">
                {subscribedOrders.map((ordId) => (
                  <div key={ordId} className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs">
                    <span className="font-mono font-bold text-emerald-950">{ordId}</span>
                    <div className="flex items-center gap-2">
                      {onOpenTrackOrder && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenTrackOrder(ordId);
                          }}
                          className="text-emerald-800 hover:underline font-bold text-[11px] cursor-pointer"
                        >
                          Track
                        </button>
                      )}
                      <button
                        onClick={() => handleUnsubscribe(ordId)}
                        className="text-stone-400 hover:text-red-600 text-[11px] font-medium cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 space-y-2">
            {permission !== 'granted' ? (
              <button
                type="button"
                onClick={handleEnableAlerts}
                disabled={isRequesting}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BellRing className="w-4 h-4" />
                <span>{isRequesting ? 'Requesting Permission...' : 'Enable Browser Order Alerts'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendTest}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Send Test Browser Notification Now</span>
              </button>
            )}

            <p className="text-[11px] text-center text-stone-400">
              🔒 Zero spam. Alerts are strictly triggered for your confirmed orders and deliveries.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>PWA & Service Worker Compliant</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
