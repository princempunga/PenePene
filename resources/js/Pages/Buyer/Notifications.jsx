import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import BuyerAccountEmptyState from '@/Components/Buyer/BuyerAccountEmptyState';
import Pagination from '@/Components/UI/Pagination';
import {
    Bell, CheckCheck, Package, MessageCircle, User, Megaphone,
} from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

const typeConfig = {
    order:     { icon: Package,        colors: 'bg-blue-100 text-blue-600' },
    message:   { icon: MessageCircle,  colors: 'bg-purple-100 text-purple-600' },
    review:    { icon: Bell,           colors: 'bg-amber-100 text-amber-600' },
    system:    { icon: User,           colors: 'bg-gray-100 text-gray-600' },
    promotion: { icon: Megaphone,      colors: 'bg-orange-100 text-orange-600' },
};

function getTypeConfig(type) {
    return typeConfig[type] || typeConfig.system;
}

export default function Notifications({ notifications }) {
    const { t } = useTranslation();
    const [activeFilter, setActiveFilter] = useState('all');
    const { post } = useForm({});

    const FILTERS = [
        { id: 'all', label: t('buyer.filter_all') },
        { id: 'order', label: t('buyer.filter_orders') },
        { id: 'message', label: t('buyer.filter_messages') },
        { id: 'system', label: t('buyer.filter_account') },
        { id: 'promotion', label: t('buyer.filter_promotions') },
    ];

    const relativeTime = (dateString) => {
        const date = new Date(dateString);
        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return t('buyer.just_now');
        if (minutes < 60) return t('buyer.minutes_ago', { count: minutes });
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t('buyer.hours_ago', { count: hours });
        const days = Math.floor(hours / 24);
        if (days < 7) return t('buyer.days_ago', { count: days });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredNotifications = useMemo(() => {
        if (activeFilter === 'all') return notifications.data;
        return notifications.data.filter((n) => n.type === activeFilter);
    }, [notifications.data, activeFilter]);

    const unreadCount = notifications.data.filter((n) => !n.is_read).length;

    const markAllRead = (e) => {
        e.preventDefault();
        post('/buyer/notifications/read-all');
    };

    return (
        <>
            <Head title={t('buyer.notifications')} />
            <BuyerLayout
                title={t('buyer.notifications')}
                subtitle={t('buyer.notifications_subtitle')}
            >
                <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex flex-wrap gap-2">
                                {FILTERS.map((filter) => (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                            activeFilter === filter.id
                                                ? 'bg-primary-600 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                            {notifications.total > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors shrink-0"
                                >
                                    <CheckCheck size={16} />
                                    {t('buyer.mark_all_read')}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t('buyer.total')}</p>
                            <p className="text-xl font-bold text-gray-900 mt-1">{notifications.total}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t('buyer.unread')}</p>
                            <p className="text-xl font-bold text-primary-600 mt-1">{unreadCount}</p>
                        </div>
                        <div className="hidden sm:block bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t('buyer.filter_label')}</p>
                            <p className="text-xl font-bold text-gray-900 mt-1 capitalize">{activeFilter}</p>
                        </div>
                    </div>

                    {filteredNotifications.length > 0 ? (
                        <>
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="divide-y divide-gray-100">
                                    {filteredNotifications.map((notif) => {
                                        const config = getTypeConfig(notif.type);
                                        const Icon = config.icon;

                                        return (
                                            <Link
                                                key={notif.id}
                                                href={`/buyer/notifications/${notif.id}/read`}
                                                method="patch"
                                                as="button"
                                                className={`w-full text-left flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors ${
                                                    !notif.is_read ? 'bg-primary-50/30' : ''
                                                }`}
                                            >
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.colors}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3 mb-1">
                                                        <p className={`text-sm leading-snug ${!notif.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                            {notif.title}
                                                        </p>
                                                        {!notif.is_read && (
                                                            <span className="w-2.5 h-2.5 bg-primary-600 rounded-full shrink-0 mt-1.5" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 line-clamp-2">{notif.body}</p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {relativeTime(notif.created_at)}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                            <Pagination links={notifications.links} />
                        </>
                    ) : notifications.data.length > 0 ? (
                        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-10 sm:py-14 text-center">
                            <Bell size={40} className="text-primary-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('buyer.no_notifications_filter')}</h3>
                            <p className="text-gray-500 mb-6">{t('buyer.no_notifications_filter_desc')}</p>
                            <button
                                type="button"
                                onClick={() => setActiveFilter('all')}
                                className="inline-flex px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
                            >
                                {t('buyer.show_all')}
                            </button>
                        </div>
                    ) : (
                        <BuyerAccountEmptyState
                            icon={Bell}
                            title={t('buyer.no_notifications_empty_title')}
                            description={t('buyer.no_notifications_empty_desc')}
                            actionLabel={t('buyer.continue_shopping')}
                            actionHref="/products"
                        />
                    )}
                </div>
            </BuyerLayout>
        </>
    );
}
