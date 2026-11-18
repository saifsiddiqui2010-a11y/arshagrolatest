import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { getCheckoutSettings } from '../services/orders';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string, quantity?: number) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('arsh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    try {
      return localStorage.getItem('arsh_coupon') || null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 499,
    standardShippingFee: 60,
  });

  useEffect(() => {
    let active = true;
    getCheckoutSettings()
      .then((settings) => {
        if (active) setShippingSettings(settings);
      })
      .catch((error: unknown) => {
        console.error('[Cart] Could not load server shipping settings; using defaults.', error);
      });
    return () => {
      active = false;
    };
  }, []);

  const { freeShippingThreshold, standardShippingFee } = shippingSettings;

  useEffect(() => {
    try {
      localStorage.setItem('arsh_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('arsh_coupon', appliedCoupon);
    } else {
      localStorage.removeItem('arsh_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, size?: string, quantity: number = 1) => {
    const itemSize = size || product.size;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === itemSize
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { product, selectedSize: itemSize, quantity }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product.id === productId && (!size || item.selectedSize === size))
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId && (!size || item.selectedSize === size)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Discount calculation
  let discount = 0;
  if (appliedCoupon === 'ARSHFIRST') {
    discount = Math.round(subtotal * 0.1); // 10% off
  } else if (appliedCoupon === 'SARSO50') {
    discount = Math.min(50, subtotal); // ₹50 off
  }

  // Delivery fee
  let deliveryFee = subtotal >= freeShippingThreshold || subtotal === 0 || appliedCoupon === 'SIWANFREE'
    ? 0
    : standardShippingFee;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'ARSHFIRST') {
      setAppliedCoupon('ARSHFIRST');
      return { success: true, message: '🎉 ARSHFIRST applied! 10% discount added.' };
    } else if (clean === 'SARSO50') {
      setAppliedCoupon('SARSO50');
      return { success: true, message: '🎉 SARSO50 applied! ₹50 instant discount added.' };
    } else if (clean === 'SIWANFREE') {
      setAppliedCoupon('SIWANFREE');
      return { success: true, message: '🚚 SIWANFREE applied! Free doorstep shipping unlocked.' };
    } else {
      return { success: false, message: 'Invalid coupon code. Try ARSHFIRST or SARSO50.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        discount,
        deliveryFee,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        freeShippingThreshold,
        amountNeededForFreeShipping
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
