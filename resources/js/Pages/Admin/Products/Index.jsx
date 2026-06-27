import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Package, Check, X, ShieldAlert, Eye } from 'lucide-react';

export default function ProductsIndex({ products, filters }) {
    const { flash } = usePage().props;
    const { patch } = useForm();

    const updateStatus = (productId, action, reason = null) => {
        let msg = action === 'approve' ? 'approve this product' :
                  action === 'reject' ? 'reject this product' :
                  'ban this product';

        if (confirm(`Are you sure you want to ${msg}?`)) {
            const payload = reason ? { reason } : {};
            patch(`/admin/products/${productId}/${action}`, { data: payload });
        }
    };

    const statusColors = {
        pending: 'bg-amber-100 text-amber-800',
        active: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        inactive: 'bg-gray-100 text-gray-800', // Banned/Inactive
    };

    return (
        <AdminLayout>
            <Head title="Product Moderation" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Moderation</h1>
                    <p className="text-gray-500 mt-1">Review and manage product listings across the platform.</p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                    {['pending', 'active', 'rejected', 'all'].map(status => (
                        <Link
                            key={status}
                            href={`/admin/products?status=${status}`}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition ${
                                filters.status === status
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {status}
                        </Link>
                    ))}
                </div>
            </div>

            {flash?.success && (
                <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                    {flash.success}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Product Details</th>
                            <th className="px-6 py-4">Seller</th>
                            <th className="px-6 py-4">Price / Stock</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.data.length > 0 ? products.data.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                            {product.images && product.images[0] ? (
                                                <img src={`/storage/${product.images[0].path}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Package size={20} className="text-gray-400" />
                                            )}
                                        </div>
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
                                    <p className="font-semibold text-gray-900">TZS {parseFloat(product.price).toLocaleString()}</p>
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
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
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
