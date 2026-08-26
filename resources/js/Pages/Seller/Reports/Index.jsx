import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { formatCurrency } from '@/lib/formatCurrency';
import { FileDown, Package, DollarSign, ShoppingCart, TrendingUp, Calendar, Download, ChevronDown, ChevronUp, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react';

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

function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatDateFull(date) {
    return new Date(date).toLocaleDateString('fr-FR');
}

export default function ReportsIndex({ stats, revenueTrend, topProducts, recentOrders, downloadRequests = [], filters }) {
    const filterForm = useForm({ from: filters.from, to: filters.to });
    const requestForm = useForm({ type: 'sales', format: 'pdf', from: filters.from, to: filters.to });
    const [showDownloadForm, setShowDownloadForm] = useState(false);
    const [activeTab, setActiveTab] = useState('chart');

    const applyFilter = (e) => {
        e.preventDefault();
        router.get('/seller/reports', { from: filterForm.data.from, to: filterForm.data.to }, { preserveState: true });
    };

    const submitRequest = (e) => {
        e.preventDefault();
        requestForm.transform(data => ({ ...data, from: filterForm.data.from, to: filterForm.data.to }))
            .post('/seller/reports/request', { preserveScroll: true });
    };

    const maxRevenue = Math.max(...revenueTrend.map(d => d.amount), 1);

    const statItems = [
        { icon: DollarSign, label: 'Revenus', value: formatCurrency(stats.total_revenue), color: 'bg-green-100 text-green-600' },
        { icon: ShoppingCart, label: 'Commandes', value: stats.total_orders, sub: `${stats.delivered} livrées`, color: 'bg-blue-100 text-blue-600' },
        { icon: TrendingUp, label: 'Panier moyen', value: formatCurrency(stats.avg_order_value), color: 'bg-indigo-100 text-indigo-600' },
        { icon: Package, label: 'Produits', value: stats.total_products, color: 'bg-purple-100 text-purple-600' },
        { icon: Clock, label: 'En attente', value: stats.pending, color: 'bg-amber-100 text-amber-600' },
        { icon: CheckCircle, label: 'Livrées', value: stats.delivered, color: 'bg-emerald-100 text-emerald-600' },
    ];

    return (
        <SellerLayout>
            <Head title="Rapports et analyses" />

            {/* Pleine largeur : annule le padding du layout */}
            <div className="-mt-4 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="px-4 sm:px-6 lg:px-8 pb-4">

            {/* Header compact */}
            <div className="mb-5 pt-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rapports et analyses</h1>
                <p className="text-sm text-gray-500 mt-0.5">Aperçu des ventes et tendances de votre boutique.</p>
            </div>

            {/* Filtre de période - compact */}
            <form onSubmit={applyFilter} className="mb-5 flex flex-wrap items-end gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Du</label>
                    <input type="date" value={filterForm.data.from} onChange={e => filterForm.setData('from', e.target.value)} className="w-full border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Au</label>
                    <input type="date" value={filterForm.data.to} onChange={e => filterForm.setData('to', e.target.value)} className="w-full border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <button type="submit" className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                    <Calendar size={14} />
                    <span className="hidden sm:inline">Appliquer</span>
                </button>
            </form>

            {/* Stats - scrollable horizontal sur mobile, grid sur desktop */}
            <div className="mb-5 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-thin">
                <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 min-w-max sm:min-w-0">
                    {statItems.map((item, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 w-[140px] sm:w-auto shrink-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center`}>
                                    <item.icon size={16} />
                                </div>
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{item.value}</p>
                            <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                            {item.sub && <p className="text-[10px] text-gray-400">{item.sub}</p>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Zone principale : Chart + Top produits */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
                    {/* Tabs mobile */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                            <button onClick={() => setActiveTab('chart')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${activeTab === 'chart' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                                <BarChart3 size={14} className="inline mr-1" /> Tendance
                            </button>
                            <button onClick={() => setActiveTab('products')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${activeTab === 'products' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                                <Package size={14} className="inline mr-1" /> Produits
                            </button>
                        </div>
                        <span className="text-xs text-gray-400 hidden sm:block">{filters.from} — {filters.to}</span>
                    </div>

                    {/* Chart content */}
                    <div className={activeTab === 'chart' ? 'block' : 'hidden lg:block'}>
                        {revenueTrend.length > 0 ? (
                            <div className="h-44 sm:h-52 flex items-end justify-between gap-1 sm:gap-2">
                                {revenueTrend.map((data, i) => {
                                    const heightPct = (data.amount / maxRevenue) * 100;
                                    return (
                                        <div key={i} className="flex flex-col items-center flex-1 group relative min-w-0">
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity z-10 pointer-events-none">
                                                {formatCurrency(data.amount)}
                                            </div>
                                            <div className="w-full max-w-[32px] sm:max-w-[40px] h-32 sm:h-40 bg-primary-50 rounded-t-md relative flex items-end">
                                                <div className="w-full bg-primary-500 rounded-t-md transition-all duration-500" style={{ height: `${Math.max(heightPct, data.amount > 0 ? 4 : 1)}%` }} />
                                            </div>
                                            <div className="mt-1.5 text-[9px] sm:text-[10px] text-gray-500 truncate w-full text-center">{data.date}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">Aucune donnée pour cette période.</div>
                        )}
                    </div>

                    {/* Top Products - visible on lg+ or when tab active */}
                    <div className={`mt-4 lg:hidden ${activeTab === 'products' ? 'block' : 'hidden'}`}>
                        <TopProductsList topProducts={topProducts} />
                    </div>
                </div>

                {/* Top Products - desktop only */}
                <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 text-sm">Meilleurs produits</h2>
                        <p className="text-xs text-gray-500">Par revenus</p>
                    </div>
                    <TopProductsList topProducts={topProducts} />
                </div>
            </div>

            {/* Commandes récentes - compact */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-5">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 text-sm">Commandes sur la période</h2>
                    <span className="text-xs text-gray-500">{recentOrders.length} affichée{recentOrders.length !== 1 ? 's' : ''}</span>
                </div>

                {recentOrders.length > 0 ? (
                    <>
                        {/* Table desktop */}
                        <div className="hidden md:block overflow-x-auto scrollbar-thin">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        <th className="px-4 py-2.5">N° commande</th>
                                        <th className="px-4 py-2.5">Date</th>
                                        <th className="px-4 py-2.5">Acheteur</th>
                                        <th className="px-4 py-2.5 text-center">Articles</th>
                                        <th className="px-4 py-2.5 text-right">Total</th>
                                        <th className="px-4 py-2.5">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2.5 font-semibold text-gray-900 text-xs">{order.order_number}</td>
                                            <td className="px-4 py-2.5 text-gray-600 text-xs">{formatDateFull(order.created_at)}</td>
                                            <td className="px-4 py-2.5 text-gray-600 text-xs">{order.buyer?.user?.name ?? 'N/D'}</td>
                                            <td className="px-4 py-2.5 text-gray-600 text-xs text-center">{order.items?.length ?? 0}</td>
                                            <td className="px-4 py-2.5 font-medium text-gray-900 text-xs text-right">{formatCurrency(order.total_amount)}</td>
                                            <td className="px-4 py-2.5">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                    {statusLabels[order.status] ?? order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cards mobile */}
                        <div className="md:hidden divide-y divide-gray-100 max-h-80 overflow-y-auto">
                            {recentOrders.map(order => (
                                <div key={order.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 text-xs truncate">{order.order_number}</p>
                                        <p className="text-[11px] text-gray-500">{order.buyer?.user?.name ?? 'N/D'} · {order.items?.length ?? 0} art.</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-gray-900 text-xs">{formatCurrency(order.total_amount)}</p>
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {statusLabels[order.status] ?? order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">Aucune commande pour cette période.</div>
                )}
            </div>

            {/* Téléchargement - accordéon */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-5">
                <button onClick={() => setShowDownloadForm(!showDownloadForm)} className="w-full p-4 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center shrink-0">
                            <Download size={18} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-sm">Demander un téléchargement</h2>
                            <p className="text-xs text-gray-500">Rapport envoyé à l'admin pour approbation</p>
                        </div>
                    </div>
                    {showDownloadForm ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>

                {showDownloadForm && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                        <form onSubmit={submitRequest} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Type de rapport</label>
                                    <div className="space-y-1.5">
                                        {[
                                            { value: 'sales', label: 'Ventes et revenus' },
                                            { value: 'products', label: 'Inventaire produits' },
                                            { value: 'stock', label: 'Alertes stock bas' },
                                        ].map(opt => (
                                            <label key={opt.value} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-sm ${requestForm.data.type === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                                <input type="radio" name="type" value={opt.value} checked={requestForm.data.type === opt.value} onChange={e => requestForm.setData('type', e.target.value)} className="text-primary-600" />
                                                <span className="font-medium">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Format</label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: 'pdf', label: 'PDF', active: 'border-red-500 bg-red-50 text-red-700' },
                                            { value: 'excel', label: 'Excel', active: 'border-green-500 bg-green-50 text-green-700' },
                                            { value: 'csv', label: 'CSV', active: 'border-blue-500 bg-blue-50 text-blue-700' },
                                        ].map(fmt => (
                                            <label key={fmt.value} className={`flex-1 flex items-center justify-center p-2 rounded-lg border cursor-pointer transition text-sm ${requestForm.data.format === fmt.value ? fmt.active : 'border-gray-200 hover:bg-gray-50'}`}>
                                                <input type="radio" name="format" value={fmt.value} checked={requestForm.data.format === fmt.value} onChange={e => requestForm.setData('format', e.target.value)} className="sr-only" />
                                                <span className="font-bold">{fmt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2">Période : du {filterForm.data.from} au {filterForm.data.to}</p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-3 border-t border-gray-100">
                                <button type="submit" disabled={requestForm.processing} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 transition disabled:opacity-50">
                                    <FileDown size={16} />
                                    {requestForm.processing ? 'Envoi…' : 'Demander'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Demandes récentes */}
            {downloadRequests.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 text-sm">Demandes récentes</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {downloadRequests.map((req) => (
                            <div key={req.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">{req.report_type} · {req.format.toUpperCase()}</p>
                                    <p className="text-[11px] text-gray-500">{req.date_from} → {req.date_to}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {req.status === 'approved' && <CheckCircle size={14} className="text-green-500" />}
                                    {req.status === 'rejected' && <XCircle size={14} className="text-red-500" />}
                                    {req.status === 'pending' && <Clock size={14} className="text-amber-500" />}
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {req.status === 'approved' ? 'Approuvé' : req.status === 'rejected' ? 'Refusé' : 'En attente'}
                                    </span>
                                    {req.status === 'approved' && req.download_token && (
                                        <a href={`/seller/reports/download/${req.id}?token=${req.download_token}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
                                            <Download size={12} />
                                            <span className="hidden sm:inline">Télécharger</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </div>
            </div>
        </SellerLayout>
    );
}

function TopProductsList({ topProducts }) {
    if (topProducts.length === 0) {
        return <div className="p-6 text-center text-gray-400 text-xs">Aucune vente sur cette période.</div>;
    }
    return (
        <div className="divide-y divide-gray-100 max-h-60 lg:max-h-72 overflow-y-auto">
            {topProducts.map((product, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-500">{product.units_sold} vendu{product.units_sold !== 1 ? 's' : ''}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-900 shrink-0">{formatCurrency(product.revenue)}</p>
                </div>
            ))}
        </div>
    );
}
