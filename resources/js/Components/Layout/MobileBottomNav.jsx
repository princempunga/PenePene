import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Home, ShoppingCart, Package, Heart, User } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function MobileBottomNav({ onMenuClick }) {
    const { url, props } = usePage();
    const { cart_count: sharedCartCount } = props;
    const { t } = useTranslation();
    const [cartCount, setCartCount] = useState(sharedCartCount || 0);

    useEffect(() => { setCartCount(sharedCartCount || 0); }, [sharedCartCount]);

    useEffect(() => {
        const handler = () => setCartCount((prev) => prev + 1);
        window.addEventListener('cart-updated', handler);
        return () => window.removeEventListener('cart-updated', handler);
    }, []);

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

const items = [
        { label: t('nav.home', 'Accueil'), href: '/', icon: Home, key: 'home' },
        { label: t('nav.categories', 'Catégories'), icon: LayoutGrid, isButton: true, key: 'menu' },
        { label: t('nav.cart', 'Panier'), href: '/cart', icon: ShoppingCart, key: 'cart', badge: (cartCount || 0) > 0, badgeCount: cartCount },
        { label: t('nav.orders', 'Commandes'), href: '/buyer/orders', icon: Package, key: 'orders' },
        { label: t('nav.favorites', 'Favoris'), href: '/favorites', icon: Heart, key: 'favorites' },
        { label: t('nav.account', 'Profil'), href: accountHref, icon: User, key: 'account' },
    ];

    return (
        <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-evenly items-stretch px-1 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.08)] overflow-x-auto no-scrollbar"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', minHeight: '60px' }}
        >
            {items.map((item) => {
                const active = item.isButton ? false : isActive(item.href);
                const Icon = item.icon;

                const content = (
                    <>
                        {/* Barre indicatrice en haut */}
                        <span className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                            active ? 'w-8 bg-primary-500' : 'w-0 bg-transparent'
                        }`} />

                        {/* Icône avec fond actif */}
                        <span className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                            active ? 'bg-primary-50 text-primary-600' : 'text-gray-500'
                        }`}>
                            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                            {item.badge && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold shadow-sm px-1 z-10">
                                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                                </span>
                            )}
                        </span>

                        {/* Label */}
                        <span className={`text-[10px] mt-1 font-medium tracking-tight whitespace-nowrap w-full text-center px-0.5 ${
                            active ? 'text-primary-600 font-semibold' : 'text-gray-500'
                        }`}>
                            {item.label}
                        </span>
                    </>
                );

                if (item.isButton) {
                    return (
                        <button
                            key={item.key}
                            onClick={onMenuClick}
                            className={`relative flex flex-col items-center justify-center flex-1 py-1 min-w-[44px] min-h-[44px] transition-colors hover:text-gray-700 ${
                                active ? 'text-primary-600' : 'text-gray-500'
                            }`}
                        >
                            {content}
                        </button>
                    );
                }

                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className={`relative flex flex-col items-center justify-center flex-1 py-1 min-w-[44px] min-h-[44px] transition-colors hover:text-gray-700 ${
                            active ? 'text-primary-600' : 'text-gray-500'
                        }`}
                    >
                        {content}
                    </Link>
                );
            })}
        </div>
    );
}
