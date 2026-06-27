import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminFilterTabs from '@/Components/Admin/AdminFilterTabs';
import AdminBadge from '@/Components/Admin/AdminBadge';
import { AdminTable, AdminTableHead, AdminTableBody, AdminTableEmpty } from '@/Components/Admin/AdminTable';
import Pagination from '@/Components/UI/Pagination';
import { blockAdminDemoAction } from '@/lib/adminDemo';
import { Store, ShieldCheck, XCircle, Clock } from 'lucide-react';

const statusConfig = {
    pending:   { label: 'En attente', variant: 'pending', icon: Clock },
    active:    { label: 'Actif', variant: 'active', icon: ShieldCheck },
    verified:  { label: 'Vérifié', variant: 'verified', icon: ShieldCheck },
    rejected:  { label: 'Rejeté', variant: 'rejected', icon: XCircle },
    suspended: { label: 'Suspendu', variant: 'suspended', icon: XCircle },
};

export default function SellersIndex({ sellers, filters }) {
    const { usingDemoData } = usePage().props;

    const handleFilter = (status) => {
        router.get('/admin/sellers', { status: status === 'all' ? '' : status }, { preserveState: true });
    };

    return (
        <>
            <Head title="Gestion vendeurs" />
            <AdminLayout subtitle="Marketplace" title="Gestion des vendeurs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <AdminFilterTabs
                        items={['all', 'pending', 'active', 'rejected', 'suspended'].map((s) => ({ value: s }))}
                        activeValue={filters.status || 'all'}
                        onSelect={handleFilter}
                    />
                </div>

                {sellers.data.length > 0 ? (
                    <>
                        <AdminTable>
                            <AdminTableHead>
                                <tr>
                                    <th className="px-6 py-4">Boutique</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Localisation</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </AdminTableHead>
                            <AdminTableBody>
                                {sellers.data.map((seller) => {
                                    const config = statusConfig[seller.status] || statusConfig.suspended;
                                    return (
                                        <tr key={seller.id}>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[#002E5D]">{seller.business_name}</p>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    Inscrit le {new Date(seller.created_at).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-[#002E5D]">{seller.user?.name}</p>
                                                <p className="text-xs text-slate-500">{seller.user?.email}</p>
                                            </td>
                                            <td className="px-6 py-4">{seller.city}, {seller.country}</td>
                                            <td className="px-6 py-4">
                                                <AdminBadge variant={config.variant} icon={config.icon}>
                                                    {config.label}
                                                </AdminBadge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/sellers/${seller.id}`}
                                                    onClick={(e) => blockAdminDemoAction(usingDemoData) && e.preventDefault()}
                                                    className="admin-btn-ghost"
                                                >
                                                    Examiner
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </AdminTableBody>
                        </AdminTable>
                        <Pagination links={sellers.links} />
                    </>
                ) : (
                    <AdminTable>
                        <AdminTableEmpty
                            icon={Store}
                            title="Aucun vendeur trouvé"
                            description="Aucun vendeur ne correspond à ce filtre."
                        />
                    </AdminTable>
                )}
            </AdminLayout>
        </>
    );
}
