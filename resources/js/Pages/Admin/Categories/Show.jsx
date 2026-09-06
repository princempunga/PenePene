import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Package, Store, Tag } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

const DEFAULT_PRODUCT_IMAGE = '/images/categories/default.jpg';

function resolveImagePath(path) {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
    if (path.startsWith('images/')) return `/${path}`;
    return `/storage/${path}`;
}

function getProductImage(product) {
    if (product?.primary_image_url) return resolveImagePath(product.primary_image_url);

    let images = product?.images;
    if (typeof images === 'string') {
        try { images = JSON.parse(images); } catch (e) { images = [images]; }
    }
    if (Array.isArray(images) && images.length > 0) {
        const first = images[0];
        const rawPath = typeof first === 'string' ? first : (first?.image_path || first?.path || first?.url);
        if (rawPath) return resolveImagePath(rawPath);
    }

    if (product?.image) return resolveImagePath(product.image);

    return null;
}

export default function CategoryShow({ category, products }) {
    const { formatAmount } = useCurrency();

    return (
        <>
            <Head title={`Category: ${category.name}`} />
            <AdminLayout title={`Category: ${category.name}`}>
                <div className="mb-6">
                    <Link href="/admin/categories" className="text-primary-600 hover:underline flex items-center gap-1 text-sm font-medium mb-3">
                        <ArrowLeft size={16} /> Back to Categories
                    </Link>
                    <p className="text-gray-500 text-sm">
                        Products in <span className="font-semibold text-gray-900">{category.name}</span>
                    </p>
                </div>

                {/* ── Mobile : cartes ── */}
                <div className="md:hidden space-y-3">
                    {products.data.length > 0 ? products.data.map(product => {
                        const imgUrl = getProductImage(product);
                        return (
                            <div key={product.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                        {imgUrl ? (
                                            <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                            <Store size={12} /> {product.seller?.business_name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{formatAmount(product.price)}</p>
                                        <p className="text-xs text-gray-500">Stock: {product.initial_stock - product.confirmed_sales}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                                        product.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {product.status}
                                    </span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 text-center text-gray-500">
                            <Package size={40} className="mx-auto mb-3 opacity-20" />
                            <p>No products found in this category.</p>
                        </div>
                    )}
                </div>

                {/* ── Tablette / PC : tableau ── */}
                <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Seller</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.data.length > 0 ? products.data.map(product => {
                                const imgUrl = getProductImage(product);
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                                    {imgUrl ? (
                                                        <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={20} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {product.seller?.business_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {formatAmount(product.price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.initial_stock - product.confirmed_sales}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                                                product.status === 'active' ? 'bg-green-100 text-green-800' :
                                                product.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {product.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <Package size={40} className="mx-auto mb-3 opacity-20" />
                                        <p>No products found in this category.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500">
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
        </>
    );
}

