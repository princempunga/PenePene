import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Users, UserCheck, Shield,
    ListTree, LogOut, ChevronRight, Package, ShoppingCart,
    Megaphone, Ticket, FileDown, Settings, Star, Menu, X, Bell, Gem, BarChart3, TrendingUp
} from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import PageTransition from '@/Components/UI/PageTransition';
import AdminMobileBottomNav from '@/Components/Layout/AdminMobileBottomNav';
import { CurrencyProvider } from '@/context/CurrencyContext';
import CurrencySwitcher from '@/Components/Layout/CurrencySwitcher';

const ALL_NAV_ITEMS = [
    { key: 'layouts.admin.dashboard',           href: '/admin/dashboard',       icon: LayoutDashboard, roles: ['super_admin', 'admin'] },
    { key: 'Statistiques',                      href: '/admin/statistics',      icon: BarChart3,       roles: ['super_admin', 'admin'] },
    { key: 'Ventes Globales',                   href: '/admin/sales',           icon: TrendingUp,      roles: ['super_admin', 'admin'] },
    { key: 'layouts.admin.products',            href: '/admin/products',        icon: Package,         roles: ['super_admin', 'admin'] },
    { key: 'layouts.admin.orders',              href: '/admin/orders',          icon: ShoppingCart,    roles: ['super_admin', 'admin'] },
    { key: 'layouts.admin.sellers',             href: '/admin/sellers',         icon: UserCheck,       roles: ['super_admin', 'admin'] },
    { key: 'Acheteurs',                         href: '/admin/buyers',          icon: Users,           roles: ['super_admin', 'admin'] },
    { key: 'layouts.admin.categories',          href: '/admin/categories',      icon: ListTree,        roles: ['super_admin', 'admin'] },
    { key: 'layouts.admin.reviews',             href: '/admin/reviews',         icon: Star,            roles: ['super_admin', 'admin'] },
    { key: 'Homepage Promotions',               href: '/admin/promotions',      icon: Megaphone,       roles: ['super_admin', 'admin'] },
    { key: 'Demandes rapports',                 href: '/admin/stats-requests',  icon: FileDown,        roles: ['super_admin', 'admin'] },
    { key: 'layouts.admin.support_desk',        href: '/admin/support',         icon: Ticket,          roles: ['super_admin', 'admin'] },
    { key: 'Trust & Safety',                    href: '/admin/trust-center',    icon: Shield,          roles: ['super_admin', 'admin'] },
    { key: 'layouts.admin.reports',             href: '/admin/reports',         icon: FileDown,        roles: ['super_admin', 'admin'] },
    { key: 'layouts.admin.sub_admins',          href: '/admin/admins',          icon: Users,           roles: ['super_admin'] },
    { key: 'layouts.admin.subscription_plans',  href: '/admin/plans',           icon: Shield,          roles: ['super_admin'] },
    { key: 'layouts.admin.settings',            href: '/admin/settings',        icon: Settings,        roles: ['super_admin'] },
];

export default function AdminLayout({ children, title }) {
    const { t } = useTranslation();
    const page = usePage();
    const currentPath = page.url ?? '';
    const { auth } = page.props;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const userRole = auth?.user?.role ?? '';
    const allowedNavItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(userRole));

    const closeSidebar = () => setSidebarOpen(false);
    const openSidebar  = () => setSidebarOpen(true);

    const adminInitial = auth?.user?.name?.[0]?.toUpperCase() ?? 'A';
    const roleLabel = (auth?.user?.role ?? 'Admin').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

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
                SIDEBAR ADMIN
                • Mobile   : drawer fixed, glisse depuis la gauche (z-[60])
                • Tablette : colonne statique md:w-56 (réduite)
                • PC       : colonne statique lg:w-72 (plus large)
               ══════════════════════════════════════════════ */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[60] flex flex-col
                    w-[280px] bg-white border-r border-gray-200 shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:translate-x-0 md:shadow-sm md:z-auto md:shrink-0
                    md:w-56 md:bg-gray-50
                    lg:w-72
                `}
            >
                {/* ── En-tête drawer (mobile) ── */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white md:hidden shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center font-bold text-lg text-white shrink-0">
                            {adminInitial}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{auth?.user?.name ?? 'Admin'}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700">
                                <Gem size={9} />
                                {roleLabel}
                            </span>
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

                {/* ── Carte profil desktop ── */}
                <div className="hidden md:block p-3 shrink-0">
                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 lg:w-11 lg:h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center font-bold text-base lg:text-xl text-white shrink-0 shadow-md">
                                {adminInitial}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate text-sm">{auth?.user?.name ?? 'Admin'}</p>
                                <p className="text-xs text-gray-500 truncate hidden lg:block">{auth?.user?.email}</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1 lg:gap-1.5 text-[10px] lg:text-xs font-semibold px-2 py-0.5 lg:py-1 rounded-full bg-primary-100 text-primary-700">
                            <Gem size={9} />
                            {roleLabel}
                        </span>
                    </div>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 overflow-y-auto py-2 scrollbar-none pb-4">
                    <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:mx-3 md:overflow-hidden md:flex md:flex-col md:h-full">
                        {allowedNavItems.map(({ key, href, icon: Icon }) => {
                            const isActive = typeof currentPath === 'string' && typeof href === 'string'
                                ? currentPath.startsWith(href)
                                : false;

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={closeSidebar}
                                    className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors border-l-2 ${
                                        isActive
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon size={16} className="shrink-0" />
                                    <span className="flex-1 text-sm truncate">{t(key)}</span>
                                    {isActive && <ChevronRight size={12} className="text-primary-500 shrink-0" />}
                                </Link>
                            );
                        })}

                        {/* Déconnexion dans le nav card */}
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            onClick={closeSidebar}
                            className="w-full flex items-center gap-2.5 px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 border-t border-gray-100 transition-colors mt-auto"
                        >
                            <LogOut size={16} className="shrink-0" />
                            {t('layouts.admin.sign_out')}
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* ── Zone principale ── */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

                {/* ── Admin Top Bar ── */}
                <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-3 sm:px-4 gap-2 sm:gap-4 shrink-0">
                    {/* Hamburger — mobile uniquement */}
                    <button
                        type="button"
                        onClick={openSidebar}
                        className="block md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Logo */}
                    <Link href="/admin/dashboard" className="text-base sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5 sm:gap-2 shrink-0">
                        PenePene
                        <span className="text-[10px] sm:text-xs font-semibold bg-primary-600 text-white px-1.5 sm:px-2 py-0.5 rounded-md">
                            {t('layouts.admin.admin_badge')}
                        </span>
                    </Link>

                    <div className="flex-1 min-w-0" />

                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                        <CurrencySwitcher />
                        <Link href="/" className="hidden sm:block text-sm text-gray-500 hover:text-primary-600 transition-colors whitespace-nowrap">
                            {t('layouts.admin.view_site')}
                        </Link>
                        <Link
                            href="/admin/support"
                            className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                            <Bell size={20} />
                        </Link>
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-1.5 sm:gap-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg p-1"
                        >
                            <span className="hidden sm:block font-medium truncate max-w-[120px]">{auth?.user?.name}</span>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white text-xs sm:text-sm shrink-0">
                                {adminInitial}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* ── Main Content ── */}
                <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 pb-[76px] md:pb-6 min-w-0">
                    {title && (
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                            {title}
                        </h1>
                    )}
                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>

            <AdminMobileBottomNav onMenuClick={openSidebar} />
        </div>
        </CurrencyProvider>
    );
}
