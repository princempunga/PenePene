import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Send, User as UserIcon, ArrowLeft } from 'lucide-react';

export default function AdminSupportShow({ ticket, admins }) {
    const { auth, flash } = usePage().props;
    const { data, setData, post, processing, reset, errors } = useForm({ body: '' });
    const { patch } = useForm();

    const submitReply = (e) => {
        e.preventDefault();
        post(`/admin/support/${ticket.id}/reply`, {
            onSuccess: () => reset('body')
        });
    };

    const updateStatus = (status) => {
        patch(`/admin/support/${ticket.id}/status`, { data: { status } });
    };

    const updateAssignment = (userId) => {
        patch(`/admin/support/${ticket.id}/assign`, { data: { assigned_to: userId } });
    };

    const statusColors = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-amber-100 text-amber-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
    };

    return (
        <AdminLayout>
            <Head title={`Ticket #${ticket.ticket_number}`} />

            <div className="mb-5 sm:mb-6">
                <Link href="/admin/support" className="text-primary-600 hover:underline flex items-center gap-1 text-xs sm:text-sm font-medium mb-3">
                    <ArrowLeft size={16} /> Back to Support Desk
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wide ${statusColors[ticket.status]}`}>
                            {ticket.status.replace('_', ' ')}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <select
                            value={ticket.assigned_to || ''}
                            onChange={(e) => updateAssignment(e.target.value)}
                            className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 w-full sm:w-auto"
                        >
                            <option value="">Unassigned</option>
                            {admins.map(admin => (
                                <option key={admin.id} value={admin.id}>{admin.name}</option>
                            ))}
                        </select>

                        <select
                            value={ticket.status}
                            onChange={(e) => updateStatus(e.target.value)}
                            className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 w-full sm:w-auto"
                        >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl">
                {flash?.success && (
                    <div className="mb-6 bg-green-50 text-gray-800 p-4 rounded-lg text-sm border border-green-200">
                        {flash.success}
                    </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:justify-between gap-2 text-xs sm:text-sm text-gray-500">
                        <p>
                            Ticket #{ticket.ticket_number} · Category: <span className="font-semibold text-gray-900">{ticket.category}</span> · Priority: <span className="font-semibold text-gray-900">{ticket.priority}</span>
                        </p>
                        <p className="shrink-0">Opened by: <span className="font-semibold text-gray-900">{ticket.user.name}</span></p>
                    </div>

                    <div className="p-4 sm:p-6 border-b border-gray-100">
                        <div className="flex gap-3 sm:gap-4">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                                <UserIcon size={18} className="sm:hidden" />
                                <UserIcon size={20} className="hidden sm:block" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm mb-1">
                                    {ticket.user.name}{' '}
                                    <span className="text-gray-400 font-normal ml-2 text-xs">{new Date(ticket.created_at).toLocaleString()}</span>
                                </p>
                                <div className="text-gray-700 whitespace-pre-wrap text-sm break-words">{ticket.body}</div>
                            </div>
                        </div>
                    </div>

                    {ticket.replies.map(reply => (
                        <div key={reply.id} className={`p-4 sm:p-6 border-b border-gray-100 last:border-b-0 ${reply.is_staff_reply ? 'bg-primary-50/30' : ''}`}>
                            <div className="flex gap-3 sm:gap-4">
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${reply.is_staff_reply ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'}`}>
                                    {reply.is_staff_reply ? 'P' : <UserIcon size={18} className="sm:hidden" />}
                                    {reply.is_staff_reply ? null : <UserIcon size={20} className="hidden sm:block" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm mb-1">
                                        {reply.is_staff_reply ? `Staff: ${reply.user.name}` : reply.user.name}
                                        <span className="text-gray-400 font-normal ml-2 text-xs">{new Date(reply.created_at).toLocaleString()}</span>
                                    </p>
                                    <div className="text-gray-700 whitespace-pre-wrap text-sm break-words">{reply.body}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {ticket.status !== 'closed' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                        <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Reply to User</h3>
                        <form onSubmit={submitReply}>
                            <textarea
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                rows="4"
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 mb-3 text-sm"
                                placeholder="Write your response here..."
                            ></textarea>
                            {errors.body && <p className="text-red-600 text-sm mb-3">{errors.body}</p>}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 bg-primary-600 text-white px-5 sm:px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 text-sm"
                                >
                                    <Send size={16} /> Send Reply
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}