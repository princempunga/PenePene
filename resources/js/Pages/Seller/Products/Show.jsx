import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import ImageGallery from '@/Components/Product/ImageGallery';
import RatingStars from '@/Components/UI/RatingStars';
import { Edit, Trash2, Eye, Package, ShoppingCart, BarChart3 } from 'lucide-react';

const statusColors = {
    pending:  'bg-amber-100 text-amber-800',
    active:   'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
};

export default function ProductShow({ product, stats }) {
    const { flash } = usePage().props;
    const { delete: destroy, processing } = useForm({});

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            destroy(`/seller/products/${product.id}`);
        }
    };

    const effectivePrice = product.sale_price || product.price;

    return (
        <>
            <Head title={product.name} />
            <SellerLayout title="Product Details">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <Link href="/seller/products" className="text-sm text-gray-500 hover:text-primary-600">← Back to Products</Link>
                    <div className="flex items-center gap-2">
                        {product.status === 'active' && (
                            <a
                                href={`/products/${product.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                            >
                                <Eye size={16} />
                                Public Page
                            </a>
                        )}
                        <Link
                            href={`/seller/products/${product.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <Edit size={16} />
                            Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <ImageGallery images={product.images} productName={product.name} />

                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {product.status}
                                        </span>
                                        {stats.available_stock <= 0 && (
                                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>

                                    {product.category && (
                                        <p className="text-sm text-gray-500 mb-4">
                                            {product.category.name}
                                            {product.subcategory ? ` › ${product.subcategory.name}` : ''}
                                        </p>
                                    )}

                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-4">
                                        <div className="flex items-end gap-3">
                                            <span className="text-2xl font-extrabold text-primary-600">
                                                TZS {parseFloat(effectivePrice).toLocaleString()}
                                            </span>
                                            {product.sale_price && (
                                                <span className="text-base text-gray-400 line-through mb-0.5">
                                                    TZS {parseFloat(product.price).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {product.average_rating > 0 && (
                                        <div className="mb-4">
                                            <RatingStars rating={product.average_rating} count={product.total_reviews} />
                                        </div>
                                    )}

                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p>Created {new Date(product.created_at).toLocaleDateString()}</p>
                                        <p>Last updated {new Date(product.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Description</h3>
                            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{product.description}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                                <BarChart3 size={18} className="text-primary-500" />
                                Performance
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Available Stock</p>
                                    <p className={`text-xl font-bold ${stats.available_stock <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {stats.available_stock}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Units Sold</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.confirmed_sales}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Page Views</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.view_count}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Reviews</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.total_reviews}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Inventory</h3>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <Package size={16} className="text-gray-400" />
                                    Initial Stock
                                </span>
                                <span className="font-semibold text-gray-900">{product.initial_stock}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <ShoppingCart size={16} className="text-gray-400" />
                                    Confirmed Sales
                                </span>
                                <span className="font-semibold text-gray-900">{product.confirmed_sales}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">Available</span>
                                <span className={`font-bold ${stats.available_stock <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {stats.available_stock}
                                </span>
                            </div>
                        </div>

                        {product.status === 'pending' && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                                This product is pending admin approval and is not visible to buyers yet.
                            </div>
                        )}

                        {product.status === 'rejected' && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                                This product was rejected. Please review the listing and contact support if needed.
                            </div>
                        )}
                    </div>
                </div>
            </SellerLayout>
        </>
    );
}
