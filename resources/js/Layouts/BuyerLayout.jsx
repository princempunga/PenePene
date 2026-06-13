import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Layout/Navbar';
import Footer from '@/Components/Layout/Footer';
import {
    Package, Heart, MessageCircle, Star, Bell, User, LogOut,
    ChevronRight, Ticket, ShieldCheck, ShoppingBag,
} from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

const navItems = [
    { key: 'buyer.my_orders', href: '/buyer/orders', icon: Package },
    { key: 'buyer.wishlist', href: '/buyer/wishlist', icon: Heart },
    { key: 'buyer.messages', href: '/buyer/messages', icon: MessageCircle },
    { key: 'buyer.my_reviews', href: '/buyer/reviews', icon: Star },
    { key: 'buyer.support_tickets', href: '/buyer/support', icon: Ticket },
    { key: 'buyer.notifications', href: '/buyer/notifications', icon: Bell },
    { key: 'buyer.profile', href: '/buyer/profile', icon: User },
];

function formatJoinedDate(date, locale) {
    if (!date) return null;
    return new Date(date).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export default function BuyerLayout({ children, title, subtitle }) {
    const { url, props } = usePage();
    const { auth, unread_notifications, locale } = props;
    const { t } = useTranslation();
    const user = auth?.user;
    const currentUrl = url || '';

    const isActive = (href) => {
        if (href === '/buyer/messages') {
            return currentUrl.startsWith('/buyer/messages') || currentUrl.startsWith('/chat/conversations');
        }
        return currentUrl.startsWith(href);
    };

    const initials = user?.name
        ?.split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'B';

    const joinedLabel = formatJoinedDate(user?.created_at, locale);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
            <Navbar />

            <div className="flex-1 pt-20 lg:pt-[148px]">
                <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
                        <div className="flex items-start gap-3">
                            <div className="hidden sm:flex w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-1">
                                    {t('buyer.my_account')}
                                </p>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {title || t('buyer.buyer_account')}
                                </h1>
                                {subtitle && (
                                    <p className="text-sm sm:text-base text-gray-500 mt-1 max-w-2xl">{subtitle}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:hidden border-b border-gray-200 bg-white sticky top-20 z-30">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex gap-2 overflow-x-auto py-3 hide-scrollbar">
                            {navItems.map(({ key, href, icon: Icon }) => {
                                const active = isActive(href);
                                const label = t(key);
                                const badge = key === 'buyer.notifications' ? unread_notifications : 0;
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                            active
                                                ? 'bg-primary-600 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Icon size={16} />
                                        <span>{label.split(' ').pop()}</span>
                                        {badge > 0 && (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                                                {badge > 9 ? '9+' : badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">

                        <aside className="hidden md:block w-72 shrink-0 sticky top-24 lg:top-[156px] self-start max-h-[calc(100vh-7rem)] lg:max-h-[calc(100vh-10.5rem)] overflow-y-auto">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                                <div className="h-16 bg-gradient-to-r from-primary-600 via-primary-500 to-amber-500" />
                                <div className="px-5 pb-5 -mt-10">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-2xl font-bold shadow-lg ring-4 ring-white mb-4 overflow-hidden">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                    <p className="font-bold text-gray-900 text-lg leading-tight truncate">{user?.name}</p>
                                    <p className="text-sm text-gray-500 truncate mt-0.5">{user?.email}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                            <ShieldCheck size={12} />
                                            {t('buyer.active_buyer')}
                                        </span>
                                        {joinedLabel && (
                                            <span className="text-xs text-gray-400">{t('buyer.joined')} {joinedLabel}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <nav className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                {navItems.map(({ key, href, icon: Icon }) => {
                                    const active = isActive(href);
                                    const badge = key === 'buyer.notifications' ? unread_notifications : 0;
                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all border-l-[3px] ${
                                                active
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <Icon size={18} className={`shrink-0 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                                            <span className="flex-1">{t(key)}</span>
                                            {badge > 0 && (
                                                <span className="bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
                                                    {badge > 9 ? '9+' : badge}
                                                </span>
                                            )}
                                            {active && <ChevronRight size={14} className="text-primary-500" />}
                                        </Link>
                                    );
                                })}

                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 border-l-[3px] border-transparent transition-colors border-t border-gray-100"
                                >
                                    <LogOut size={18} className="shrink-0" />
                                    {t('buyer.sign_out')}
                                </Link>
                            </nav>
                        </aside>

                        <main className="flex-1 min-w-0 w-full">
                            {children}
                        </main>
                    </div>
                </div>
            </div>

            <Footer />

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
