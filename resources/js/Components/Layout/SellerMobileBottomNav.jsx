import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, Store, Menu } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function SellerMobileBottomNav({ onMenuClick }) {
    const { url, props } = usePage();
    const { unread_notifications } = props;
    const { t } = useTranslation();

    const notificationsCount = typeof unread_notifications === 'number' ? unread_notifications : 0;

    const isActive = (path) => {
        if (path === '/seller/dashboard' && url === '/seller/dashboard') return true;
        if (path !== '/seller/dashboard' && url.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        { label: t('nav.dashboard', 'Dashboard'), href: '/seller/dashboard', icon: LayoutDashboard, badge: null, key: 'dashboard' },
        { label: t('nav.products', 'Produits'), href: '/seller/products', icon: Package, badge: null, key: 'products' },
        { label: t('nav.orders', 'Commandes'), href: '/seller/orders', icon: ShoppingCart, badge: null, key: 'orders' },
        { label: t('nav.messages', 'Messages'), href: '/seller/notifications', icon: MessageSquare, badge: 'notifications', key: 'notifications' },
        { label: t('nav.store', 'Boutique'), href: '/seller/profile', icon: Store, badge: null, key: 'profile' },
    ];

return (
        <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-evenly items-stretch px-1 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.08)] overflow-x-auto no-scrollbar"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', minHeight: '60px' }}
        >
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const count = item.badge === 'notifications' ? notificationsCount : 0;

                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className={`relative flex flex-col items-center justify-center flex-1 py-1 min-w-[44px] min-h-[44px] transition-colors hover:text-gray-700 ${
                            active ? 'text-primary-600' : 'text-gray-500'
                        }`}
                    >
                        {/* Barre indicatrice en haut */}
                        <span className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                            active ? 'w-8 bg-primary-500' : 'w-0 bg-transparent'
                        }`} />

                        {/* Icône avec fond actif */}
                        <span className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                            active ? 'bg-primary-50 text-primary-600' : 'text-gray-500'
                        }`}>
                            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                            {count > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold shadow-sm px-1 z-10">
                                    {count > 99 ? '99+' : count}
                                </span>
                            )}
                        </span>

                        {/* Label */}
                        <span className={`text-[10px] mt-1 font-medium tracking-tight whitespace-nowrap w-full text-center px-0.5 ${
                            active ? 'text-primary-600 font-semibold' : 'text-gray-500'
                        }`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}

            {/* Menu sidebar button */}
            <button
                type="button"
                onClick={onMenuClick}
                className="relative flex flex-col items-center justify-center flex-1 py-1 min-w-[44px] min-h-[44px] text-gray-500 hover:text-gray-700 transition-colors"
            >
                <span className="relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200">
                    <Menu size={24} strokeWidth={2} />
                </span>
                <span className="text-[10px] mt-1 font-medium tracking-tight whitespace-nowrap w-full text-center px-0.5 text-gray-500">
                    {t('nav.menu', 'Menu')}
                </span>
            </button>
        </div>
    );
}
