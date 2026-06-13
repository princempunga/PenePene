import React from 'react';
import useTranslation from '@/hooks/useTranslation';
import { Head, Link, usePage } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import BuyerAccountEmptyState from '@/Components/Buyer/BuyerAccountEmptyState';
import { Ticket, Plus, Clock } from 'lucide-react';

export default function SupportIndex({ tickets }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

    const statusColors = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-amber-100 text-amber-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
    };

    return (
        <>
            <Head title={t('support.title')} />
            <BuyerLayout
                title={t('support.title')}
                subtitle="Get help with orders, payments, or anything else on PenePene."
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                    <p className="text-sm text-gray-500">
                        {tickets.data.length > 0
                            ? `${tickets.total} ticket${tickets.total !== 1 ? 's' : ''}`
                            : 'Need help? Open a ticket and our team will assist you.'}
                    </p>
                    <Link
                        href="/buyer/support/create"
                        className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-sm shrink-0"
                    >
                        <Plus size={18} />
                        New Ticket
                    </Link>
                </div>

                {flash?.success && (
                    <div className="mb-5 bg-green-50 text-green-800 p-4 rounded-xl text-sm border border-green-200">
                        {flash.success}
                    </div>
                )}

                {tickets.data.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {tickets.data.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    href={`/buyer/support/${ticket.id}`}
                                    className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Ticket size={20} className="text-primary-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate">{ticket.subject}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[ticket.status]}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mb-2">
                                            #{ticket.ticket_number} · {ticket.category} · {ticket.priority} priority
                                        </p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            Updated {new Date(ticket.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <BuyerAccountEmptyState
                        icon={Ticket}
                        title="No support tickets yet"
                        description="If you need help with an order or your account, open a ticket and we'll get back to you."
                        actionLabel="Create Ticket"
                        actionHref="/buyer/support/create"
                    />
                )}
            </BuyerLayout>
        </>
    );
}
