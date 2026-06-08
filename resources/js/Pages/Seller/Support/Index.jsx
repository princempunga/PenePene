import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Ticket, Plus, Clock, CheckCircle2 } from 'lucide-react';

export default function SellerSupportIndex({ tickets }) {
    const { flash } = usePage().props;

    const statusColors = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-amber-100 text-amber-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
    };

    return (
        <SellerLayout>
            <Head title="Seller Support Tickets" />

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Seller Support</h1>
                <Link
                    href="/seller/support/create"
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
                >
                    <Plus size={18} />
                    New Ticket
                </Link>
            </div>

            {flash?.success && (
                <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                    {flash.success}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {tickets.data.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {tickets.data.map((ticket) => (
                            <Link
                                key={ticket.id}
                                href={`/seller/support/${ticket.id}`}
                                className="flex items-start gap-4 p-5 hover:bg-gray-50 transition"
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Ticket size={20} className="text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900 truncate">{ticket.subject}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColors[ticket.status]}`}>
                                            {ticket.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate mb-2">
                                        #{ticket.ticket_number} · Category: {ticket.category} · Priority: {ticket.priority}
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12} /> Last updated: {new Date(ticket.updated_at).toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <Ticket size={40} className="mx-auto mb-3 opacity-20" />
                        <p>You haven't opened any support tickets.</p>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
}
