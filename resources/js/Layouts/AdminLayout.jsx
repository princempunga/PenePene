import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Users, UserCheck, Shield,
    ListTree, LogOut, ChevronRight, Package, ShoppingCart,
    Megaphone, Ticket, FileDown, Settings, Star, Menu, X, Bell, Gem, BarChart3
} from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import PageTransition from '@/Components/UI/PageTransition';
import AdminMobileBottomNav from '@/Components/Layout/AdminMobileBottomNav';

const ALL_NAV_ITEMS = [
    { key: 'layouts.admin.dashboard',           href: '/admin/dashboard',       icon: LayoutDashboard, roles: ['super_admin', 'admin'] },
    { key: 'Statistiques',                      href: '/admin/statistics',      icon: BarChart3,       roles: ['super_admin', 'admin'] },
    { key: 'layouts.admin.products',            href: '/admin/products',        icon: Package,         roles: ['super_admin', 'admin'] },
    { key: 'layouts.admin.orders',              href: '/admin/orders',          icon: ShoppingCart,    roles: ['super_admin', 'admin'] },
    { key: 'layouts.admin.sellers',             href: '/admin/sellers',         icon: UserCheck,       roles: ['super_admin', 'admin'] },
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
                • Tablette : colonne statique md:w-60 (réduite)
                • PC       : colonne statique lg:w-80 (plus large)
               ══════════════════════════════════════════════ */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[60] flex flex-col
                    w-[280px] bg-white border-r border-gray-200 shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:translate-x-0 md:shadow-sm md:z-auto
                    md:w-60 md:bg-gray-50
                    lg:w-80
                `}
            >
                {/* ── En-tête drawer (mobile) ── */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white md:hidden">
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
                <div className="hidden md:block p-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center font-bold text-xl text-white shrink-0 shadow-md">
                                {adminInitial}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{auth?.user?.name ?? 'Admin'}</p>
                                <p className="text-xs text-gray-500 truncate">{auth?.user?.email}</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700">
                            <Gem size={11} />
                            {roleLabel}
                        </span>
                    </div>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 overflow-y-auto py-2 scrollbar-none md:pb-4">
                    <div className="md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:mx-4 md:overflow-hidden md:h-full md:flex md:flex-col">
                        {allowedNavItems.map(({ key, href, icon: Icon }) => {
                            const isActive = typeof currentPath === 'string' && typeof href === 'string'
                                ? currentPath.startsWith(href)
                                : false;

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={closeSidebar}
                                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors border-l-2 ${
                                        isActive
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon size={18} className="shrink-0" />
                                    <span className="flex-1">{t(key)}</span>
                                    {isActive && <ChevronRight size={14} className="text-primary-500 shrink-0" />}
                                </Link>
                            );
                        })}

                        {/* Déconnexion dans le nav card */}
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            onClick={closeSidebar}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 border-t border-gray-100 transition-colors mt-auto"
                        >
                            <LogOut size={18} className="shrink-0" />
                            {t('layouts.admin.sign_out')}
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* ── Zone principale ── */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

                {/* ── Admin Top Bar ── */}
                <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 gap-4 shrink-0">
                    {/* Hamburger — mobile uniquement */}
                    <button
                        type="button"
                        onClick={openSidebar}
                        className="block md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Logo */}
                    <Link href="/admin/dashboard" className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        PenePene
                        <span className="text-xs font-semibold bg-primary-600 text-white px-2 py-0.5 rounded-md">
                            {t('layouts.admin.admin_badge')}
                        </span>
                    </Link>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/" className="hidden sm:block text-sm text-gray-500 hover:text-primary-600 transition-colors">
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
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg p-1"
                        >
                            <span className="hidden sm:block font-medium truncate max-w-[120px]">{auth?.user?.name}</span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white text-sm shrink-0">
                                {adminInitial}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* ── Main Content ── */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-6 min-w-0">
                    {title && (
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">
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
    );
}
