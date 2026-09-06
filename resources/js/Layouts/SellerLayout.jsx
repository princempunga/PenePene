import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Package, ShoppingCart, MessageCircle, Bell,
    User, LogOut, ChevronRight, Store, FileDown, Menu, X,
    Star, FileText, CreditCard, Settings,
} from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import SellerMobileBottomNav from '@/Components/Layout/SellerMobileBottomNav';
import { CurrencyProvider } from '@/context/CurrencyContext';
import CurrencySwitcher from '@/Components/Layout/CurrencySwitcher';

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

// ─── NavLink : horizontal sur mobile drawer, icône+label vertical sur tablette, full sur lg ───
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
                flex items-center gap-3
                px-4 py-3
                text-sm font-medium transition-colors
                border-l-2
                ${isActive
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
                md:flex-col md:gap-1 md:px-1 md:py-2 md:border-l-0 md:rounded-xl md:mx-1 md:justify-center
                lg:flex-row lg:gap-3 lg:px-4 lg:py-2.5 lg:border-l-2 lg:rounded-none lg:mx-0 lg:justify-start
                ${isActive ? 'md:border-transparent lg:border-primary-500' : ''}
            `}
        >
            <div className={`
                relative shrink-0 flex items-center justify-center
                md:w-10 md:h-10 md:rounded-xl lg:w-auto lg:h-auto lg:rounded-none
                transition-colors
                ${isActive
                    ? 'md:bg-primary-600 md:text-white lg:bg-transparent lg:text-primary-700'
                    : 'text-current md:text-gray-500 lg:text-gray-600'
                }
            `}>
                <Icon size={18} />
                {count > 0 && (
                    <span className="hidden md:flex lg:hidden absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold min-w-[14px] h-[14px] items-center justify-center rounded-full">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </div>

            <span className="
                flex-1 text-sm text-left
                md:flex-none md:text-[9px] md:text-center md:leading-tight
                lg:flex-1 lg:text-sm lg:text-left
            ">{t(key)}</span>

            {count > 0 && (
                <span className="hidden lg:flex bg-red-500 text-white text-xs font-bold min-w-5 h-5 px-1 items-center justify-center rounded-full">
                    {count > 9 ? '9+' : count}
                </span>
            )}

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
    const openSidebar  = () => setSidebarOpen(true);

    // ─── Profil affiché dans le drawer mobile & lg sidebar ───
    const profileAvatar = seller?.logo
        ? <img src={`/storage/${seller.logo}`} alt={seller.business_name} className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0" />
        : auth.user?.avatar
            ? <img src={`/storage/${auth.user.avatar}`} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
            : <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                {seller?.business_name?.charAt(0)?.toUpperCase() || auth.user?.name?.charAt(0)?.toUpperCase()}
              </div>;

    return (
        <CurrencyProvider>
        <div className="h-screen overflow-hidden bg-gray-50 flex w-full">

            {/* ── Overlay backdrop (mobile only) ── */}
            <div
                className={`fixed inset-0 z-[55] bg-black/50 md:hidden transition-opacity duration-300 ${
                    sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={closeSidebar}
                aria-hidden="true"
            />

            {/* ══════════════════════════════════════════════
                SIDEBAR
                • Mobile   : drawer fixed, glisse depuis la gauche (z-[60])
                • Tablette : barre icônes w-24
                • Desktop  : barre complète w-72
               ══════════════════════════════════════════════ */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[60] flex flex-col
                    w-[280px] bg-white border-r border-gray-200 shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:translate-x-0 md:shadow-none md:z-auto
                    md:w-24 md:bg-gray-50 md:border-r md:shadow-sm
                    lg:w-72
                `}
            >
                {/* ── En-tête du drawer (mobile uniquement) ── */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 md:hidden">
                    <div className="flex items-center gap-3">
                        {profileAvatar}
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{seller?.business_name || auth.user?.name}</p>
                            {seller?.status && (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                    seller.status === 'verified' ? 'bg-green-100 text-green-700' :
                                    seller.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    <Store size={10} />
                                    {sellerStatusLabels[seller.status] || seller.status}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={closeSidebar}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="Fermer le menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Carte profil tablette (md → lg) ── */}
                <div className="hidden md:flex lg:hidden justify-center py-3 px-2 border-b border-gray-100">
                    {seller?.logo ? (
                        <img src={`/storage/${seller.logo}`} alt={seller.business_name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    ) : auth.user?.avatar ? (
                        <img src={`/storage/${auth.user.avatar}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg">
                            {seller?.business_name?.charAt(0)?.toUpperCase() || auth.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* ── Carte profil desktop (lg+) ── */}
                <div className="hidden lg:block p-4 border-b border-gray-100">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            {profileAvatar}
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
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 overflow-y-auto py-2 scrollbar-none">
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
                </nav>

                {/* ── Déconnexion ── */}
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    onClick={closeSidebar}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 border-t border-gray-100 transition-colors md:justify-center lg:justify-start"
                    title={t('layouts.seller.sign_out')}
                >
                    <LogOut size={18} className="shrink-0" />
                    <span className="md:hidden lg:block">{t('layouts.seller.sign_out')}</span>
                </Link>
            </aside>

            {/* ── Zone principale ── */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

                {/* ── Header ── */}
                <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 gap-2 sm:gap-4 shrink-0">
                    {/* Hamburger — mobile uniquement */}
                    <button
                        type="button"
                        onClick={openSidebar}
                        className="block md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu size={22} />
                    </button>

                    <Link href="/seller/dashboard" className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        PenePene
                        <span className="text-xs font-semibold bg-primary-600 text-white px-2 py-0.5 rounded-md">{t('layouts.seller.seller_badge')}</span>
                    </Link>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2 sm:gap-3">
                        <CurrencySwitcher />
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

                {/* ── Contenu principal ── */}
                <main className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-6 min-w-0">
                    {title && (
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
                    )}
                    {children}
                </main>
            </div>

            {/* ── Bottom nav mobile ── */}
            <SellerMobileBottomNav onMenuClick={openSidebar} />
        </div>
        </CurrencyProvider>
    );
}
