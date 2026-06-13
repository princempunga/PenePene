import React, { useState } from 'react';
import useTranslation from '@/hooks/useTranslation';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { formatCurrency } from '@/lib/formatCurrency';
import SellerLayout from '@/Layouts/SellerLayout';
import Pagination from '@/Components/UI/Pagination';
import { Plus, Edit, Trash2, Eye, Package, Search } from 'lucide-react';

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

export default function ProductsIndex({ products, filters = {} }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const { delete: destroy, processing } = useForm({});
    const [search, setSearch] = useState(filters.search || '');

    const handleDelete = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            destroy(`/seller/products/${id}`);
        }
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

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <p className="text-gray-500">Gérez l'inventaire de votre boutique.</p>
                    <Link
                        href="/seller/products/create"
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm shrink-0"
                    >
                        <Plus size={16} />
                        Ajouter un produit
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
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Produit</th>
                                        <th className="px-6 py-4">Catégorie</th>
                                        <th className="px-6 py-4">Prix</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.data.map((product) => {
                                        const imgPath = getPrimaryImage(product);
                                        const availableStock = product.initial_stock - product.confirmed_sales;

                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                                                            {imgPath ? (
                                                                <img src={`/storage/${imgPath}`} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package size={18} />
                                                            )}
                                                        </div>
                                                        <span className="truncate max-w-[200px]" title={product.name}>
                                                            {product.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{product.category?.name || 'Sans catégorie'}</td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <span className="font-semibold text-gray-900">
                                                            {formatCurrency(product.sale_price || product.price)}
                                                        </span>
                                                        {product.sale_price && (
                                                            <span className="block text-xs line-through text-gray-400">
                                                                {formatCurrency(product.price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={availableStock <= 0 ? 'text-red-600 font-medium' : ''}>
                                                        {availableStock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                                                        {statusLabels[product.status] || product.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <Link
                                                            href={`/seller/products/${product.id}`}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                                                            title="Voir"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>
                                                        <Link
                                                            href={`/seller/products/${product.id}/edit`}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                            title="Modifier"
                                                        >
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            disabled={processing}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                            title="Supprimer"
                                                        >
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
                            <Link
                                href="/seller/products/create"
                                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                            >
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
