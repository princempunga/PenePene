import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { Send, ArrowLeft } from 'lucide-react';

export default function MessageShow({ conversation, messages }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, reset } = useForm({ body: '' });
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = (e) => {
        e.preventDefault();
        if (!data.body.trim()) return;
        post(`/buyer/messages/${conversation.id}/send`, {
            onSuccess: () => reset('body'),
        });
    };

    return (
        <>
            <Head title={`Chat with ${conversation.seller?.business_name}`} />
            <BuyerLayout>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[70vh]">
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                        <Link href="/buyer/messages" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 shrink-0">
                            {conversation.seller?.business_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{conversation.seller?.business_name}</p>
                            <Link href={`/sellers/${conversation.seller?.slug}`} className="text-xs text-primary-600 hover:text-primary-700">View Store</Link>
                        </div>
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                        {messages.length === 0 && (
                            <div className="text-center text-sm text-gray-400 py-8">
                                Send a message to start the conversation.
                            </div>
                        )}
                        {messages.map(msg => {
                            const isMe = msg.sender_id === auth.user?.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                        isMe
                                            ? 'bg-primary-600 text-white rounded-br-sm'
                                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                                    }`}>
                                        <p className="leading-relaxed">{msg.body}</p>
                                        <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={send} className="border-t border-gray-100 p-4 flex items-end gap-3">
                        <textarea
                            value={data.body}
                            onChange={e => setData('body', e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send(e); }}
                            placeholder="Type a message..."
                            rows={1}
                            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                        <button
                            type="submit"
                            disabled={processing || !data.body.trim()}
                            className="p-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </BuyerLayout>
        </>
    );
}
