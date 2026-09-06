import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Package, Check, X, ShieldAlert, Eye, Search, Calendar, ArrowUpDown, Square, CheckSquare, Ban, ShieldCheck, Power } from 'lucide-react';

export default function ProductsIndex({ products, filters }) {
    const { flash } = usePage().props;
    const { get } = useForm();
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const updateStatus = (productId, action, reason = null) => {
        let msg = action === 'approve' ? 'approve this product' :
                  action === 'reject' ? 'reject this product' :
                  'ban this product';

        if (confirm(`Are you sure you want to ${msg}?`)) {
            const payload = reason ? { reason } : {};
            router.patch(`/admin/products/${productId}/${action}`, payload);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === products.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.data.map(p => p.id));
        }
    };

    const handleBulkAction = (action) => {
        if (!selectedIds.length) return;
        if (!confirm(`${action === 'block' ? 'Bloquer' : 'Débloquer'} ${selectedIds.length} produit(s) ?`)) return;
        setBulkProcessing(true);
        router.post('/admin/products/bulk-action', { ids: selectedIds, action }, {
            preserveState: false,
            onFinish: () => {
                setBulkProcessing(false);
                setSelectedIds([]);
            },
        });
    };

    const statusColors = {
        pending: 'bg-amber-100 text-amber-800',
        active: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        inactive: 'bg-gray-100 text-gray-800',
    };

    const handleSearch = (e) => {
        e.preventDefault();
        get('/admin/products', { ...filters, search: e.target.search.value });
    };

    const getProductImageUrl = (product) => {
        if (product.images && product.images[0]?.image_path) {
            return `/storage/${product.images[0].image_path}`;
        }
        if (product.image) {
            return `/storage/${product.image}`;
        }
        return null;
    };

    const handleSort = (sortValue) => {
        get('/admin/products', { ...filters, sort: sortValue });
    };

    const allSelected = products.data.length > 0 && selectedIds.length === products.data.length;

    return (
        <AdminLayout>
            <Head title="Product Moderation" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Product Moderation</h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Review and manage product listings across the platform.</p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm overflow-x-auto self-start">
                    {['all', 'pending', 'active', 'rejected', 'inactive'].map(status => (
                        <Link
                            key={status}
                            href={`/admin/products?status=${status}&search=${filters.search || ''}&date_from=${filters.date_from || ''}&date_to=${filters.date_to || ''}&sort=${filters.sort || ''}`}
                            className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium capitalize transition whitespace-nowrap ${
                                filters.status === status
                                    ? 'bg-slate-800 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {status}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="mb-4 flex items-center gap-3 bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow">
                    <span className="text-sm font-medium">{selectedIds.length} sélectionné(s)</span>
                    <div className="flex-1" />
                    <button
                        onClick={() => handleBulkAction('block')}
                        disabled={bulkProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                        <Ban size={14} /> Bloquer
                    </button>
                    <button
                        onClick={() => handleBulkAction('unblock')}
                        disabled={bulkProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                    >
                        <ShieldCheck size={14} /> Débloquer
                    </button>
                    <button onClick={() => setSelectedIds([])} className="text-gray-300 hover:text-white text-sm">
                        Annuler
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={filters.search || ''}
                            placeholder="Search by seller name..."
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400 shrink-0" />
                        <input
                            type="date"
                            name="date_from"
                            defaultValue={filters.date_from || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            placeholder="From"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            name="date_to"
                            defaultValue={filters.date_to || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            placeholder="To"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <ArrowUpDown size={18} className="text-gray-400 shrink-0" />
                        <select
                            value={filters.sort || ''}
                            onChange={(e) => handleSort(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none bg-white"
                        >
                            <option value="">Default Sort</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="stock_asc">Stock: Low to High</option>
                            <option value="stock_desc">Stock: High to Low</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
                    >
                        Apply
                    </button>
                </form>
            </div>

            {flash?.success && (
                <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                    {flash.success}
                </div>
            )}

            {/* ── Mobile : cartes ── */}
            <div className="md:hidden space-y-3">
                {products.data.length > 0 ? products.data.map(product => {
                    const isSelected = selectedIds.includes(product.id);
                    return (
                        <div key={product.id} className={`bg-white rounded-xl border shadow-sm p-4 transition-colors ${isSelected ? 'border-slate-400 bg-slate-50' : 'border-gray-200'}`}>
                            <div className="flex items-start gap-3">
                                <button onClick={() => toggleSelect(product.id)} className="shrink-0 text-gray-400 hover:text-slate-700 mt-1">
                                    {isSelected ? <CheckSquare size={18} className="text-slate-700" /> : <Square size={18} />}
                                </button>
                                {getProductImageUrl(product) ? (
                                    <img src={getProductImageUrl(product)} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Package size={20} className="text-gray-400" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{product.category?.name} · {product.seller?.business_name || 'N/A'}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase shrink-0 ${statusColors[product.status]}`}>
                                    {product.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">CDF {parseFloat(product.price).toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">Stock: {product.initial_stock - product.confirmed_sales}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Link
                                        href={`/admin/products/${product.id}`}
                                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition"
                                    >
                                        <Eye size={18} />
                                    </Link>
                                    {product.status !== 'active' && product.status !== 'inactive' ? (
                                        <>
                                            {product.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(product.id, 'approve')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('Reason for rejection?');
                                                            if (reason) updateStatus(product.id, 'reject', reason);
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {product.status === 'active' && (
                                                <button
                                                    onClick={() => updateStatus(product.id, 'ban')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                >
                                                    <ShieldAlert size={18} />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => router.patch(`/admin/products/${product.id}/${product.status === 'active' ? 'deactivate' : 'activate'}`)}
                                            className={`p-2 rounded transition ${
                                                product.status === 'active'
                                                    ? 'text-gray-600 hover:bg-gray-100'
                                                    : 'text-green-600 hover:bg-green-50'
                                            }`}
                                            title={product.status === 'active' ? 'Désactiver' : 'Activer'}
                                        >
                                            <Power size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 text-center text-gray-500">
                        <Package size={40} className="mx-auto mb-3 opacity-20" />
                        <p>No products found for this status.</p>
                    </div>
                )}
            </div>

            {/* ── Tablette / PC : tableau ── */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-4">
                                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-slate-700">
                                    {allSelected ? <CheckSquare size={17} className="text-slate-700" /> : <Square size={17} />}
                                </button>
                            </th>
                            <th className="px-6 py-4">Product Details</th>
                            <th className="px-6 py-4">Seller</th>
                            <th className="px-6 py-4">Price / Stock</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.data.length > 0 ? products.data.map(product => {
                            const isSelected = selectedIds.includes(product.id);
                            return (
                                <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-slate-50' : ''}`}>
                                    <td className="px-4 py-4">
                                        <button onClick={() => toggleSelect(product.id)} className="text-gray-400 hover:text-slate-700">
                                            {isSelected ? <CheckSquare size={17} className="text-slate-700" /> : <Square size={17} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {getProductImageUrl(product) ? (
                                                <img src={getProductImageUrl(product)} alt={product.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <Package size={20} className="text-gray-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0 max-w-[250px]">
                                                <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{product.category?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">
                                        {product.seller?.business_name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-900">CDF {parseFloat(product.price).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">Stock: {product.initial_stock - product.confirmed_sales}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${statusColors[product.status]}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </Link>

                                            {product.status !== 'active' && product.status !== 'inactive' ? (
                                                <>
                                                    {product.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(product.id, 'approve')}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                                                                title="Approve"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const reason = prompt('Reason for rejection?');
                                                                    if (reason) updateStatus(product.id, 'reject', reason);
                                                                }}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                                                title="Reject"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {product.status === 'active' && (
                                                        <button
                                                            onClick={() => updateStatus(product.id, 'ban')}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                                            title="Ban Product"
                                                        >
                                                            <ShieldAlert size={18} />
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => router.patch(`/admin/products/${product.id}/${product.status === 'active' ? 'deactivate' : 'activate'}`)}
                                                    className={`p-1.5 rounded transition ${
                                                        product.status === 'active'
                                                            ? 'text-gray-600 hover:bg-gray-100'
                                                            : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                    title={product.status === 'active' ? 'Désactiver' : 'Activer'}
                                                >
                                                    <Power size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    <Package size={40} className="mx-auto mb-3 opacity-20" />
                                    <p>No products found for this status.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Simple Pagination */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <div>Showing {products.from || 0} to {products.to || 0} of {products.total} results</div>
                <div className="flex gap-1">
                    {products.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`px-3 py-1 rounded border ${link.active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
