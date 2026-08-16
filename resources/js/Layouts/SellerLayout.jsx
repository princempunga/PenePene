import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Package, ShoppingCart, MessageCircle, Bell,
    User, LogOut, ChevronRight, Store, FileDown, Menu, X,
    Star, FileText, CreditCard, Settings,
} from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import PageTransition from '@/Components/UI/PageTransition';
import SellerMobileBottomNav from '@/Components/Layout/SellerMobileBottomNav';

const navItems = [
    { key: 'layouts.seller.dashboard',      href: '/seller/dashboard',        icon: LayoutDashboard, badge: null },
    { key: 'layouts.seller.products',       href: '/seller/products',         icon: Package,         badge: null },
    { key: 'layouts.seller.orders',         href: '/seller/orders',           icon: ShoppingCart,    badge: null },
    { key: 'layouts.seller.messages',       href: '/seller/messages',         icon: MessageCircle,   badge: 'messages' },
    { key: 'layouts.seller.notifications',  href: '/seller/notifications',    icon: Bell,            badge: 'notifications' },
    { key: 'layouts.seller.reviews',        href: '/seller/reviews',          icon: Star,            badge: null },
    { key: 'layouts.seller.documents',      href: '/seller/documents',        icon: FileText,        badge: null },
    { key: 'layouts.seller.reports',        href: '/seller/reports',          icon: FileDown,        badge: null },
    { key: 'layouts.seller.store_settings', href: '/seller/store/settings',   icon: Settings,        badge: null },
    { key: 'layouts.seller.profile',        href: '/seller/profile',          icon: User,            badge: null },
    { key: 'layouts.seller.subscriptions',  href: '/seller/subscriptions',    icon: CreditCard,      badge: null },
];

const sellerStatusLabels = {
    verified:  'Vérifié',
    pending:   'En attente',
    rejected:  'Rejeté',
    suspended: 'Suspendu',
};

function isNavActive(currentPath, href) {
    if (href === '/seller/dashboard') {
        return currentPath === '/seller/dashboard';
    }
    return currentPath === href || currentPath.startsWith(`${href}/`);
}

