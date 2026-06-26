import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Home, ShoppingCart, Package, User } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function MobileBottomNav({ onMenuClick }) {
    const { url, props } = usePage();
    const { cart_count } = props;
    const { t } = useTranslation();

    // Helper to check if a route is active
    const isActive = (path) => {
        if (path === '/' && url === '/') return true;
        if (path !== '/' && url.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-between items-center px-1 h-[60px] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {/* Menu */}
            <button 
                onClick={onMenuClick}
                className="flex flex-col items-center justify-center flex-1 py-1 text-gray-500 hover:text-primary-600 transition-colors"
            >
                <Menu size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('mobile.menu', 'Menu')}</span>
            </button>

            {/* Home */}
            <Link 
                href="/"
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive('/') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <Home size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('mobile.home', 'Home')}</span>
            </Link>

            {/* Cart */}
            <Link 
                href="/cart"
                className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${isActive('/cart') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <div className="relative">
                    <ShoppingCart size={22} />
                    {(cart_count || 0) > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-primary-600 text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold shadow-sm">
                            {cart_count > 99 ? '99+' : cart_count}
                        </span>
                    )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{t('nav.cart', 'Cart')}</span>
            </Link>

            {/* Orders */}
            <Link 
                href="/buyer/orders"
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive('/buyer/orders') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <Package size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('nav.my_orders', 'Orders')}</span>
            </Link>

            {/* Account */}
            <Link 
                href={props.auth?.user ? (props.auth.user.role === 'buyer' ? '/buyer/profile' : (props.auth.user.role === 'seller' ? '/seller/dashboard' : '/admin/dashboard')) : '/login'}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive('/buyer/profile') || isActive('/login') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <User size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('nav.account', 'Account')}</span>
            </Link>
        </div>
    );
}
