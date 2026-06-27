import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminFilterTabs from '@/Components/Admin/AdminFilterTabs';
import AdminAlert from '@/Components/Admin/AdminAlert';
import AdminBadge from '@/Components/Admin/AdminBadge';
import { AdminTable, AdminTableHead, AdminTableBody, AdminTableEmpty } from '@/Components/Admin/AdminTable';
import { blockAdminDemoAction } from '@/lib/adminDemo';
import { Package, Check, X, ShieldAlert, Eye } from 'lucide-react';

export default function ProductsIndex({ products, filters }) {
    const { flash, usingDemoData } = usePage().props;
    const { patch } = useForm();

    const updateStatus = (productId, action, reason = null) => {
        if (blockAdminDemoAction(usingDemoData)) return;
        const msg = action === 'approve' ? 'approuver ce produit'
            : action === 'reject' ? 'rejeter ce produit'
            : 'bannir ce produit';

        if (confirm(`Confirmer : ${msg} ?`)) {
            const payload = reason ? { reason } : {};
            patch(`/admin/products/${productId}/${action}`, { data: payload });
        }
    };

    return (
        <AdminLayout subtitle="Modération" title="Produits">
            <Head title="Modération produits" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <AdminFilterTabs
                    useLinks
                    baseHref="/admin/products"
                    items={['pending', 'active', 'rejected', 'all'].map((s) => ({ value: s }))}
                    activeValue={filters.status || 'all'}
                />
            </div>

            {flash?.success && <AdminAlert>{flash.success}</AdminAlert>}

            <AdminTable>
                <AdminTableHead>
                    <tr>
                        <th className="px-6 py-4">Produit</th>
                        <th className="px-6 py-4">Vendeur</th>
                        <th className="px-6 py-4">Prix / Stock</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </AdminTableHead>
                <AdminTableBody>
                    {products.data.length > 0 ? products.data.map((product) => (
                        <tr key={product.id}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/60">
                                        {(product.demo_image || product.images?.[0]) ? (
                                            <img
                                                src={product.demo_image || `/storage/${product.images[0].path}`}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Package size={20} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 max-w-[250px]">
                                        <p className="truncate font-semibold text-[#002E5D]">{product.name}</p>
                                        <p className="truncate text-xs text-slate-500">{product.category?.name}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-[#002E5D]">
                                {product.seller?.business_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                                <p className="font-semibold text-[#002E5D]">TZS {parseFloat(product.price).toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Stock : {product.initial_stock - product.confirmed_sales}</p>
                            </td>
                            <td className="px-6 py-4">
                                <AdminBadge variant={product.status === 'inactive' ? 'inactive' : product.status}>
                                    {product.status}
                                </AdminBadge>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <Link
                                        href={`/admin/products/${product.id}`}
                                        onClick={(e) => blockAdminDemoAction(usingDemoData) && e.preventDefault()}
                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-[#002E5D]/5 hover:text-[#0056B3]"
                                        title="Voir"
                                    >
                                        <Eye size={18} />
                                    </Link>
                                    {product.status === 'pending' && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => updateStatus(product.id, 'approve')}
                                                className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                                                title="Approuver"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const reason = prompt('Motif du rejet ?');
                                                    if (reason) updateStatus(product.id, 'reject', reason);
                                                }}
                                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                title="Rejeter"
                                            >
                                                <X size={18} />
                                            </button>
                                        </>
                                    )}
                                    {product.status === 'active' && (
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(product.id, 'ban')}
                                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                            title="Bannir"
                                        >
                                            <ShieldAlert size={18} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5">
                                <AdminTableEmpty
                                    icon={Package}
                                    title="Aucun produit"
                                    description="Aucun produit pour ce filtre."
                                />
                            </td>
                        </tr>
                    )}
                </AdminTableBody>
            </AdminTable>

            <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <div>{products.from || 0} – {products.to || 0} sur {products.total} résultats</div>
                <div className="flex flex-wrap gap-1">
                    {products.links.map((link, i) => (
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
