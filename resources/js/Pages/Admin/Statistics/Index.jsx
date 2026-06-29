import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency } from '@/lib/formatCurrency';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';

function EvolutionBadge({ data, label }) {
    const isUp = data.trend === 'up';
    const Icon = isUp ? TrendingUp : TrendingDown;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">
                {label.includes('CA') || label.includes('commission')
                    ? formatCurrency(data.current)
                    : data.current.toLocaleString('fr-FR')}
            </p>
            <div className={`inline-flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                <Icon size={16} />
                {data.change >= 0 ? '+' : ''}{data.change}%
            </div>
            <p className="text-xs text-gray-400 mt-1">
                vs {label.includes('commission') ? formatCurrency(data.previous) : data.previous.toLocaleString('fr-FR')} (période 2)
            </p>
        </div>
    );
}

function DataTable({ title, columns, rows, emptyMessage }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                            {columns.map((col) => (
                                <th key={col.key} className="px-4 py-3">{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.length > 0 ? rows.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-gray-700">
                                        {col.format ? col.format(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function StatisticsIndex({ period1, period2, comparison, filters }) {
    const [p1From, setP1From] = useState(filters.p1_from);
    const [p1To, setP1To] = useState(filters.p1_to);
    const [p2From, setP2From] = useState(filters.p2_from);
    const [p2To, setP2To] = useState(filters.p2_to);

    const applyFilters = (e) => {
        e.preventDefault();
        router.get('/admin/statistics', {
            p1_from: p1From,
            p1_to: p1To,
            p2_from: p2From,
            p2_to: p2To,
        }, { preserveState: true });
    };

    return (
        <>
            <Head title="Statistiques" />
            <AdminLayout title="Tableau de bord statistiques">
                <p className="text-gray-500 mb-6">
                    Analyse des ventes avec comparaison entre deux périodes.
                </p>

                <form onSubmit={applyFilters} className="bg-white rounded-xl border border-gray-200 p-5 mb-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar size={18} className="text-primary-600" />
                        <h2 className="font-bold text-gray-900">Filtres de période</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Période 1</p>
                            <div className="flex gap-2">
                                <input type="date" value={p1From} onChange={(e) => setP1From(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1" />
                                <span className="self-center text-gray-400">→</span>
                                <input type="date" value={p1To} onChange={(e) => setP1To(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Période 2 (comparaison)</p>
                            <div className="flex gap-2">
                                <input type="date" value={p2From} onChange={(e) => setP2From(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1" />
                                <span className="self-center text-gray-400">→</span>
                                <input type="date" value={p2To} onChange={(e) => setP2To(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1" />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="mt-4 px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
                        Appliquer
                    </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <EvolutionBadge data={comparison.sales} label="Évolution des ventes" />
                    <EvolutionBadge data={comparison.revenue} label="Évolution du CA" />
                    <EvolutionBadge data={comparison.commissions} label="Évolution des commissions" />
                </div>

                <div className="mb-4 flex items-center gap-2">
                    <BarChart3 size={18} className="text-primary-600" />
                    <h2 className="font-bold text-gray-900">Période 1 : {period1.label}</h2>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
                    <DataTable
                        title="Ventes par vendeur"
                        columns={[
                            { key: 'seller_name', label: 'Vendeur' },
                            { key: 'order_count', label: 'Commandes' },
                            { key: 'revenue', label: 'CA', format: (v) => formatCurrency(v) },
                            { key: 'commissions', label: 'Commissions', format: (v) => formatCurrency(v) },
                        ]}
                        rows={period1.by_seller}
                        emptyMessage="Aucune vente sur cette période."
                    />
                    <DataTable
                        title="Ventes par produit"
                        columns={[
                            { key: 'product_name', label: 'Produit' },
                            { key: 'units_sold', label: 'Qté vendue' },
                            { key: 'revenue', label: 'Revenu', format: (v) => formatCurrency(v) },
                        ]}
                        rows={period1.by_product}
                        emptyMessage="Aucune vente produit."
                    />
                    <DataTable
                        title="Ventes par catégorie"
                        columns={[
                            { key: 'category_name', label: 'Catégorie' },
                            { key: 'units_sold', label: 'Ventes' },
                            { key: 'revenue', label: 'Revenus', format: (v) => formatCurrency(v) },
                        ]}
                        rows={period1.by_category}
                        emptyMessage="Aucune vente par catégorie."
                    />
                    <DataTable
                        title="Ventes par sous-catégorie"
                        columns={[
                            { key: 'subcategory_name', label: 'Sous-catégorie' },
                            { key: 'units_sold', label: 'Ventes' },
                            { key: 'revenue', label: 'Revenus', format: (v) => formatCurrency(v) },
                        ]}
                        rows={period1.by_subcategory}
                        emptyMessage="Aucune vente par sous-catégorie."
                    />
                </div>
            </AdminLayout>
        </>
    );
}
