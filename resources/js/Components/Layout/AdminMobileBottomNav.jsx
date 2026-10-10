import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, LayoutDashboard, Users, Store, Package, Settings, BarChart2 } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function AdminMobileBottomNav({ onMenuClick }) {
    const { url } = usePage();
    const { t } = useTranslation();

    const isActive = (path) => {
        if (path === '/admin/dashboard' && url === '/admin/dashboard') return true;
        if (path !== '/admin/dashboard' && url.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: t('nav.dashboard', 'Dashboard'), key: 'dashboard' },
        { href: "/admin/users", icon: Users, label: t('nav.users', 'Utilisateurs'), key: 'users' },
        { href: "/admin/sellers", icon: Store, label: t('nav.sellers', 'Vendeurs'), key: 'sellers' },
        { href: "/admin/products", icon: Package, label: t('nav.products', 'Produits'), key: 'products' },
        { href: "/admin/reports", icon: BarChart2, label: t('nav.reports', 'Rapports'), key: 'reports' },
        { href: "/admin/settings", icon: Settings, label: t('nav.settings', 'Paramètres'), key: 'settings' }
    ];

    return (
        <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-between items-stretch px-0.5 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.08)] overflow-x-auto no-scrollbar"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', minHeight: '60px' }}
        >
            {/* Bouton Menu (pas un lien) */}
            <button
                onClick={onMenuClick}
                className="relative flex flex-col items-center justify-center flex-none w-[65px] py-1 min-h-[44px] text-gray-500 hover:text-gray-700 transition-colors"
            >
                <span className="flex items-center justify-center w-9 h-8 rounded-lg">
                    <Menu size={22} strokeWidth={2} />
                </span>
                <span className="text-[10px] mt-1 font-medium tracking-tight whitespace-nowrap text-gray-500">
                    {t('nav.menu', 'Menu')}
                </span>
            </button>

            {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className={`relative flex flex-col items-center justify-center flex-none w-[65px] py-1 min-h-[44px] transition-colors ${
                            active ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {/* Barre indicatrice en haut */}
                        <span
                            className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                                active ? 'w-8 bg-primary-500' : 'w-0 bg-transparent'
                            }`}
                        />
                        {/* Icône avec fond actif */}
                        <span className={`flex items-center justify-center w-9 h-8 rounded-lg transition-all duration-200 ${
                            active ? 'bg-primary-50 text-primary-600' : 'text-gray-500'
                        }`}>
                            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                        </span>
                        <span className={`text-[10px] mt-1 font-medium tracking-tight whitespace-nowrap w-full text-center px-0.5 ${
                            active ? 'text-primary-600 font-semibold' : 'text-gray-500'
                        }`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
