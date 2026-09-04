import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/UI/Pagination';
import {
    ArrowLeft, TrendingUp, TrendingDown, ShoppingBag, Package, Star,
    DollarSign, User, MapPin, BarChart2, Award, AlertCircle,
    ShieldAlert, Ban, Eye, Filter, X, Clock,
    ChevronLeft, ChevronRight, ShoppingCart, Tag, BarChart3, PieChart,
} from 'lucide-react';

const fmt = (n) => parseFloat(n || 0).toLocaleString('fr-CD', { minimumFractionDigits: 0 });

const StatusBadge = ({ status }) => {
    const map = {
        delivered: 'bg-green-100 text-green-800',
        pending:   'bg-amber-100 text-amber-800',
        confirmed: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-red-100 text-red-800',
        rejected:  'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

const ProductStatusBadge = ({ status }) => {
    const config = {
        active:   { color: 'bg-green-100 text-green-800',  label: 'Actif',            icon: Award },
        pending:  { color: 'bg-amber-100 text-amber-800',   label: 'En attente',       icon: Clock },
        rejected: { color: 'bg-red-100 text-red-800',       label: 'Rejeté',           icon: AlertCircle },
        inactive: { color: 'bg-gray-100 text-gray-800',     label: 'Inactif',          icon: Package },
        blocked:  { color: 'bg-red-200 text-red-900',       label: 'Bloqué',           icon: ShieldAlert },
    };
    const entry = config[status] || config.inactive;
    const Icon = entry.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${entry.color}`}>
            <Icon size={10} />
            {entry.label}
        </span>
    );
};

const ProductRow = ({ product, sellerSlug, onBlock }) => {
    const [blocking, setBlocking] = useState(false);
    const imageUrl = product.images?.[0]?.image_path
        ? `/storage/${product.images[0].image_path}`
        : '/placeholder-product.png';

    const handleBlock = () => {
        const reason = prompt('Raison du blocage (vente illégale, contrefaçon, etc.) :', 'vente de produit illégal');
        if (!reason) return;
        setBlocking(true);
        router.patch(`/admin/products/${product.id}/block`, { reason: reason.trim() || undefined }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setBlocking(false),
        });
    };

    const handleUnblock = () => {
        if (!confirm('Débloquer ce produit ?')) return;
        setBlocking(true);
        router.patch(`/admin/products/${product.id}/unblock`, {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setBlocking(false),
        });
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-3 sm:px-6 py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {product.images?.[0]?.image_path ? (
                            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <Package size={18} className="text-gray-400" />
                        )}
                    </div>
                    <div className="min-w-0 max-w-[180px] sm:max-w-[250px]">
                        <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{product.category?.name ?? 'N/A'}</p>
                    </div>
                </div>
            </td>
            <td className="px-3 sm:px-6 py-3 font-medium text-gray-900 text-sm whitespace-nowrap">
                {fmt(product.price)} FC
            </td>
            <td className="px-3 sm:px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                {product.confirmed_sales}
            </td>
            <td className="px-3 sm:px-6 py-3">
                <ProductStatusBadge status={product.status} />
            </td>
            <td className="px-3 sm:px-6 py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                    {product.status === 'blocked' ? (
                        <button
                            onClick={handleUnblock}
                            disabled={blocking}
                            className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition-colors disabled:opacity-50"
                            title="Débloquer"
                        >
                            <Award size={12} />
                        </button>
                    ) : (
                        <button
                            onClick={handleBlock}
                            disabled={blocking}
                            className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium transition-colors disabled:opacity-50"
                            title="Bloquer (vente illégale)"
                        >
                            <ShieldAlert size={12} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default function SellerStatistics({
    seller, orders, orderFilters, totalRevenue, totalOrders, totalProducts,
    topProducts, bottomProducts, byCategory, productStatus, filteredProducts,
}) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');

    const handleOrderFilter = (status) => {
        router.get(`/admin/sellers/${seller.slug}/statistics`, { order_status: status }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleProductFilter = (status) => {
        router.get(`/admin/sellers/${seller.slug}/statistics`, { product_status: status }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const tabs = [
        { id: 'overview',   label: 'Aperçu',         icon: BarChart3 },
        { id: 'products',   label: 'Produits',       icon: Package },
        { id: 'orders',     label: 'Commandes',      icon: ShoppingCart },
        { id: 'analytics',  label: 'Analytique',     icon: PieChart },
    ];

    const orderStatusFilters = [
        { value: 'all',    label: 'Toutes' },
        { value: 'pending', label: 'En attente' },
        { value: 'confirmed', label: 'Confirmées' },
        { value: 'delivered', label: 'Livrées' },
        { value: 'cancelled', label: 'Annulées' },
        { value: 'rejected', label: 'Rejetées' },
    ];

    const productStatusFilters = [
        { value: 'all',      label: 'Tous' },
        { value: 'active',   label: 'Actifs' },
        { value: 'pending',  label: 'En attente' },
        { value: 'blocked',  label: 'Bloqués' },
        { value: 'inactive', label: 'Inactifs' },
        { value: 'rejected', label: 'Rejetés' },
    ];

    const renderProductList = (products) => (
        <div className="overflow-x-auto">
            {products.length > 0 ? (
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b border-gray-200">
                        <tr>
                            <th className="px-3 sm:px-6 py-3">Produit</th>
                            <th className="px-3 sm:px-6 py-3">Prix</th>
                            <th className="px-3 sm:px-6 py-3">Ventes</th>
                            <th className="px-3 sm:px-6 py-3">Statut</th>
                            <th className="px-3 sm:px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map(product => (
                            <ProductRow
                                key={product.id}
                                product={product}
                                sellerSlug={seller.slug}
                            />
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="py-12 text-center text-gray-400">
                    <Package size={36} className="mx-auto mb-3 opacity-30" />
                    <p>Aucun produit trouvé.</p>
                </div>
            )}
        </div>
    );

    const TopBottomProduct = ({ product, rank, isTop }) => {
        const imageUrl = product.images?.[0]?.image_path
            ? `/storage/${product.images[0].image_path}`
            : '/placeholder-product.png';

        const handleBlock = () => {
            const reason = prompt('Raison du blocage :', 'vente de produit illégal');
            if (!reason) return;
            router.patch(`/admin/products/${product.id}/block`, { reason: reason.trim() || undefined }, {
                preserveState: true,
                preserveScroll: true,
            });
        };

        return (
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isTop ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-500'
                }`}>
                    {rank}
                </span>
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {product.images?.[0]?.image_path ? (
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Package size={18} className="text-gray-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate max-w-[150px] sm:max-w-full">{product.name}</p>
                    <p className="text-xs text-gray-500 truncate">{product.category?.name ?? 'N/A'}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">{product.confirmed_sales} ventes</p>
                    <p className="text-xs text-gray-400">{fmt(product.price)} FC</p>
                </div>
                {product.status !== 'blocked' && (
                    <button
                        onClick={handleBlock}
                        title="Bloquer ce produit"
                        className="ml-2 shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <ShieldAlert size={12} />
                    </button>
                )}
            </div>
        );
    };

    return (
        <>
            <Head title={`Statistiques – ${seller.business_name}`} />
            <AdminLayout title="Profil Vendeur & Statistiques">

                {/* ── Back + Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                    <Link
                        href="/admin/sellers"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft size={15} /> Retour aux vendeurs
                    </Link>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/admin/sellers/${seller.slug}/statistics`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors"
                        >
                            <BarChart3 size={14} /> Vue statistiques
                        </Link>
                        <Link
                            href={`/admin/sellers/${seller.slug}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium transition-colors whitespace-nowrap"
                        >
                            <Eye size={14} /> Fiche complète
                        </Link>
                    </div>
                </div>

                {/* ── Seller Info Header ── */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-4 sm:p-6 text-white mb-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden">
                            {seller.logo ? (
                                <img
                                    src={`/storage/${seller.logo}`}
                                    alt={seller.business_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                seller.business_name?.[0]?.toUpperCase() ?? 'S'
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-xl font-bold truncate">{seller.business_name}</h2>
                            <div className="flex items-center gap-2 text-slate-300 text-sm mt-0.5 truncate">
                                <User size={13} /> {seller.user?.name}
                                <span>·</span>
                                <MapPin size={13} /> {seller.city}, {seller.country}
                            </div>
                        </div>
                        <div className="ml-auto shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                seller.status === 'verified' ? 'bg-green-400/20 text-green-200' :
                                seller.status === 'suspended' ? 'bg-red-400/20 text-red-200' :
                                seller.status === 'blocked' ? 'bg-red-400/30 text-red-200' :
                                'bg-amber-400/20 text-amber-200'
                            }`}>
                                {seller.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Flash ── */}
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {/* ── Tabs ── */}
                <div className="flex flex-col sm:flex-row gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1 shadow-sm overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                    isActive
                                        ? 'bg-slate-800 text-white shadow'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Tab: Overview ── */}
                {activeTab === 'overview' && (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                        <DollarSign size={18} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">CA Total</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {fmt(totalRevenue)} <span className="text-sm font-normal text-gray-400">FC</span>
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                        <ShoppingBag size={18} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Commandes</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Package size={18} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Produits</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalProducts.toLocaleString()}</p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                        <Star size={18} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Note</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {parseFloat(seller.average_rating || 0).toFixed(1)}
                                    <span className="text-sm font-normal text-gray-400">/5</span>
                                </p>
                            </div>
                        </div>

                        {/* Top & Bottom Products with images */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* ── Top Products ── */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                    <Award size={16} className="text-amber-500" />
                                    <h3 className="font-bold text-gray-900">Top 5 Produits (+ vendus)</h3>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {topProducts.length > 0 ? topProducts.map((product, i) => (
                                        <TopBottomProduct
                                            key={product.id}
                                            product={product}
                                            rank={i + 1}
                                            isTop={true}
                                        />
                                    )) : (
                                        <p className="px-5 py-8 text-center text-sm text-gray-400">Aucun produit trouvé.</p>
                                    )}
                                </div>
                            </div>

                            {/* ── Bottom Products ── */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-red-400" />
                                    <h3 className="font-bold text-gray-900">Top 5 Produits (- vendus)</h3>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {bottomProducts.length > 0 ? bottomProducts.map((product, i) => (
                                        <TopBottomProduct
                                            key={product.id}
                                            product={product}
                                            rank={i + 1}
                                            isTop={false}
                                        />
                                    )) : (
                                        <p className="px-5 py-8 text-center text-sm text-gray-400">Aucun produit trouvé.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Category Breakdown ── */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                <PieChart size={16} className="text-blue-500" />
                                <h3 className="font-bold text-gray-900">Ventes par Catégorie</h3>
                            </div>
                            <div className="overflow-x-auto">
                                {byCategory.length > 0 ? (
                                    <table className="w-full text-sm text-left text-gray-600">
                                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3">Catégorie</th>
                                                <th className="px-4 py-3 text-right">Produits</th>
                                                <th className="px-4 py-3 text-right">Ventes</th>
                                                <th className="px-4 py-3 text-right">Revenu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {byCategory.map((cat, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                                                    <td className="px-4 py-3 text-right">{cat.products}</td>
                                                    <td className="px-4 py-3 text-right">{cat.sales}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">{fmt(cat.revenue)} FC</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="py-8 text-center text-gray-400 text-sm">Aucune donnée disponible.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* ── Tab: Products ── */}
                {activeTab === 'products' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* ── Product Status Filter ── */}
                        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Package size={16} />
                                Produits du vendeur
                            </h3>
                            <div className="flex-1" />
                            <div className="flex flex-wrap items-center gap-1.5">
                                {productStatusFilters.map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => handleProductFilter(f.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            productStatus === f.value
                                                ? 'bg-slate-800 text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs text-gray-400 ml-2">
                                {filteredProducts.length} produit(s)
                            </span>
                        </div>

                        {renderProductList(filteredProducts)}
                    </div>
                )}

                {/* ── Tab: Orders ── */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* ── Order Status Filter ── */}
                        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingCart size={16} />
                                Historique des commandes
                            </h3>
                            <div className="flex-1" />
                            <div className="flex flex-wrap items-center gap-1.5">
                                {orderStatusFilters.map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => handleOrderFilter(f.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            (orderFilters?.order_status || 'all') === f.value
                                                ? 'bg-slate-800 text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {orders.data.length > 0 ? (
                                <>
                                    <table className="w-full text-sm text-left text-gray-600">
                                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3">N° Commande</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Acheteur</th>
                                                <th className="px-4 py-3">Produits</th>
                                                <th className="px-4 py-3 text-right">Total</th>
                                                <th className="px-4 py-3">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orders.data.map(order => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700 whitespace-nowrap">
                                                        {order.order_number}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                        {new Date(order.created_at).toLocaleDateString('fr-CD')}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {order.buyer?.user?.name ?? 'N/A'}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-[200px] truncate text-xs text-gray-500">
                                                        {order.items?.map(i => i.product_name).join(', ') || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900 whitespace-nowrap">
                                                        {fmt(order.total)} {order.currency}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status={order.status} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <Pagination links={orders.links} />
                                </>
                            ) : (
                                <div className="py-12 text-center text-gray-400">
                                    <ShoppingBag size={36} className="mx-auto mb-3 opacity-30" />
                                    <p>Aucune commande pour ce vendeur.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Tab: Analytics ── */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {/* Analytics KPI Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-2">
                                    <TrendingUp size={20} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{fmt(topProducts.reduce((sum, p) => sum + p.confirmed_sales, 0))}</p>
                                <p className="text-xs text-gray-500 mt-1">Ventes Top Produits</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-2">
                                    <DollarSign size={20} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{fmt(topProducts.reduce((sum, p) => sum + (p.price * p.confirmed_sales), 0))}</p>
                                <p className="text-xs text-gray-500 mt-1">CA Top Produits</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 mx-auto mb-2">
                                    <Star size={20} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{parseFloat(seller.average_rating || 0).toFixed(1)}</p>
                                <p className="text-xs text-gray-500 mt-1">Note Moyenne</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 mx-auto mb-2">
                                    <Tag size={20} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{seller.strikes ?? 0}</p>
                                <p className="text-xs text-gray-500 mt-1">Signalements</p>
                            </div>
                        </div>

                        {/* Trust & Safety Info */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                <ShieldAlert size={16} className="text-slate-600" />
                                <h3 className="font-bold text-gray-900">Sécurité & Confiance</h3>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{seller.trust_score ?? 0}</p>
                                        <p className="text-xs text-gray-500">Score de confiance</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{seller.total_reviews ?? 0}</p>
                                        <p className="text-xs text-gray-500">Avis total</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{seller.total_views ?? 0}</p>
                                        <p className="text-xs text-gray-500">Vues totales</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{seller.response_rate ?? 0}%</p>
                                        <p className="text-xs text-gray-500">Taux de réponse</p>
                                    </div>
                                </div>
                                {seller.trust_badges?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                        {seller.trust_badges.map(badge => (
                                            <span key={badge} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </AdminLayout>
        </>
    );
}
