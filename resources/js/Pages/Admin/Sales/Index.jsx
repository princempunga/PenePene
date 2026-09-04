import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/UI/Pagination';
import { TrendingUp, Download, DollarSign, ShoppingBag, BarChart2, Filter, X } from 'lucide-react';

const fmt = (n) => parseFloat(n || 0).toLocaleString('fr-CD', { minimumFractionDigits: 0 });

const STATUS_COLORS = {
    delivered: 'bg-green-100 text-green-800',
    pending:   'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected:  'bg-red-100 text-red-800',
};

export default function GlobalSalesIndex({ orders, kpis, sellers, categories, filters }) {
    const [showFilters, setShowFilters] = useState(false);

    const filterForm = useForm({
        date_from:     filters.date_from     ?? '',
        date_to:       filters.date_to       ?? '',
        seller_id:     filters.seller_id     ?? '',
        status:        filters.status        ?? '',
        category_id:   filters.category_id   ?? '',
        subcategory_id: filters.subcategory_id ?? '',
        product:       filters.product       ?? '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/admin/sales', filterForm.data, { preserveState: true });
    };

    const handleReset = () => {
        filterForm.setData({
            date_from: '', date_to: '', seller_id: '',
            status: '', category_id: '', subcategory_id: '', product: '',
        });
        router.get('/admin/sales', {}, { preserveState: false });
    };

    const buildExportUrl = () => {
        const params = new URLSearchParams(
            Object.fromEntries(Object.entries(filterForm.data).filter(([, v]) => v))
        );
        return `/admin/sales/export?${params.toString()}`;
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <>
            <Head title="Ventes Globales PenePene" />
            <AdminLayout title="Ventes Globales">

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <DollarSign size={20} />
                            </div>
                            <span className="text-sm font-medium text-emerald-100">Chiffre d'Affaires Total (GMV)</span>
                        </div>
                        <p className="text-3xl font-bold">{fmt(kpis.total_gmv)}</p>
                        <p className="text-xs text-emerald-200 mt-1">CDF – commandes livrées</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <ShoppingBag size={20} />
                            </div>
                            <span className="text-sm font-medium text-purple-100">Volume de Commandes</span>
                        </div>
                        <p className="text-3xl font-bold">{kpis.total_orders?.toLocaleString()}</p>
                        <p className="text-xs text-purple-200 mt-1">Toutes commandes confondues</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <BarChart2 size={20} />
                            </div>
                            <span className="text-sm font-medium text-blue-100">Panier Moyen</span>
                        </div>
                        <p className="text-3xl font-bold">{fmt(kpis.avg_order)}</p>
                        <p className="text-xs text-blue-200 mt-1">CDF par commande livrée</p>
                    </div>
                </div>

                {/* ── Filter Bar ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-slate-900"
                        >
                            <Filter size={16} />
                            Filtres
                            {activeFilterCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white text-xs font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        <div className="flex items-center gap-2">
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                                >
                                    <X size={13} /> Réinitialiser
                                </button>
                            )}
                            <a
                                href={buildExportUrl()}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Download size={15} /> Exporter CSV
                            </a>
                        </div>
                    </div>

                    {showFilters && (
                        <form onSubmit={handleFilter} className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 font-medium mb-1">Date début</label>
                                <input
                                    type="date"
                                    value={filterForm.data.date_from}
                                    onChange={e => filterForm.setData('date_from', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-medium mb-1">Date fin</label>
                                <input
                                    type="date"
                                    value={filterForm.data.date_to}
                                    onChange={e => filterForm.setData('date_to', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-medium mb-1">Vendeur</label>
                                <select
                                    value={filterForm.data.seller_id}
                                    onChange={e => filterForm.setData('seller_id', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                >
                                    <option value="">Tous</option>
                                    {sellers.map(s => (
                                        <option key={s.id} value={s.id}>{s.business_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-medium mb-1">Statut</label>
                                <select
                                    value={filterForm.data.status}
                                    onChange={e => filterForm.setData('status', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                >
                                    <option value="">Tous</option>
                                    <option value="pending">En attente</option>
                                    <option value="confirmed">Confirmée</option>
                                    <option value="delivered">Livrée</option>
                                    <option value="cancelled">Annulée</option>
                                    <option value="rejected">Rejetée</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-medium mb-1">Catégorie</label>
                                <select
                                    value={filterForm.data.category_id}
                                    onChange={e => filterForm.setData('category_id', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                >
                                    <option value="">Toutes</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-medium mb-1">Produit</label>
                                <input
                                    type="text"
                                    placeholder="Nom du produit…"
                                    value={filterForm.data.product}
                                    onChange={e => filterForm.setData('product', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1 flex items-end gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                                >
                                    Appliquer
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* ── Sales Table ── */}
                {orders.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4">N° Commande</th>
                                        <th className="px-4 py-4">Date</th>
                                        <th className="px-4 py-4">Acheteur</th>
                                        <th className="px-4 py-4">Vendeur</th>
                                        <th className="px-4 py-4">Produits / Catégorie</th>
                                        <th className="px-4 py-4 text-right">Total</th>
                                        <th className="px-4 py-4">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.data.map(order => {
                                        const productNames = order.items?.map(i => i.product_name).join(', ') || '—';
                                        const category    = order.items?.[0]?.product?.category?.name ?? '—';
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700 whitespace-nowrap">
                                                    {order.order_number}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                    {new Date(order.created_at).toLocaleDateString('fr-CD')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-800 text-xs">{order.buyer?.user?.name ?? 'N/A'}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/admin/sellers/${order.seller?.slug}/statistics`}
                                                        className="font-medium text-blue-600 hover:underline text-xs"
                                                    >
                                                        {order.seller?.business_name ?? 'N/A'}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 max-w-[200px]">
                                                    <p className="truncate text-xs text-gray-700">{productNames}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">{category}</p>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-900 whitespace-nowrap">
                                                    {fmt(order.total)} <span className="text-xs font-normal text-gray-400">{order.currency}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={orders.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                        <TrendingUp size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune vente trouvée</h3>
                        <p className="text-gray-500 text-sm">Essayez de modifier vos filtres.</p>
                    </div>
                )}

            </AdminLayout>
        </>
    );
}