function NavLink({ item, currentPath, badges, onNavigate, t }) {
    const { key, href, icon: Icon, badge } = item;
    const isActive = isNavActive(currentPath, href);
    const count = badge === 'messages' ? badges.messages : badge === 'notifications' ? badges.notifications : 0;

    return (
        <Link
            href={href}
            onClick={onNavigate}
            title={t(key)}
            className={`
                flex flex-row md:flex-col lg:flex-row
                items-center
                justify-start md:justify-center lg:justify-start
                gap-3 md:gap-1 lg:gap-3
                px-4 md:px-1 lg:px-4
                py-2.5 md:py-2 lg:py-2.5
                text-sm font-medium transition-colors
                border-l-2 md:border-l-0 md:rounded-xl md:mx-1
                ${isActive
                    ? 'border-primary-500 md:border-transparent bg-primary-50 md:bg-transparent text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
            `}
        >
            {/* Icône — carré bleu plein sur tablette si actif */}
            <div className={`
                relative shrink-0
                flex items-center justify-center
                md:w-10 md:h-10 lg:w-auto lg:h-auto
                md:rounded-xl lg:rounded-none
                transition-colors
                ${isActive
                    ? 'md:bg-primary-600 md:text-white lg:bg-transparent lg:text-primary-700'
                    : 'md:text-gray-500 lg:text-gray-600'
                }
            `}>
                <Icon size={18} />
                {/* Mini badge sur tablette uniquement */}
                {count > 0 && (
                    <span className="hidden md:flex lg:hidden absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold min-w-[14px] h-[14px] items-center justify-center rounded-full">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </div>

            {/* Label — toujours visible, empilé sous l'icône sur tablette */}
            <span className="
                flex-1 md:flex-none lg:flex-1
                text-sm md:text-[9px] lg:text-sm
                text-left md:text-center lg:text-left
                md:leading-tight
            ">{t(key)}</span>

            {/* Badge pill — lg+ uniquement */}
            {count > 0 && (
                <span className="hidden lg:flex bg-red-500 text-white text-xs font-bold min-w-5 h-5 px-1 items-center justify-center rounded-full">
                    {count > 9 ? '9+' : count}
                </span>
            )}

            {/* Chevron — lg+ uniquement */}
            {isActive && <ChevronRight size={14} className="text-primary-500 shrink-0 hidden lg:block" />}
        </Link>
    );
}

export default function SellerLayout({ children, title }) {
    const { t } = useTranslation();
    const page = usePage();
    const currentPath = (page.url ?? '').split('?')[0];
    const { auth, seller, unread_notifications, unread_messages } = page.props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const badges = {
        messages: typeof unread_messages === 'number' ? unread_messages : 0,
        notifications: unread_notifications ?? 0,
    };

    const closeSidebar = () => setSidebarOpen(false);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Carte profil — masquée sur tablette (md), visible sur lg+) */}
            <div className="hidden lg:block bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-4">
                <div className="flex items-center gap-3 mb-3">
                    {seller?.logo ? (
                        <img
                            src={`/storage/${seller.logo}`}
                            alt={seller.business_name}
                            className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0"
                        />
                    ) : auth.user?.avatar ? (
                        <img
                            src={`/storage/${auth.user.avatar}`}
                            alt=""
                            className="w-14 h-14 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-2xl shrink-0">
                            {seller?.business_name?.charAt(0)?.toUpperCase() || auth.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{seller?.business_name || t('layouts.seller.seller_portal')}</p>
                        <p className="text-xs text-gray-500 truncate">{auth.user?.email}</p>
                    </div>
                </div>
                {seller?.status && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        seller.status === 'verified' ? 'bg-green-100 text-green-700' :
                        seller.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                    }`}>
                        <Store size={12} />
                        {sellerStatusLabels[seller.status] || seller.status}
                    </span>
                )}
            </div>

            {/* Avatar réduit visible uniquement sur tablette (md → lg) */}
            <div className="md:flex lg:hidden justify-center py-3 mb-2">
                {seller?.logo ? (
                    <img
                        src={`/storage/${seller.logo}`}
                        alt={seller.business_name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                ) : auth.user?.avatar ? (
                    <img
                        src={`/storage/${auth.user.avatar}`}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {seller?.business_name?.charAt(0)?.toUpperCase() || auth.user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                )}
            </div>

            <nav className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto py-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.href}
                            item={item}
                            currentPath={currentPath}
                            badges={badges}
                            onNavigate={closeSidebar}
                            t={t}
                        />
                    ))}
                </div>

                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    onClick={closeSidebar}
                    className="mt-auto w-full flex items-center md:justify-center lg:justify-start gap-3 md:px-2 lg:px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 border-t border-gray-100 transition-colors"
                    title={t('layouts.seller.sign_out')}
                >
                    <LogOut size={18} className="shrink-0" />
                    <span className="hidden lg:block">{t('layouts.seller.sign_out')}</span>
                </Link>
            </nav>
        </div>
    );

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex w-full">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar — drawer mobile, icône+label tablette, pleine desktop */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-50 w-72 p-4 bg-gray-50 border-r border-gray-200
                flex-shrink-0 overflow-y-auto
                transform transition-transform duration-300 ease-in-out
                md:translate-x-0 md:static md:h-screen md:z-40
                md:w-24 lg:w-72
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                hide-scrollbar
            `}>
                <SidebarContent />
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 gap-2 sm:gap-4">
                    {/* Bouton menu — visible aussi sur tablette (md) pour toggle la sidebar mobile */}
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="block md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={sidebarOpen ? t('layouts.seller.close_menu') : t('layouts.seller.open_menu')}
                    >
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    <Link href="/seller/dashboard" className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 lg:ml-0 ml-1">
                        PenePene
                        <span className="text-xs font-semibold bg-primary-600 text-white px-2 py-0.5 rounded-md">{t('layouts.seller.seller_badge')}</span>
                    </Link>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/" className="hidden sm:block text-sm text-gray-500 hover:text-primary-600 transition-colors">
                            {t('layouts.seller.view_site')}
                        </Link>
                        <Link
                            href="/seller/notifications"
                            className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            aria-label={t('layouts.seller.notifications')}
                        >
                            <Bell size={20} />
                            {badges.notifications > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </Link>
                        <Link
                            href="/seller/profile"
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg p-1"
                        >
                            <span className="hidden sm:block font-medium truncate max-w-[120px]">{auth.user?.name}</span>
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                                {auth.user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0 flex flex-col">
                    {title && (
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
                    )}
                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>

            <SellerMobileBottomNav onMenuClick={() => setSidebarOpen(true)} />
        </div>
    );
}
