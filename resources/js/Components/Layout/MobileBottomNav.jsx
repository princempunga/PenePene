import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { Menu, Home, ShoppingCart, Package, User } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function MobileBottomNav({ onMenuClick }) {
    const { url, props } = usePage();
    const { cart_count } = props;
    const { t } = useTranslation();
    const prefersReduced = useReducedMotion();

    const isActive = (path) => {
        if (path === '/' && url === '/') return true;
        if (path !== '/' && url.startsWith(path)) return true;
        return false;
    };

    const accountHref = props.auth?.user
        ? (props.auth.user.role === 'buyer' ? '/buyer/profile'
         : props.auth.user.role === 'seller' ? '/seller/dashboard'
         : '/admin/dashboard')
        : '/login';

    const accountActive = isActive('/buyer/profile') || isActive('/login')
        || isActive('/seller/dashboard') || isActive('/admin/dashboard');

    const activeIndex = isActive('/') ? 1
        : isActive('/cart') ? 2
        : isActive('/buyer/orders') ? 3
        : accountActive ? 4
        : -1;

    const items = [
        { label: t('mobile.menu', 'Menu'), icon: Menu, isButton: true, key: 'menu' },
        { label: t('mobile.home', 'Home'), href: '/', icon: Home, key: 'home' },
        { label: t('nav.cart', 'Cart'), href: '/cart', icon: ShoppingCart, key: 'cart', badge: (cart_count || 0) > 0, badgeCount: cart_count },
        { label: t('nav.my_orders', 'Orders'), href: '/buyer/orders', icon: Package, key: 'orders' },
        { label: t('nav.account', 'Account'), href: accountHref, icon: User, key: 'account' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-between items-center px-1 h-[60px] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {!prefersReduced && activeIndex >= 0 && (
                <motion.div
                    className="absolute bottom-0 left-0 h-[3px] bg-primary-600 rounded-t-full"
                    layout
                    transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.5 }}
                    style={{
                        width: `${100 / items.length}%`,
                        x: `${activeIndex * 100}%`,
                        willChange: 'transform',
                    }}
                />
            )}

            {items.map((item, index) => {
                const active = index === activeIndex;
                if (item.isButton) {
                    return (
                        <button
                            key={item.key}
                            onClick={onMenuClick}
                            className={`flex flex-col items-center justify-center flex-1 py-1 text-gray-500 hover:text-primary-600 transition-colors ${active ? 'text-primary-600' : ''}`}
                        >
                            <Menu size={22} />
                            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                        </button>
                    );
                }
                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                            active
                                ? 'text-primary-600'
                                : 'text-gray-500 hover:text-primary-600'
                        }`}
                    >
                        {item.key === 'cart' ? (
                            <div className="relative">
                                <ShoppingCart size={22} />
                                {item.badge && (
                                    <span className="absolute -top-1.5 -right-2 bg-primary-600 text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold shadow-sm">
                                        {item.badgeCount > 99 ? '99+' : item.badgeCount}
                                    </span>
                                )}
                            </div>
                        ) : (
                            React.createElement(item.icon, { size: 22 })
                        )}
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
