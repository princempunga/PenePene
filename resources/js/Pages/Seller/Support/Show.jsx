import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Send, User as UserIcon } from 'lucide-react';

export default function SellerSupportShow({ ticket }) {
    const { auth, flash } = usePage().props;
    const { data, setData, post, processing, reset, errors } = useForm({ body: '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/seller/support/${ticket.id}/reply`, {
            onSuccess: () => reset('body')
        });
    };

    return (
        <SellerLayout>
            <Head title={`Ticket #${ticket.ticket_number}`} />

            <div className="max-w-4xl mx-auto">
                {flash?.success && (
                    <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-lg text-sm border border-red-200">
                        {flash.error}
                    </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 mb-1">{ticket.subject}</h1>
                                <p className="text-sm text-gray-500">
                                    Ticket #{ticket.ticket_number} · Category: {ticket.category} · Priority: {ticket.priority}
                                </p>
                            </div>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                {ticket.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 border-b border-gray-100">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                                <UserIcon size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm mb-1">{ticket.user.name} <span className="text-gray-400 font-normal ml-2">{new Date(ticket.created_at).toLocaleString()}</span></p>
                                <div className="text-gray-700 whitespace-pre-wrap">{ticket.body}</div>
                            </div>
                        </div>
                    </div>

                    {ticket.replies.map(reply => (
                        <div key={reply.id} className={`p-6 border-b border-gray-100 ${reply.is_staff_reply ? 'bg-primary-50/30' : ''}`}>
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${reply.is_staff_reply ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'}`}>
                                    {reply.is_staff_reply ? 'P' : <UserIcon size={20} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm mb-1">
                                        {reply.is_staff_reply ? 'PenePene Support' : reply.user.name}
                                        <span className="text-gray-400 font-normal ml-2">{new Date(reply.created_at).toLocaleString()}</span>
                                    </p>
                                    <div className="text-gray-700 whitespace-pre-wrap">{reply.body}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {ticket.status !== 'closed' ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Reply to Ticket</h3>
                        <form onSubmit={submit}>
                            <textarea
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                rows="4"
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 mb-3"
                                placeholder="Write your reply here..."
                            ></textarea>
                            {errors.body && <p className="text-red-600 text-sm mb-3">{errors.body}</p>}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                                >
                                    <Send size={16} /> Send Reply
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 text-center p-6 text-gray-500">
                        This ticket is closed and cannot receive new replies.
                    </div>
                )}
            </div>
        </SellerLayout>
    );
}
