import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Layout/Navbar';
import Footer from '@/Components/Layout/Footer';
import {
    LayoutDashboard, Package, Heart, MessageCircle,
    Star, Bell, User, LogOut, ChevronRight
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard',      href: '/buyer/dashboard',      icon: LayoutDashboard },
    { label: 'My Orders',      href: '/buyer/orders',         icon: Package },
    { label: 'Wishlist',       href: '/buyer/wishlist',       icon: Heart },
    { label: 'Messages',       href: '/buyer/messages',       icon: MessageCircle },
    { label: 'My Reviews',     href: '/buyer/reviews',        icon: Star },
    { label: 'Support Tickets',href: '/buyer/support',        icon: MessageCircle }, // Reused icon or I can add Ticket
    { label: 'Notifications',  href: '/buyer/notifications',  icon: Bell },
    { label: 'Profile',        href: '/buyer/profile',        icon: User },
];

export default function BuyerLayout({ children, title }) {
    const { url, auth, unread_notifications } = usePage().props;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <div className="flex-1 pt-16">
                <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">

                    {/* Sidebar */}
                    <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-4">
                            <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-2xl mb-3">
                                {auth.user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <p className="font-semibold text-gray-900 truncate">{auth.user?.name}</p>
                            <p className="text-sm text-gray-500 truncate">{auth.user?.email}</p>
                        </div>

                        <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            {navItems.map(({ label, href, icon: Icon }) => {
                                const isActive = url.startsWith(href);
                                const badge = label === 'Notifications' ? unread_notifications : 0;
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                                            isActive
                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon size={18} className="shrink-0" />
                                        <span className="flex-1">{label}</span>
                                        {badge > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                                {badge > 9 ? '9+' : badge}
                                            </span>
                                        )}
                                        {isActive && <ChevronRight size={14} className="text-primary-500" />}
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
