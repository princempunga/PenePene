import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Home, Package, ShoppingCart, Bell, User } from 'lucide-react';
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
        { key: 'Accueil', href: '/seller/dashboard', icon: Home, badge: null },
        { key: 'Produits', href: '/seller/products', icon: Package, badge: null },
        { key: 'Commandes', href: '/seller/orders', icon: ShoppingCart, badge: null },
        { key: 'Notifications', href: '/seller/notifications', icon: Bell, badge: 'notifications' },
        { key: 'Profil', href: '/seller/profile', icon: User, badge: null },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center px-1 h-[60px] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const count = item.badge === 'notifications' ? notificationsCount : 0;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                            active ? 'text-primary-600 font-semibold' : 'text-gray-500 hover:text-primary-600'
                        }`}
                    >
                        <div className={`relative flex items-center justify-center ${
                            active ? 'w-8 h-8 rounded-lg bg-primary-50 text-primary-600' : ''
                        }`}>
                            <Icon size={20} />
                            {count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] min-w-[15px] h-[15px] flex items-center justify-center rounded-full font-bold shadow-sm px-0.5">
                                    {count > 9 ? '9+' : count}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] mt-0.5 font-medium truncate">{item.key}</span>
                    </Link>
                );
            })}
        </div>
    );
}
