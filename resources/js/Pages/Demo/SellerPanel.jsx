import React, { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import useTranslation from '@/hooks/useTranslation';
import {
    FlaskConical, MessageSquare, Package, Wifi, WifiOff, Send, RefreshCw,
} from 'lucide-react';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function SellerPanel({ seller, isOnline, conversations, orders, orderStatuses }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const [online, setOnline] = useState(isOnline);
    const [selectedConv, setSelectedConv] = useState(conversations[0]?.id ?? null);
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    const toggleOnline = () => {
        const next = !online;
        setOnline(next);
        router.post('/demo/seller-panel/online', { online: next }, { preserveScroll: true });
    };

    const loadMessages = useCallback(async (convId) => {
        if (!convId) return;
        setLoadingMessages(true);
        try {
            const res = await axios.get(`/demo/seller-panel/conversations/${convId}/messages`);
            setMessages(res.data.messages ?? []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        if (selectedConv) {
            loadMessages(selectedConv);
        }
    }, [selectedConv, loadMessages]);

    const sendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedConv || sending) return;

        setSending(true);
        try {
            const res = await axios.post(`/demo/seller-panel/conversations/${selectedConv}/reply`, {
                body: replyText.trim(),
            });
            setMessages((prev) => [...prev, res.data.message]);
            setReplyText('');
        } catch (err) {
            console.error(err);
            alert('Failed to send reply.');
        } finally {
            setSending(false);
        }
    };

    const updateOrderStatus = (orderId, status) => {
        router.patch(`/demo/seller-panel/orders/${orderId}/status`, { status }, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title={t('demo_panel.title')} />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
                            <FlaskConical size={16} />
                            {t('demo_panel.dev_only')}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('demo_panel.title')}</h1>
                        <p className="text-gray-600">{seller.business_name}</p>
                    </div>

                    <button
                        type="button"
                        onClick={toggleOnline}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-colors ${
                            online
                                ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                    >
                        {online ? <Wifi size={18} /> : <WifiOff size={18} />}
                        {online ? t('demo_panel.mark_offline') : t('demo_panel.mark_online')}
                    </button>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm">
                        {flash.success}
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Messages */}
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                            <MessageSquare size={20} className="text-primary-600" />
                            <h2 className="font-bold text-gray-900">{t('demo_panel.messages')}</h2>
                        </div>

                        <div className="flex h-96">
                            <div className="w-2/5 border-r border-gray-100 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <p className="p-4 text-sm text-gray-500">{t('demo_panel.no_messages')}</p>
                                ) : (
                                    conversations.map((conv) => (
                                        <button
                                            key={conv.id}
                                            type="button"
                                            onClick={() => setSelectedConv(conv.id)}
                                            className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 ${
                                                selectedConv === conv.id ? 'bg-primary-50' : ''
                                            }`}
                                        >
                                            <p className="font-semibold text-sm text-gray-900 truncate">{conv.buyer_name}</p>
                                            <p className="text-xs text-gray-500 truncate">{conv.last_message || '—'}</p>
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {loadingMessages ? (
                                        <p className="text-sm text-gray-500 text-center py-8">{t('demo_panel.loading')}</p>
                                    ) : messages.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-8">{t('demo_panel.select_conversation')}</p>
                                    ) : (
                                        messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                                    msg.is_seller
                                                        ? 'ml-auto bg-primary-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                }`}
                                            >
                                                {msg.body}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {selectedConv && (
                                    <form onSubmit={sendReply} className="p-3 border-t border-gray-100 flex gap-2">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={t('demo_panel.reply_placeholder')}
                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !replyText.trim()}
                                            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Orders */}
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package size={20} className="text-primary-600" />
                                <h2 className="font-bold text-gray-900">{t('demo_panel.orders')}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.reload({ only: ['orders'] })}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-96 divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <p className="p-6 text-sm text-gray-500 text-center">{t('demo_panel.no_orders')}</p>
                            ) : (
                                orders.map((order) => (
                                    <div key={order.id} className="p-4">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.order_number}</p>
                                                <p className="text-xs text-gray-500">{order.buyer_name} · {order.items_count} items</p>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 mb-2">
                                            ${parseFloat(order.total).toFixed(2)} · {order.payment_status}
                                        </p>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                                        >
                                            {orderStatuses.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
