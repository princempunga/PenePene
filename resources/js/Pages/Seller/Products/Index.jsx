import React, { useState } from 'react';
import useTranslation from '@/hooks/useTranslation';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { formatCurrency } from '@/lib/formatCurrency';
import SellerLayout from '@/Layouts/SellerLayout';
import Pagination from '@/Components/UI/Pagination';
import { Plus, Edit, Trash2, Eye, Package, Search, Folder, Tag, DollarSign, Layers, Check, ToggleLeft, ToggleRight } from 'lucide-react';

const statusColors = {
    pending:  'bg-amber-100 text-amber-800',
    active:   'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
};

const statusLabels = {
    pending:  'En attente',
    active:   'Actif',
    inactive: 'Inactif',
    rejected: 'Rejeté',
};

const filterLabels = {
    all:      'Tous',
    pending:  'En attente',
    active:   'Actif',
    inactive: 'Inactif',
    rejected: 'Rejeté',
};

function getPrimaryImage(product) {
    const images = product.images || [];
    const primary = images.find((img) => img.is_primary);
    return primary?.image_path || images[0]?.image_path;
}

function stripHtml(text = '') {
    return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getProductExcerpt(description = '', maxLength = 110) {
    const plainText = stripHtml(description);
    if (!plainText) {
        return 'Aucune description détaillée pour le moment.';
    }

    return plainText.length > maxLength ? `${plainText.slice(0, maxLength).trim()}…` : plainText;
}

export default function ProductsIndex({ products, filters = {} }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const { delete: destroy, processing } = useForm({});
    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const allSelected = products.data.length > 0 && products.data.every((product) => selectedIds.includes(product.id));
    const selectedCount = selectedIds.length;

    const toggleProductSelection = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds(products.data.map((product) => product.id));
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'single') {
            destroy(`/seller/products/${deleteTarget.id}`, {
                onSuccess: () => setDeleteTarget(null),
            });
            return;
        }

        router.post('/seller/products/bulk-delete', { ids: deleteTarget.ids }, {
            preserveState: true,
            onSuccess: () => {
                setSelectedIds([]);
                setDeleteTarget(null);
            },
        });
    };

    const handleDelete = (id) => {
        setDeleteTarget({ type: 'single', id });
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setDeleteTarget({ type: 'bulk', ids: selectedIds });
    };

    const handleFilter = (status) => {
        router.get('/seller/products', {
            search: filters.search || '',
            status: status === 'all' ? '' : status,
        }, { preserveState: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/seller/products', {
            search,
            status: filters.status || '',
        }, { preserveState: true });
    };

    const hasFilters = filters.search || filters.status;
    const isEmpty = products.data.length === 0;

    return (
        <>
            <Head title="Mes produits" />
            <SellerLayout title="Mes produits">
                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.12em] text-gray-400 font-semibold">Confirmation</p>
                                    <h3 className="text-lg font-bold text-gray-900 mt-1">
                                        {deleteTarget.type === 'single' ? 'Supprimer ce produit ?' : `Supprimer ${deleteTarget.ids.length} produit${deleteTarget.ids.length > 1 ? 's' : ''} ?`}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget(null)}
                                    className="text-gray-400 hover:text-gray-700 transition-colors"
                                    aria-label="Fermer"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M18 6 6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <p className="text-sm text-gray-600">
                                {deleteTarget.type === 'single'
                                    ? 'Cette action supprimera définitivement ce produit de votre boutique.'
                                    : 'Cette action supprimera définitivement les produits sélectionnés de votre boutique.'}
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={processing}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                                >
                                    {processing ? 'Suppression…' : 'Supprimer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <p className="text-gray-500">Gérez l'inventaire de votre boutique.</p>
                    <Link
                        href="/seller/products/create"
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm shrink-0"
                    >
                        <Plus size={16} />
                        Publier des produits
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher des produits..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Rechercher
                        </button>
                    </form>

                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm overflow-x-auto">
                        {['all', 'pending', 'active', 'inactive', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleFilter(status)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                                    (filters.status === status) || (!filters.status && status === 'all')
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {filterLabels[status]}
                            </button>
                        ))}
                    </div>
                </div>

                {!isEmpty ? (
                    <>
                        {selectedCount > 0 && (
                            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-2 text-sm font-medium text-primary-800">
                                    <Check size={16} />
                                    {selectedCount} produit{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                                >
                                    Supprimer la sélection ({selectedCount})
                                </button>
                            </div>
                        )}

                        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                Tout sélectionner
                            </label>
                        </div>

                        <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:overflow-visible">
                            <div className="w-full overflow-x-auto lg:overflow-visible scrollbar-thin">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="sticky top-0 z-10 text-gray-700 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-4 w-12 bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={toggleSelectAll}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                            </th>
                                            <th className="px-4 py-4 bg-gray-50">Produit</th>
                                            <th className="px-4 py-4 bg-gray-50">Catégorie</th>
                                            <th className="px-4 py-4 bg-gray-50">Prix</th>
                                            <th className="px-4 py-4 bg-gray-50">Stock</th>
                                            <th className="px-4 py-4 bg-gray-50">Statut</th>
                                            <th className="px-4 py-4 text-right bg-gray-50">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.data.map((product) => {
                                            const imgPath = getPrimaryImage(product);
                                            const availableStock = product.initial_stock - product.confirmed_sales;
                                            const isSelected = selectedIds.includes(product.id);

                                            return (
                                                <tr key={product.id} className={`transition-colors ${isSelected ? 'bg-primary-50/30' : 'hover:bg-gray-50'}`}>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleProductSelection(product.id)}
                                                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 font-medium text-gray-900">
                                                        <div className="flex items-center gap-3">
                                                            <Link href={`/seller/products/${product.id}`} className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 overflow-hidden shrink-0 hover:ring-2 hover:ring-primary-300 transition-all">
                                                                {imgPath ? (
                                                                    <img src={`/storage/${imgPath}`} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Package size={18} />
                                                                )}
                                                            </Link>
                                                            <Link href={`/seller/products/${product.id}`} className="truncate max-w-[200px] hover:text-primary-600 transition-colors" title={product.name}>
                                                                {product.name}
                                                            </Link>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">{product.category?.name || 'Sans catégorie'}</td>
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <span className="font-semibold text-gray-900">
                                                                 {formatCurrency(product.sale_price || product.price, { currency: product.currency || 'CDF' })}
                                                            </span>
                                                            {product.sale_price && (
                                                                <span className="block text-xs line-through text-gray-400">
                                                                     {formatCurrency(product.price, { currency: product.currency || 'CDF' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={availableStock <= 0 ? 'text-red-600 font-medium' : ''}>
                                                            {availableStock}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                                                            {statusLabels[product.status] || product.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="inline-flex items-center gap-2">
                                                            <Link href={`/seller/products/${product.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors" title="Voir">
                                                                <Eye size={16} />
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    if (!confirm(`Voulez-vous ${product.status === 'active' ? 'désactiver' : 'activer'} ce produit ?`)) return;
                                                                    router.patch(`/seller/products/${product.id}/toggle`, {}, {
                                                                        preserveState: true,
                                                                        onSuccess: () => {},
                                                                    });
                                                                }}
                                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                                                                    product.status === 'active'
                                                                        ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                                                                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                                                                }`}
                                                                title={product.status === 'active' ? 'Désactiver' : 'Activer'}
                                                            >
                                                                {product.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                            </button>
                                                            <Link href={`/seller/products/${product.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Modifier">
                                                                <Edit size={16} />
                                                            </Link>
                                                            <button onClick={() => handleDelete(product.id)} disabled={processing} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50" title="Supprimer">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="hidden md:block lg:hidden space-y-3">
                            {products.data.map((product) => {
                                const imgPath = getPrimaryImage(product);
                                const availableStock = product.initial_stock - product.confirmed_sales;
                                const isSelected = selectedIds.includes(product.id);

                                return (
                                    <div key={product.id} className={`bg-white rounded-xl border ${isSelected ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200'} shadow-sm p-3`}>
                                        <div className="flex gap-3">
                                            <div className="flex items-start gap-2 shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleProductSelection(product.id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-0.5"
                                                />
                                                <Link href={`/seller/products/${product.id}`} className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden shrink-0 hover:ring-2 hover:ring-primary-300 transition-all">
                                                    {imgPath ? (
                                                        <img src={`/storage/${imgPath}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={20} />
                                                    )}
                                                </Link>
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
                                                <div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <Link href={`/seller/products/${product.id}`} className="font-bold text-gray-900 text-sm truncate hover:text-primary-600 transition-colors" title={product.name}>
                                                            {product.name}
                                                        </Link>
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                                                            {statusLabels[product.status] || product.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        <span className="truncate">{product.category?.name || 'Sans catégorie'}</span>
                                                         <span className="font-semibold text-gray-900">{formatCurrency(product.sale_price || product.price, { currency: product.currency || 'CDF' })}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className={availableStock <= 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                                            Stock: <span className="font-semibold">{availableStock}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Link href={`/seller/products/${product.id}`} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors" title="Voir">
                                                            <Eye size={14} />
                                                        </Link>
                                                        <Link href={`/seller/products/${product.id}/edit`} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Modifier">
                                                            <Edit size={14} />
                                                        </Link>
                                                        <button onClick={() => handleDelete(product.id)} disabled={processing} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50" title="Supprimer">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="md:hidden grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 pb-20">
                            {products.data.map((product) => {
                                const imgPath = getPrimaryImage(product);
                                const availableStock = product.initial_stock - product.confirmed_sales;
                                const isSelected = selectedIds.includes(product.id);

                                return (
                                    <div key={product.id} className={`bg-white rounded-xl border ${isSelected ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200'} shadow-sm p-2.5`}>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleProductSelection(product.id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                            </div>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {statusLabels[product.status] || product.status}
                                            </span>
                                        </div>

                                        <Link href={`/seller/products/${product.id}`} className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden block">
                                            {imgPath ? (
                                                <img src={`/storage/${imgPath}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </Link>

                                        <div className="mt-2 space-y-1">
                                            <h3 className="font-bold text-gray-900 text-xs leading-tight line-clamp-2" title={product.name}>
                                                {product.name}
                                            </h3>
                                            <p className="text-[11px] text-gray-500 line-clamp-2">
                                                {getProductExcerpt(product.description, 80)}
                                            </p>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                <Folder size={10} className="text-gray-400 shrink-0" />
                                                <span className="line-clamp-1">{product.category?.name || 'Sans catégorie'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                <Tag size={10} className="text-gray-400 shrink-0" />
                                                <span className="line-clamp-1">{product.subcategory?.name || 'Non spécifiée'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                <Layers size={10} className="text-gray-400 shrink-0" />
                                                <span>Stock: <span className={availableStock <= 0 ? 'text-red-600 font-medium' : 'font-medium text-gray-900'}>{availableStock}</span></span>
                                            </div>
                                        </div>

                                        <div className="mt-2.5 flex items-center justify-between gap-2">
                                            <span className="text-[10px] font-bold text-gray-900">
                                                 {formatCurrency(product.sale_price || product.price, { currency: product.currency || 'CDF' })}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <Link href={`/seller/products/${product.id}`} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors" title="Voir">
                                                    <Eye size={12} />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (!confirm(`Voulez-vous ${product.status === 'active' ? 'désactiver' : 'activer'} ce produit ?`)) return;
                                                        router.patch(`/seller/products/${product.id}/toggle`, {}, { preserveState: true });
                                                    }}
                                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
                                                        product.status === 'active'
                                                            ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                                                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                                                    }`}
                                                    title={product.status === 'active' ? 'Désactiver' : 'Activer'}
                                                >
                                                    {product.status === 'active' ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                                                </button>
                                                <Link href={`/seller/products/${product.id}/edit`} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Modifier">
                                                    <Edit size={12} />
                                                </Link>
                                                <button onClick={() => handleDelete(product.id)} disabled={processing} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50" title="Supprimer">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Pagination links={products.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <Package size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('products_page.no_products')}</h3>
                        <p className="text-gray-500 mb-6">
                            {hasFilters
                                ? 'Aucun produit ne correspond à votre recherche ou à vos filtres.'
                                : "Vous n'avez pas encore ajouté de produit à votre boutique."}
                        </p>
                        {!hasFilters && (
                            <Link href="/seller/products/create" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">
                                <Plus size={18} />
                                Ajouter votre premier produit
                            </Link>
                        )}
                    </div>
                )}
            </SellerLayout>
        </>
    );
}
