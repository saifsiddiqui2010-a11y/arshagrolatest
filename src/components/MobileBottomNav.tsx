import React from 'react';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface MobileBottomNavProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-emerald-200/60 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-bottom">
      <div className="grid grid-cols-4 items-center justify-around text-center">
        {/* Home */}
        <button
          onClick={() => scrollTo('hero')}
          className="flex flex-col items-center justify-center py-1 text-stone-600 hover:text-emerald-800 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
        </button>

        {/* Shop */}
        <button
          onClick={() => scrollTo('products')}
          className="flex flex-col items-center justify-center py-1 text-stone-600 hover:text-emerald-800 transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Shop</span>
        </button>

        {/* Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 text-emerald-800 relative transition-colors"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-amber-500 text-stone-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5">Cart</span>
        </button>

        {/* Account / Sign In */}
        <button
          onClick={user ? onOpenProfile : onOpenAuth}
          className="flex flex-col items-center justify-center py-1 text-stone-600 hover:text-emerald-800 transition-colors cursor-pointer"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">{user ? 'Account' : 'Sign In'}</span>
        </button>
      </div>
    </div>
  );
};
