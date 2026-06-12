import React, { useRef, useEffect } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Send, ArrowLeft, Mail, MapPin, User } from 'lucide-react';

function formatMessageTime(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return time;
    if (isYesterday) return `Hier ${time}`;
    return d.toLocaleString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function dateLabel(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Aujourd\'hui';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' });
}

function groupMessagesByDate(messages) {
    const groups = [];
    let currentDate = null;

    messages.forEach(msg => {
        const label = dateLabel(msg.created_at);
        if (label !== currentDate) {
            currentDate = label;
            groups.push({ type: 'date', label });
        }
        groups.push({ type: 'message', data: msg });
    });

    return groups;
}

export default function MessageShow({ conversation, messages }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, reset } = useForm({ body: '' });
    const bottomRef = useRef(null);
    const buyer = conversation.buyer;
    const buyerProfile = buyer?.buyer;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = (e) => {
        e.preventDefault();
        if (!data.body.trim()) return;
        post(`/seller/messages/${conversation.id}/send`, {
            onSuccess: () => reset('body'),
        });
    };

    const grouped = groupMessagesByDate(messages);

    return (
        <>
            <Head title={`Discussion avec ${buyer?.name}`} />
            <SellerLayout>
                <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
                    {/* Chat panel */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-w-0">
                        <div className="flex items-center gap-3 p-4 border-b border-gray-100 shrink-0">
                            <Link href="/seller/messages" className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft size={20} />
                            </Link>
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-700 shrink-0">
                                {buyer?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{buyer?.name}</p>
                                <p className="text-xs text-gray-500">Client</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                                        <Send size={22} className="text-amber-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">Aucun message pour le moment. Saluez votre client !</p>
                                </div>
                            )}
                            {grouped.map((item, idx) => {
                                if (item.type === 'date') {
                                    return (
                                        <div key={`date-${idx}`} className="flex items-center gap-3 py-2">
                                            <div className="flex-1 h-px bg-gray-200" />
                                            <span className="text-xs font-medium text-gray-400 px-2">{item.label}</span>
                                            <div className="flex-1 h-px bg-gray-200" />
                                        </div>
                                    );
                                }

                                const msg = item.data;
                                const isMe = msg.sender_id === auth.user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                            isMe
                                                ? 'bg-amber-500 text-white rounded-br-md'
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                                        }`}>
                                            <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>
                                            <p className={`text-xs mt-1.5 ${isMe ? 'text-amber-100' : 'text-gray-400'}`}>
                                                {formatMessageTime(msg.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        <form onSubmit={send} className="border-t border-gray-100 p-4 flex items-end gap-3 shrink-0 bg-white rounded-b-xl">
                            <textarea
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); } }}
                                placeholder="Écrire un message... (Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne)"
                                rows={2}
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            />
                            <button
                                type="submit"
                                disabled={processing || !data.body.trim()}
                                aria-label="Envoyer"
                                className="p-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-sm"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>

                    {/* Buyer sidebar */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center font-bold text-2xl text-amber-700 mx-auto mb-3">
                                    {buyer?.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">{buyer?.name}</h3>
                                <p className="text-sm text-gray-500">Client</p>
                            </div>

                            <div className="space-y-4 text-sm">
                                {buyer?.email && (
                                    <div className="flex items-start gap-3">
                                        <Mail size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-400 mb-0.5">E-mail</p>
                                            <p className="text-gray-700 break-all">{buyer.email}</p>
                                        </div>
                                    </div>
                                )}
                                {buyer?.phone && (
                                    <div className="flex items-start gap-3">
                                        <User size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-400 mb-0.5">Téléphone</p>
                                            <p className="text-gray-700">{buyer.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {(buyerProfile?.city || buyerProfile?.province) && (
                                    <div className="flex items-start gap-3">
                                        <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-400 mb-0.5">Localisation</p>
                                            <p className="text-gray-700">
                                                {[buyerProfile.city, buyerProfile.province].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-xs text-gray-400">
                                    Conversation démarrée le{' '}
                                    {new Date(conversation.created_at).toLocaleDateString('fr-FR', {
                                        month: 'long', day: 'numeric', year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </SellerLayout>
        </>
    );
}
