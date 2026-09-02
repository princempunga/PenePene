import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Ticket } from 'lucide-react';

export default function AdminSupportIndex({ tickets, admins, filters }) {
    const statusColors = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-amber-100 text-amber-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
    };

    const priorityColors = {
        low: 'text-gray-500',
        medium: 'text-blue-500',
        high: 'text-orange-500',
        urgent: 'text-red-600 font-bold',
    };

    const filterTabs = ['open', 'in_progress', 'resolved', 'closed', 'all'];

    return (
        <AdminLayout>
            <Head title="Support Desk" />

            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Support Desk</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage all user and seller support tickets.</p>
                </div>

                {/* Filter tabs - horizontal scroll on mobile */}
                <div className="-mx-3 sm:mx-0 overflow-x-auto scrollbar-none">
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm w-max sm:w-auto">
                        {filterTabs.map(status => (
                            <Link
                                key={status}
                                href={`/admin/support?status=${status}`}
                                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium capitalize transition whitespace-nowrap ${
                                    (filters.status === status) || (!filters.status && status === 'all')
                                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {status.replace('_', ' ')}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Desktop / tablet table (md+) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Ticket</th>
                                <th className="px-6 py-4">Reporter</th>
                                <th className="px-6 py-4">Category / Priority</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tickets.data.length > 0 ? tickets.data.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/support/${ticket.id}`} className="block">
                                            <p className="font-semibold text-gray-900 hover:text-primary-600">{ticket.subject}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">#{ticket.ticket_number}</p>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-900 font-medium">{ticket.user?.name}</p>
                                        <p className="text-xs text-gray-500">{ticket.user?.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-900 capitalize">{ticket.category}</p>
                                        <p className={`text-xs ${priorityColors[ticket.priority]}`}>
                                            {ticket.priority.toUpperCase()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {ticket.assigned_to ? (
                                            <span className="text-gray-900">{ticket.assignedTo?.name}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[ticket.status]}`}>
                                            {ticket.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <Ticket size={40} className="mx-auto mb-3 opacity-20" />
                                        <p>No tickets found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-100">
                    {tickets.data.length > 0 ? tickets.data.map(ticket => (
                        <Link
                            key={ticket.id}
                            href={`/admin/support/${ticket.id}`}
                            className="block p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{ticket.subject}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">#{ticket.ticket_number}</p>
                                </div>
                                <span className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold ${statusColors[ticket.status]}`}>
                                    {ticket.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-600 text-xs">
                                <span className="truncate">{ticket.user?.name}</span>
                                <span className="text-gray-300">·</span>
                                <span className="capitalize">{ticket.category}</span>
                                <span className={`ml-auto ${priorityColors[ticket.priority]}`}>
                                    {ticket.priority.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">
                                {ticket.assigned_to ? `→ ${ticket.assignedTo?.name}` : '→ Unassigned'}
                            </p>
                        </Link>
                    )) : (
                        <div className="p-10 text-center text-gray-500">
                            <Ticket size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No tickets found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-xs sm:text-sm text-gray-500">
                <div>Showing {tickets.from || 0} to {tickets.to || 0} of {tickets.total} results</div>
                <div className="flex flex-wrap gap-1">
                    {tickets.links.map((link, i) => (
                        <button
                            key={i}
                            type="button"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                            className={`px-2.5 sm:px-3 py-1 rounded border ${
                                link.active
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}