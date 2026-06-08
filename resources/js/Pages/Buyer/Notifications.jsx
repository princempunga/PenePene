import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import Pagination from '@/Components/UI/Pagination';
import { Bell, CheckCheck } from 'lucide-react';

const typeColors = {
    order:   'bg-blue-100 text-blue-600',
    message: 'bg-purple-100 text-purple-600',
    review:  'bg-amber-100 text-amber-600',
    system:  'bg-gray-100 text-gray-600',
};

export default function Notifications({ notifications }) {
    const { post } = useForm({});

    const markAllRead = (e) => {
        e.preventDefault();
        post('/buyer/notifications/read-all');
    };

    return (
        <>
            <Head title="Notifications" />
            <BuyerLayout title="Notifications">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-500">{notifications.total} notification{notifications.total !== 1 ? 's' : ''}</p>
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        <CheckCheck size={16} />
                        Mark all read
                    </button>
                </div>

                {notifications.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {notifications.data.map(notif => (
                                    <Link
                                        key={notif.id}
                                        href={`/buyer/notifications/${notif.id}/read`}
                                        method="patch"
                                        as="button"
                                        className={`w-full text-left flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-primary-50/40' : ''}`}
                                    >
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${typeColors[notif.type] || typeColors.system}`}>
                                            <Bell size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && (
                                                    <span className="w-2 h-2 bg-primary-600 rounded-full shrink-0"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{notif.body}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notif.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <Pagination links={notifications.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <Bell size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
                        <p className="text-gray-500">You're all caught up!</p>
                    </div>
                )}
            </BuyerLayout>
        </>
    );
}
