import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminAlert from '@/Components/Admin/AdminAlert';
import AdminBadge from '@/Components/Admin/AdminBadge';
import AdminFilterTabs from '@/Components/Admin/AdminFilterTabs';
import AdminPagination from '@/Components/Admin/AdminPagination';
import { AdminTable, AdminTableHead, AdminTableBody, AdminTableEmpty } from '@/Components/Admin/AdminTable';
import { blockAdminDemoAction } from '@/lib/adminDemo';
import { Megaphone, Check, X } from 'lucide-react';

export default function AdvertisementsIndex({ advertisements, filters }) {
    const { flash, usingDemoData } = usePage().props;
    const { patch } = useForm();

    const updateStatus = (id, action) => {
        if (blockAdminDemoAction(usingDemoData)) return;
        if (confirm(`Confirmer : ${action} cette campagne ?`)) {
            patch(`/admin/advertisements/${id}/${action}`);
        }
    };

    return (
        <AdminLayout subtitle="Opérations" title="Annonces sponsorisées">
            <Head title="Annonces sponsorisées" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <AdminFilterTabs
                    useLinks
                    baseHref="/admin/advertisements"
                    items={['pending', 'active', 'rejected', 'completed', 'all'].map((s) => ({ value: s }))}
                    activeValue={filters.status || 'all'}
                />
            </div>

            {flash?.success && <AdminAlert>{flash.success}</AdminAlert>}

            <AdminTable>
                <AdminTableHead>
                    <tr>
                        <th className="px-6 py-4">Vendeur</th>
                        <th className="px-6 py-4">Produit</th>
                        <th className="px-6 py-4">Placement / Durée</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </AdminTableHead>
                <AdminTableBody>
                    {advertisements.data.length > 0 ? advertisements.data.map((ad) => (
                        <tr key={ad.id}>
                            <td className="px-6 py-4">
                                <p className="font-semibold text-[#002E5D]">{ad.seller?.business_name}</p>
                                <p className="text-xs text-slate-500">{ad.seller?.user?.email}</p>
                            </td>
                            <td className="px-6 py-4 font-medium text-[#002E5D]">
                                {ad.product?.name || 'Produit inconnu'}
                            </td>
                            <td className="px-6 py-4">
                                <p className="font-semibold text-[#002E5D]">{ad.placement.replace('_', ' ').toUpperCase()}</p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {new Date(ad.starts_at).toLocaleDateString('fr-FR')} – {new Date(ad.expires_at).toLocaleDateString('fr-FR')}
                                </p>
                            </td>
                            <td className="px-6 py-4">
                                <AdminBadge variant={ad.status === 'completed' ? 'inactive' : ad.status}>
                                    {ad.status}
                                </AdminBadge>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {ad.status === 'pending' && (
                                    <div className="flex justify-end gap-1">
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(ad.id, 'approve')}
                                            className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
                                            title="Approuver"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(ad.id, 'reject')}
                                            className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                            title="Rejeter"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5">
                                <AdminTableEmpty icon={Megaphone} title="Aucune campagne" description="Aucune campagne pour ce filtre." />
                            </td>
                        </tr>
                    )}
                </AdminTableBody>
            </AdminTable>

            <AdminPagination paginator={advertisements} />
        </AdminLayout>
    );
}
