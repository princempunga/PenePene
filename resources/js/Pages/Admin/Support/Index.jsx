import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Ticket, Clock, CheckCircle2 } from 'lucide-react';

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

    return (
        <AdminLayout>
            <Head title="Support Desk" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Support Desk</h1>
                    <p className="text-gray-500 mt-1">Manage all user and seller support tickets.</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                        {['open', 'in_progress', 'resolved', 'closed', 'all'].map(status => (
                            <Link
                                key={status}
                                href={`/admin/support?status=${status}`}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${
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
            
            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <div>Showing {tickets.from || 0} to {tickets.to || 0} of {tickets.total} results</div>
                <div className="flex gap-1">
                    {tickets.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`px-3 py-1 rounded border ${link.active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
