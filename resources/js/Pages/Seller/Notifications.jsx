import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import Pagination from '@/Components/UI/Pagination';
import { Bell, CheckCheck, Package, MessageCircle, Star, ExternalLink } from 'lucide-react';

const typeConfig = {
    order:   { icon: Package,       colors: 'bg-blue-100 text-blue-600' },
    message: { icon: MessageCircle, colors: 'bg-purple-100 text-purple-600' },
    review:  { icon: Star,          colors: 'bg-amber-100 text-amber-600' },
    system:  { icon: Bell,          colors: 'bg-gray-100 text-gray-600' },
};

function NotificationItem({ notif, basePath }) {
    const config = typeConfig[notif.type] || typeConfig.system;
    const Icon = config.icon;

    return (
        <Link
            href={`${basePath}/${notif.id}/read`}
            method="patch"
            as="button"
            className={`w-full text-left flex items-start gap-4 p-5 transition-colors ${
                !notif.is_read
                    ? 'bg-amber-50/60 hover:bg-amber-50 border-l-2 border-l-amber-400'
                    : 'hover:bg-gray-50 border-l-2 border-l-transparent'
            }`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.colors}`}>
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notif.title}
                    </p>
                    {!notif.is_read && (
                        <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />
                    )}
                    {notif.action_url && (
                        <ExternalLink size={12} className="text-gray-400 shrink-0" />
                    )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{notif.body}</p>
                <p className="text-xs text-gray-400 mt-1.5">
                    {new Date(notif.created_at).toLocaleString('fr-FR', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                </p>
            </div>
        </Link>
    );
}

function NotificationSection({ title, count, children, emptyMessage }) {
    if (!children && count === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
                {count > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {count}
                    </span>
                )}
            </div>
            {count > 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100">{children}</div>
                </div>
            ) : (
                <p className="text-sm text-gray-400 italic">{emptyMessage}</p>
            )}
        </div>
    );
}

export default function Notifications({ unread, read }) {
    const { post } = useForm({});
    const basePath = '/seller/notifications';
    const totalCount = unread.length + (read.total ?? 0);

    const markAllRead = (e) => {
        e.preventDefault();
        post(`${basePath}/read-all`);
    };

    return (
        <>
            <Head title="Notifications" />
            <SellerLayout title="Notifications">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-500 text-sm">
                        {totalCount} notification{totalCount !== 1 ? 's' : ''}
                    </p>
                    {unread.length > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium"
                        >
                            <CheckCheck size={16} />
                            Tout marquer comme lu
                        </button>
                    )}
                </div>

                {totalCount > 0 ? (
                    <>
                        <NotificationSection
                            title="Non lues"
                            count={unread.length}
                            emptyMessage="Aucune notification non lue."
                        >
                            {unread.map(notif => (
                                <NotificationItem key={notif.id} notif={notif} basePath={basePath} />
                            ))}
                        </NotificationSection>

                        <NotificationSection
                            title="Précédentes"
                            count={read.total ?? 0}
                        >
                            {read.data?.map(notif => (
                                <NotificationItem key={notif.id} notif={{ ...notif, is_read: true }} basePath={basePath} />
                            ))}
                        </NotificationSection>

                        <Pagination links={read.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={32} className="text-amber-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Vous êtes à jour !</h3>
                        <p className="text-gray-500">Vous n'avez aucune notification pour le moment.</p>
                    </div>
                )}
            </SellerLayout>
        </>
    );
}
