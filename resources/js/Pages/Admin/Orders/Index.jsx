import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminFilterTabs from '@/Components/Admin/AdminFilterTabs';
import AdminBadge from '@/Components/Admin/AdminBadge';
import { AdminTable, AdminTableHead, AdminTableBody, AdminTableEmpty } from '@/Components/Admin/AdminTable';
import { formatCurrency } from '@/lib/formatCurrency';
import { blockAdminDemoAction } from '@/lib/adminDemo';
import { ShoppingCart, Eye } from 'lucide-react';

export default function OrdersIndex({ orders, filters }) {
    const { usingDemoData } = usePage().props;
    return (
        <AdminLayout subtitle="Opérations" title="Commandes">
            <Head title="Suivi des commandes" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <AdminFilterTabs
                    useLinks
                    baseHref="/admin/orders"
                    items={['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'all'].map((s) => ({ value: s }))}
                    activeValue={filters.status || 'all'}
                />
            </div>

            <AdminTable>
                <AdminTableHead>
                    <tr>
                        <th className="px-6 py-4">Référence</th>
                        <th className="px-6 py-4">Acheteur</th>
                        <th className="px-6 py-4">Vendeur</th>
                        <th className="px-6 py-4">Montant</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4 text-right">Voir</th>
                    </tr>
                </AdminTableHead>
                <AdminTableBody>
                    {orders.data.length > 0 ? orders.data.map((order) => (
                        <tr key={order.id}>
                            <td className="px-6 py-4">
                                <p className="font-bold text-[#002E5D]">{order.order_number}</p>
                                <p className="mt-0.5 text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                            </td>
                            <td className="px-6 py-4">{order.buyer?.user?.name || 'N/A'}</td>
                            <td className="px-6 py-4">{order.seller?.business_name || 'N/A'}</td>
                            <td className="px-6 py-4 font-semibold text-[#002E5D]">
                                {formatCurrency(order.total_amount, { symbol: 'TZS' })}
                            </td>
                            <td className="px-6 py-4">
                                <AdminBadge variant={order.status}>{order.status}</AdminBadge>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link
                                    href={`/admin/orders/${order.id}`}
                                    onClick={(e) => blockAdminDemoAction(usingDemoData) && e.preventDefault()}
                                    className="inline-flex rounded-lg p-2 text-[#0056B3] transition hover:bg-[#002E5D]/5"
                                >
                                    <Eye size={18} />
                                </Link>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="6">
                                <AdminTableEmpty
                                    icon={ShoppingCart}
                                    title="Aucune commande"
                                    description="Aucune commande pour ce filtre."
                                />
                            </td>
                        </tr>
                    )}
                </AdminTableBody>
            </AdminTable>

            <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <div>{orders.from || 0} – {orders.to || 0} sur {orders.total} résultats</div>
                <div className="flex flex-wrap gap-1">
                    {orders.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`rounded-lg border px-3 py-1 transition ${
                                link.active
                                    ? 'border-[#002E5D] bg-[#002E5D] text-white'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#0056B3]/30 hover:bg-slate-50'
                            } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
