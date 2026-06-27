import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminFilterTabs from '@/Components/Admin/AdminFilterTabs';
import AdminBadge from '@/Components/Admin/AdminBadge';
import AdminPagination from '@/Components/Admin/AdminPagination';
import { AdminTable, AdminTableHead, AdminTableBody, AdminTableEmpty } from '@/Components/Admin/AdminTable';
import { blockAdminDemoAction } from '@/lib/adminDemo';
import { Ticket } from 'lucide-react';

const priorityVariant = {
    low: 'text-slate-500',
    medium: 'text-[#0056B3]',
    high: 'text-orange-600 font-semibold',
    urgent: 'text-red-600 font-bold',
};

export default function AdminSupportIndex({ tickets, filters }) {
    const { usingDemoData } = usePage().props;
    return (
        <AdminLayout subtitle="Opérations" title="Support">
            <Head title="Support" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <AdminFilterTabs
                    useLinks
                    baseHref="/admin/support"
                    items={['open', 'in_progress', 'resolved', 'closed', 'all'].map((s) => ({ value: s, label: s.replace('_', ' ') }))}
                    activeValue={filters.status || 'all'}
                />
            </div>

            <AdminTable>
                <AdminTableHead>
                    <tr>
                        <th className="px-6 py-4">Ticket</th>
                        <th className="px-6 py-4">Signaleur</th>
                        <th className="px-6 py-4">Catégorie / Priorité</th>
                        <th className="px-6 py-4">Assigné à</th>
                        <th className="px-6 py-4">Statut</th>
                    </tr>
                </AdminTableHead>
                <AdminTableBody>
                    {tickets.data.length > 0 ? tickets.data.map((ticket) => (
                        <tr key={ticket.id}>
                            <td className="px-6 py-4">
                                <Link
                                    href={`/admin/support/${ticket.id}`}
                                    onClick={(e) => blockAdminDemoAction(usingDemoData) && e.preventDefault()}
                                    className="block"
                                >
                                    <p className="font-semibold text-[#002E5D] hover:text-[#0056B3]">{ticket.subject}</p>
                                    <p className="mt-0.5 text-xs text-slate-500">#{ticket.ticket_number}</p>
                                </Link>
                            </td>
                            <td className="px-6 py-4">
                                <p className="font-medium text-[#002E5D]">{ticket.user?.name}</p>
                                <p className="text-xs text-slate-500">{ticket.user?.email}</p>
                            </td>
                            <td className="px-6 py-4">
                                <p className="capitalize text-[#002E5D]">{ticket.category}</p>
                                <p className={`text-xs ${priorityVariant[ticket.priority] || ''}`}>
                                    {ticket.priority.toUpperCase()}
                                </p>
                            </td>
                            <td className="px-6 py-4">
                                {ticket.assigned_to ? (
                                    <span className="text-[#002E5D]">{ticket.assignedTo?.name}</span>
                                ) : (
                                    <span className="italic text-slate-400">Non assigné</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <AdminBadge variant={ticket.status === 'in_progress' ? 'confirmed' : ticket.status}>
                                    {ticket.status.replace('_', ' ')}
                                </AdminBadge>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5">
                                <AdminTableEmpty icon={Ticket} title="Aucun ticket" description="Aucun ticket pour ce filtre." />
                            </td>
                        </tr>
                    )}
                </AdminTableBody>
            </AdminTable>

            <AdminPagination paginator={tickets} />
        </AdminLayout>
    );
}
