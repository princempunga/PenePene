import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Layout/Navbar';
import Footer from '@/Components/Layout/Footer';
import {
    LayoutDashboard, Users, UserCheck, Shield,
    ListTree, LogOut, ChevronRight, Package, ShoppingCart, MessageSquare, Megaphone, Ticket, FileDown, Settings, Star
} from 'lucide-react';

export default function AdminLayout({ children, title }) {
    const { url, auth } = usePage().props;

    const navItems = [
        { label: 'Dashboard',        href: '/admin/dashboard',        icon: LayoutDashboard, roles: ['super_admin', 'admin'] },
        { label: 'Products',         href: '/admin/products',         icon: Package,         roles: ['super_admin', 'admin'] },
        { label: 'Orders',           href: '/admin/orders',           icon: ShoppingCart,    roles: ['super_admin', 'admin'] },
        { label: 'Sellers',          href: '/admin/sellers',          icon: UserCheck,       roles: ['super_admin', 'admin'] },
        { label: 'Categories',       href: '/admin/categories',       icon: ListTree,        roles: ['super_admin', 'admin'] },
        { label: 'Reviews',          href: '/admin/reviews',          icon: MessageSquare,   roles: ['super_admin', 'admin'] },
        { label: 'Sponsored Ads',    href: '/admin/advertisements',   icon: Megaphone,       roles: ['super_admin', 'admin'] },
        { label: 'Support Desk',     href: '/admin/support',          icon: Ticket,          roles: ['super_admin', 'admin'] },
        { label: 'Reports',          href: '/admin/reports',          icon: FileDown,        roles: ['super_admin', 'admin'] },
        { label: 'Sub-Admins',       href: '/admin/admins',           icon: Users,           roles: ['super_admin'] },
        { label: 'Subscription Plans',href: '/admin/plans',           icon: Shield,          roles: ['super_admin'] },
        { label: 'Settings',         href: '/admin/settings',         icon: Settings,        roles: ['super_admin'] },
    ];

    const allowedNavItems = navItems.filter(item => item.roles.includes(auth.user.role));

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <div className="flex-1 pt-16">
                <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">

                    {/* Sidebar */}
                    <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2">
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-sm mb-4 text-white">
                            <div className="w-14 h-14 bg-slate-700 rounded-full flex items-center justify-center font-bold text-2xl mb-3 text-slate-200">
                                {auth.user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <p className="font-semibold truncate">Admin Portal</p>
                            <p className="text-sm text-slate-400 truncate capitalize">{auth.user?.role.replace('_', ' ')}</p>
                        </div>

                        <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            {allowedNavItems.map(({ label, href, icon: Icon }) => {
                                const isActive = url.startsWith(href);
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
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {title && (
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
                        )}
                        {children}
                    </main>

                </div>
            </div>

            <Footer />
        </div>
    );
}
