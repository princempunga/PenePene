import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { formatCurrency } from '@/lib/formatCurrency';
import {
    FileDown, FileText, Package, AlertCircle, DollarSign,
    ShoppingCart, TrendingUp, Calendar, Download,
} from 'lucide-react';

const statusColors = {
    pending:   'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped:   'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
    pending:   'En attente',
    confirmed: 'Confirmée',
    shipped:   'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
};

function StatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    );
}

export default function ReportsIndex({ stats, revenueTrend, topProducts, recentOrders, filters }) {
    const filterForm = useForm({
        from: filters.from,
        to: filters.to,
    });

    const exportForm = useForm({
        type: 'sales',
        format: 'pdf',
        from: filters.from,
        to: filters.to,
    });

    const applyFilter = (e) => {
        e.preventDefault();
        router.get('/seller/reports', {
            from: filterForm.data.from,
            to: filterForm.data.to,
        }, { preserveState: true });
    };

    const downloadReport = (e) => {
        e.preventDefault();

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/seller/reports/generate';

        const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.content;
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        const payload = {
            ...exportForm.data,
            from: filterForm.data.from,
            to: filterForm.data.to,
        };

        Object.keys(payload).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = payload[key];
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const maxRevenue = Math.max(...revenueTrend.map(d => d.amount), 1);

    return (
        <SellerLayout>
            <Head title="Rapports et analyses" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rapports et analyses</h1>
                    <p className="text-gray-500 mt-1">Aperçu des ventes, tendances et rapports téléchargeables pour votre boutique.</p>
                </div>

                <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Du</label>
                        <input
                            type="date"
                            value={filterForm.data.from}
                            onChange={e => filterForm.setData('from', e.target.value)}
                            className="border border-gray-300 rounded-lg text-sm px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Au</label>
                        <input
                            type="date"
                            value={filterForm.data.to}
                            onChange={e => filterForm.setData('to', e.target.value)}
                            className="border border-gray-300 rounded-lg text-sm px-3 py-2"
                        />
                    </div>
                    <button
                        type="submit"
                        className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                    >
                        <Calendar size={16} />
                        Appliquer
                    </button>
                </form>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <StatCard
                    icon={DollarSign}
                    label="Revenus"
                    value={formatCurrency(stats.total_revenue)}
                    color="bg-green-100 text-green-600"
                />
                <StatCard
                    icon={ShoppingCart}
                    label="Commandes"
                    value={stats.total_orders}
                    sub={`${stats.delivered} livrée${stats.delivered !== 1 ? 's' : ''}`}
                    color="bg-blue-100 text-blue-600"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Panier moyen"
                    value={formatCurrency(stats.avg_order_value)}
                    color="bg-indigo-100 text-indigo-600"
                />
                <StatCard
                    icon={Package}
                    label="Produits"
                    value={stats.total_products}
                    color="bg-purple-100 text-purple-600"
                />
                <StatCard
                    icon={FileText}
                    label="En attente"
                    value={stats.pending}
                    sub="commandes sur la période"
                    color="bg-amber-100 text-amber-600"
                />
                <StatCard
                    icon={FileDown}
                    label="Livrées"
                    value={stats.delivered}
                    sub="commandes terminées"
                    color="bg-emerald-100 text-emerald-600"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Revenue Trend Chart */}
                <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="font-bold text-gray-900 mb-1">Tendance des revenus</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        {filters.from} — {filters.to}
                    </p>
                    {revenueTrend.length > 0 ? (
                        <div className="h-56 flex items-end justify-between gap-1 sm:gap-2">
                            {revenueTrend.map((data, i) => {
                                const heightPct = (data.amount / maxRevenue) * 100;
                                return (
                                    <div key={i} className="flex flex-col items-center flex-1 group relative min-w-0">
                                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity z-10 pointer-events-none">
                                            {formatCurrency(data.amount)}
                                        </div>
                                        <div className="w-full max-w-[36px] h-44 bg-primary-50 rounded-t-md relative flex items-end">
                                            <div
                                                className="w-full bg-primary-500 rounded-t-md transition-all duration-500"
                                                style={{ height: `${Math.max(heightPct, data.amount > 0 ? 4 : 1)}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 text-[10px] sm:text-xs text-gray-500 truncate w-full text-center">
                                            {data.date}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
                            Aucune donnée de revenus pour cette période.
                        </div>
                    )}
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900">Meilleurs produits</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Par revenus sur la période sélectionnée</p>
                    </div>
                    {topProducts.length > 0 ? (
                        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                            {topProducts.map((product, i) => (
                                <div key={i} className="px-5 py-3 flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.units_sold} vendu{product.units_sold !== 1 ? 's' : ''}</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 shrink-0">
                                        {formatCurrency(product.revenue)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">Aucune vente de produit sur cette période.</div>
                    )}
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Commandes sur la période</h2>
                    <span className="text-sm text-gray-500">{recentOrders.length} affichée{recentOrders.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <th className="px-5 py-3">N° commande</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Acheteur</th>
                                <th className="px-5 py-3">Articles</th>
                                <th className="px-5 py-3">Total</th>
                                <th className="px-5 py-3">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.length > 0 ? recentOrders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3 font-semibold text-gray-900">{order.order_number}</td>
                                    <td className="px-5 py-3 text-gray-600">
                                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-5 py-3 text-gray-600">{order.buyer?.user?.name ?? 'N/D'}</td>
                                    <td className="px-5 py-3 text-gray-600">{order.items?.length ?? 0}</td>
                                    <td className="px-5 py-3 font-medium text-gray-900">
                                        {formatCurrency(order.total_amount)}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {statusLabels[order.status] ?? order.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                                        Aucune commande trouvée pour la période sélectionnée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export Panel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center shrink-0">
                        <Download size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Exporter le rapport</h2>
                        <p className="text-sm text-gray-500">Téléchargez en PDF, Excel ou CSV selon la période ci-dessus</p>
                    </div>
                </div>
                <div className="p-6">
                    <form onSubmit={downloadReport} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type de rapport</label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'sales', label: 'Ventes et revenus' },
                                        { value: 'products', label: 'Inventaire des produits' },
                                        { value: 'stock', label: 'Alertes stock faible', alert: true },
                                    ].map(opt => (
                                        <label
                                            key={opt.value}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                                                exportForm.data.type === opt.value
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="type"
                                                value={opt.value}
                                                checked={exportForm.data.type === opt.value}
                                                onChange={e => exportForm.setData('type', e.target.value)}
                                                className="text-primary-600"
                                            />
                                            <span className="font-medium flex items-center gap-2">
                                                {opt.label}
                                                {opt.alert && <AlertCircle size={14} className="text-red-500" />}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Format d&apos;export</label>
                                <div className="flex gap-3">
                                    {[
                                        { value: 'pdf', label: 'PDF', active: 'border-red-500 bg-red-50 text-red-700' },
                                        { value: 'excel', label: 'Excel', active: 'border-green-500 bg-green-50 text-green-700' },
                                        { value: 'csv', label: 'CSV', active: 'border-blue-500 bg-blue-50 text-blue-700' },
                                    ].map(fmt => (
                                        <label
                                            key={fmt.value}
                                            className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition ${
                                                exportForm.data.format === fmt.value
                                                    ? fmt.active
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="format"
                                                value={fmt.value}
                                                checked={exportForm.data.format === fmt.value}
                                                onChange={e => exportForm.setData('format', e.target.value)}
                                                className="sr-only"
                                            />
                                            <span className="font-bold">{fmt.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-3">
                                    Période : du {filterForm.data.from} au {filterForm.data.to}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-700 transition shadow-md shadow-primary-600/20"
                            >
                                <FileDown size={18} />
                                Télécharger le rapport
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
}
