import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Package, MapPin, Tag, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

export default function ProductShow({ product }) {
    const { flash } = usePage().props;

    const handleAction = (action, reason = null) => {
        const msgs = {
            approve: 'approve this product and make it live',
            reject:  'reject this product',
            ban:     'ban this product from the marketplace',
        };
        if (!confirm(`Are you sure you want to ${msgs[action]}?`)) return;

        const payload = reason ? { reason } : {};
        router.patch(`/admin/products/${product.id}/${action}`, payload);
    };

    const statusColors = {
        pending:  'bg-amber-100 text-amber-800',
        active:   'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        inactive: 'bg-gray-100 text-gray-800',
    };

    return (
        <AdminLayout>
            <Head title={`Moderate: ${product.name}`} />

            <div className="mb-6">
                <Link href="/admin/products" className="text-primary-600 hover:underline flex items-center gap-1 text-sm font-medium mb-3">
                    <ArrowLeft size={16} /> Back to Products
                </Link>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                        {product.status}
                    </span>
                </div>
            </div>

            {flash?.success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                    {flash.success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Images */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                            <Package className="text-primary-500" size={20} />
                            <h2 className="font-bold text-gray-900">Product Images</h2>
                        </div>
                        <div className="p-5">
                            {product.images && product.images.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {product.images.map(img => (
                                        <div key={img.id} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                                            <img src={`/storage/${img.image_path}`} alt="" className="w-full h-full object-cover" />
                                            {img.is_primary && (
                                                <span className="absolute top-2 left-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded">PRIMARY</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-8">No images uploaded.</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Description</h2>
                        </div>
                        <div className="p-5 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {product.description || <span className="text-gray-400 italic">No description provided.</span>}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Moderation Actions</h3>

                        {product.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => handleAction('approve')}
                                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                                >
                                    <CheckCircle size={18} /> Approve Product
                                </button>
                                <button
                                    onClick={() => {
                                        const reason = prompt('Reason for rejection?');
                                        if (reason) handleAction('reject', reason);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                                >
                                    <XCircle size={18} /> Reject Product
                                </button>
                            </>
                        )}

                        {product.status === 'active' && (
                            <button
                                onClick={() => handleAction('ban')}
                                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                            >
                                <ShieldAlert size={18} /> Ban / Remove Product
                            </button>
                        )}

                        {(product.status === 'rejected' || product.status === 'inactive') && (
                            <button
                                onClick={() => handleAction('approve')}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                            >
                                <CheckCircle size={18} /> Re-approve Product
                            </button>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                            <Tag size={18} className="text-gray-400" />
                            <h3 className="font-bold text-gray-900">Product Details</h3>
                        </div>
                        <div className="p-5 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Price</span>
                                <span className="font-semibold text-gray-900">TZS {parseFloat(product.price).toLocaleString()}</span>
                            </div>
                            {product.sale_price && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Sale Price</span>
                                    <span className="font-semibold text-red-600">TZS {parseFloat(product.sale_price).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Available Stock</span>
                                <span className="font-semibold text-gray-900">{product.initial_stock - product.confirmed_sales}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Category</span>
                                <span className="font-medium text-gray-900">{product.category?.name || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subcategory</span>
                                <span className="font-medium text-gray-900">{product.subcategory?.name || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Views</span>
                                <span className="font-medium text-gray-900">{product.view_count ?? 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Seller Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                            <Package size={18} className="text-gray-400" />
                            <h3 className="font-bold text-gray-900">Seller</h3>
                        </div>
                        <div className="p-5 space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">Business Name</p>
                                <p className="font-semibold text-gray-900">{product.seller?.business_name || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                    <MapPin size={14} />
                                    {product.seller?.city}, {product.seller?.country}
                                </p>
                            </div>
                            <Link
                                href={`/admin/sellers/${product.seller?.id}`}
                                className="block text-center mt-2 text-sm text-primary-600 hover:underline font-medium"
                            >
                                View Seller Profile →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
