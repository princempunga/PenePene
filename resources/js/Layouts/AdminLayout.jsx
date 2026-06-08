import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Users, UserCheck, Shield,
    ListTree, LogOut, ChevronRight, Package, ShoppingCart,
    Megaphone, Ticket, FileDown, Settings, Star, Menu, X
} from 'lucide-react';

export default function AdminLayout({ children, title }) {
    // ✅ FIX: usePage().url is the correct way to get the current URL in Inertia
    //         DO NOT destructure url from props — it lives on the page object itself.
    const page = usePage();
    const currentPath = page.url ?? '';          // e.g. "/admin/dashboard"
    const { auth } = page.props;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { label: 'Dashboard',          href: '/admin/dashboard',        icon: LayoutDashboard, roles: ['super_admin', 'admin'] },
        { label: 'Products',           href: '/admin/products',         icon: Package,         roles: ['super_admin', 'admin'] },
        { label: 'Orders',             href: '/admin/orders',           icon: ShoppingCart,    roles: ['super_admin', 'admin'] },
        { label: 'Sellers',            href: '/admin/sellers',          icon: UserCheck,       roles: ['super_admin', 'admin'] },
        { label: 'Categories',         href: '/admin/categories',       icon: ListTree,        roles: ['super_admin', 'admin'] },
        { label: 'Reviews',            href: '/admin/reviews',          icon: Star,            roles: ['super_admin', 'admin'] },
        { label: 'Sponsored Ads',      href: '/admin/advertisements',   icon: Megaphone,       roles: ['super_admin', 'admin'] },
        { label: 'Support Desk',       href: '/admin/support',          icon: Ticket,          roles: ['super_admin', 'admin'] },
        { label: 'Reports',            href: '/admin/reports',          icon: FileDown,        roles: ['super_admin', 'admin'] },
        { label: 'Sub-Admins',         href: '/admin/admins',           icon: Users,           roles: ['super_admin'] },
        { label: 'Subscription Plans', href: '/admin/plans',            icon: Shield,          roles: ['super_admin'] },
        { label: 'Settings',           href: '/admin/settings',         icon: Settings,        roles: ['super_admin'] },
    ];

    const userRole = auth?.user?.role ?? '';
    const allowedNavItems = navItems.filter(item => item.roles.includes(userRole));

    const SidebarContent = () => (
        <>
            {/* Admin Profile Card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-sm mb-4 text-white">
                <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center font-bold text-2xl mb-3 text-white">
                    {auth?.user?.name?.[0]?.toUpperCase() ?? 'A'}
                </div>
                <p className="font-bold text-white truncate">{auth?.user?.name ?? 'Admin'}</p>
                <p className="text-sm text-slate-400 truncate capitalize">
                    {(auth?.user?.role ?? 'admin').replace('_', ' ')}
                </p>
            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {allowedNavItems.map(({ label, href, icon: Icon }) => {
                    // ✅ Safe isActive: only call startsWith if both currentPath and href are strings
                    const isActive = typeof currentPath === 'string' && typeof href === 'string'
                        ? currentPath.startsWith(href)
                        : false;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                                isActive
                                    ? 'border-slate-800 bg-slate-50 text-slate-800'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <Icon size={18} className="shrink-0" />
                            <span className="flex-1">{label}</span>
                            {isActive && <ChevronRight size={14} className="text-slate-800" />}
                        </Link>
                    );
                })}

                {/* Logout */}
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 border-l-2 border-transparent transition-colors"
                >
                    <LogOut size={18} className="shrink-0" />
                    Sign Out
                </Link>
            </nav>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Admin Top Bar ── */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900 shadow-lg flex items-center px-4 gap-4">
                {/* Mobile menu toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                {/* Logo */}
                <Link href="/admin/dashboard" className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    PenePene<span className="text-xs font-semibold bg-primary-600 text-white px-2 py-0.5 rounded-md ml-1">Admin</span>
                </Link>

                <div className="flex-1" />

                {/* Right side */}
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <Link href="/" className="hover:text-white transition-colors hidden sm:block">
                        ← View Site
                    </Link>
                    <div className="w-px h-6 bg-slate-700"></div>
                    <span className="hidden sm:block font-medium">{auth?.user?.name}</span>
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-bold text-white text-sm">
                        {auth?.user?.name?.[0]?.toUpperCase() ?? 'A'}
                    </div>
                </div>
            </header>

            {/* ── Mobile Sidebar Overlay ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Layout Body ── */}
            <div className="flex pt-16 min-h-screen">

                {/* ── Sidebar (desktop: always visible, mobile: slide-in) ── */}
                <aside className={`
                    fixed top-16 left-0 bottom-0 z-40 w-64 overflow-y-auto p-4 bg-gray-50 border-r border-gray-200
                    transform transition-transform duration-300 ease-in-out
                    md:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <SidebarContent />
                </aside>

                {/* ── Main Content Area ── */}
                <main className="flex-1 md:ml-64 p-6 min-w-0">
                    {title && (
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                            {title}
                        </h1>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
