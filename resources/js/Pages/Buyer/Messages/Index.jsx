import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { MessageCircle } from 'lucide-react';

export default function MessagesIndex({ conversations }) {
    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - d) / 86400000);
        if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        return d.toLocaleDateString();
    };

    return (
        <>
            <Head title="Messages" />
            <BuyerLayout title="My Messages">
                {conversations.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {conversations.map(conv => {
                                const lastMsg = conv.messages?.[0];
                                return (
                                    <Link
                                        key={conv.id}
                                        href={`/buyer/messages/${conv.id}`}
                                        className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 shrink-0">
                                            {conv.seller?.business_name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-gray-900 truncate">{conv.seller?.business_name}</span>
                                                <span className="text-xs text-gray-400 shrink-0 ml-2">{lastMsg ? formatTime(lastMsg.created_at) : ''}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{lastMsg?.body || 'No messages yet'}</p>
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <span className="bg-primary-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <MessageCircle size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No conversations yet</h3>
                        <p className="text-gray-500 mb-6">Visit a seller's store page and send them a message.</p>
                        <Link href="/products" className="inline-block bg-primary-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary-700">
                            Browse Products
                        </Link>
                    </div>
                )}
            </BuyerLayout>
        </>
    );
}
