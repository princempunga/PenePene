import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, LayoutDashboard, Package, ShoppingCart, MessageCircle } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function SellerMobileBottomNav({ onMenuClick }) {
    const { url, props } = usePage();
    const { unread_messages } = props;
    const { t } = useTranslation();

    const messagesCount = typeof unread_messages === 'number' ? unread_messages : 0;

    const isActive = (path) => {
        if (path === '/seller/dashboard' && url === '/seller/dashboard') return true;
        if (path !== '/seller/dashboard' && url.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-between items-center px-1 h-[60px] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button 
                onClick={onMenuClick}
                className="flex flex-col items-center justify-center flex-1 py-1 text-gray-500 hover:text-primary-600 transition-colors"
            >
                <Menu size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('mobile.menu', 'Menu')}</span>
            </button>

            <Link 
                href="/seller/dashboard"
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive('/seller/dashboard') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <LayoutDashboard size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('layouts.seller.dashboard', 'Dashboard')}</span>
            </Link>

            <Link 
                href="/seller/products"
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive('/seller/products') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <Package size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('layouts.seller.products', 'Products')}</span>
            </Link>

            <Link 
                href="/seller/orders"
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive('/seller/orders') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <ShoppingCart size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('layouts.seller.orders', 'Orders')}</span>
            </Link>

            <Link 
                href="/seller/messages"
                className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${isActive('/seller/messages') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <div className="relative">
                    <MessageCircle size={22} />
                    {messagesCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold shadow-sm">
                            {messagesCount > 9 ? '9+' : messagesCount}
                        </span>
                    )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{t('layouts.seller.messages', 'Messages')}</span>
            </Link>
        </div>
    );
}
