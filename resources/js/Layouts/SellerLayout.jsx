import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Layout/Navbar';
import Footer from '@/Components/Layout/Footer';
import {
    LayoutDashboard, Package, ShoppingCart, MessageCircle,
    Star, Bell, User, LogOut, ChevronRight
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard',      href: '/seller/dashboard',      icon: LayoutDashboard },
    { label: 'My Products',    href: '/seller/products',       icon: Package },
    { label: 'Orders',         href: '/seller/orders',         icon: ShoppingCart },
    { label: 'Messages',       href: '/seller/messages',       icon: MessageCircle },
    { label: 'Sponsored',      href: '/seller/sponsored',      icon: Star },
    { label: 'Subscriptions',  href: '/seller/subscriptions',  icon: LayoutDashboard }, // using existing icons
    { label: 'Reports',        href: '/seller/reports',        icon: Package },
    { label: 'Support',        href: '/seller/support',        icon: MessageCircle },
    { label: 'Profile',        href: '/seller/profile',        icon: User },
];

export default function SellerLayout({ children, title }) {
    const { url, auth } = usePage().props;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <div className="flex-1 pt-16">
                <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">

                    {/* Sidebar */}
                    <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-4">
                            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-2xl mb-3">
                                {auth.user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <p className="font-semibold text-gray-900 truncate">Seller Portal</p>
                            <p className="text-sm text-gray-500 truncate">{auth.user?.email}</p>
                        </div>

                        <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            {navItems.map(({ label, href, icon: Icon }) => {
                                const isActive = url.startsWith(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                                            isActive
                                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon size={18} className="shrink-0" />
                                        <span className="flex-1">{label}</span>
                                        {isActive && <ChevronRight size={14} className="text-amber-500" />}
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
