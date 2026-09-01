import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, LayoutDashboard, UserCheck, Package, ShoppingCart } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function AdminMobileBottomNav({ onMenuClick }) {
    const { url } = usePage();
    const { t } = useTranslation();

    const isActive = (path) => {
        if (path === '/admin/dashboard' && url === '/admin/dashboard') return true;
        if (path !== '/admin/dashboard' && url.startsWith(path)) return true;
        return false;
    };

    const NavLink = ({ href, icon: Icon, label }) => {
        const active = isActive(href);
        return (
            <Link
                href={href}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 pt-2 transition-colors ${
                    active ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                {/* Barre indicatrice en haut */}
                <span
                    className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                        active ? 'w-8 bg-primary-500' : 'w-0 bg-transparent'
                    }`}
                />
                {/* Icône avec fond actif */}
                <span className={`flex items-center justify-center w-8 h-7 rounded-lg transition-all duration-200 ${
                    active ? 'bg-primary-50' : ''
                }`}>
                    <Icon size={20} />
                </span>
                <span className={`text-[9px] mt-0.5 font-semibold tracking-wide ${
                    active ? 'text-primary-600' : 'text-gray-400'
                }`}>
                    {label}
                </span>
            </Link>
        );
    };

    return (
        <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-between items-stretch px-1 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.08)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', minHeight: '60px' }}
        >
            {/* Bouton Menu (pas un lien) */}
            <button
                onClick={onMenuClick}
                className="relative flex flex-col items-center justify-center flex-1 py-1 pt-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <span className="flex items-center justify-center w-8 h-7 rounded-lg">
                    <Menu size={20} />
                </span>
                <span className="text-[9px] mt-0.5 font-semibold tracking-wide text-gray-400">
                    {t('mobile.menu', 'Menu')}
                </span>
            </button>

            <NavLink href="/admin/dashboard" icon={LayoutDashboard} label={t('layouts.admin.dashboard', 'Dashboard')} />
            <NavLink href="/admin/sellers"   icon={UserCheck}        label={t('layouts.admin.sellers', 'Sellers')} />
            <NavLink href="/admin/products"  icon={Package}          label={t('layouts.admin.products', 'Products')} />
            <NavLink href="/admin/orders"    icon={ShoppingCart}     label={t('layouts.admin.orders', 'Orders')} />
        </div>
    );
}
