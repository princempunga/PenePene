import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, LayoutDashboard, UserCheck, Package, ShoppingCart } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function AdminMobileBottomNav({ onMenuClick }) {
    const { url, props } = usePage();
    const { t } = useTranslation();

    const isActive = (path) => {
        if (path === '/admin/dashboard' && url === '/admin/dashboard') return true;
        if (path !== '/admin/dashboard' && url.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-between items-center px-1 h-[60px] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button 
                onClick={onMenuClick}
                className="flex flex-col items-center justify-center flex-1 py-1 text-gray-500 hover:text-primary-600 transition-colors"
            >
                <Menu size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('mobile.menu', 'Menu')}</span>
            </button>

            <Link 
                href="/admin/dashboard"
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive('/admin/dashboard') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <LayoutDashboard size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('layouts.admin.dashboard', 'Dashboard')}</span>
            </Link>

            <Link 
                href="/admin/sellers"
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive('/admin/sellers') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <UserCheck size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('layouts.admin.sellers', 'Sellers')}</span>
            </Link>

            <Link 
                href="/admin/products"
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive('/admin/products') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <Package size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('layouts.admin.products', 'Products')}</span>
            </Link>

            <Link 
                href="/admin/orders"
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive('/admin/orders') ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            >
                <ShoppingCart size={22} />
                <span className="text-[10px] mt-1 font-medium">{t('layouts.admin.orders', 'Orders')}</span>
            </Link>
        </div>
    );
}
