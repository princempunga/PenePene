import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import Pagination from '@/Components/UI/Pagination';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

export default function ProductsIndex({ products }) {
    const { delete: destroy, processing } = useForm({});

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            destroy(`/seller/products/${id}`);
        }
    };

    return (
        <>
            <Head title="My Products" />
            <SellerLayout title="My Products">
                
                <div className="mb-6 flex justify-between items-center">
                    <p className="text-gray-500">Manage your store inventory.</p>
                    <Link
                        href="/seller/products/create"
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm"
                    >
                        <Plus size={16} />
                        Add Product
                    </Link>
                </div>

                {products.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                        <ImageIcon size={18} />
                                                    </div>
                                                    <span className="truncate max-w-[200px]" title={product.name}>
                                                        {product.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{product.category?.name || 'Uncategorized'}</td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <span className="font-semibold text-gray-900">TZS {parseFloat(product.sale_price || product.price).toLocaleString()}</span>
                                                    {product.sale_price && (
                                                        <span className="block text-xs line-through text-gray-400">TZS {parseFloat(product.price).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.initial_stock - product.confirmed_sales}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    product.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Link
                                                    href={`/seller/products/${product.id}/edit`}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={processing}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={products.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <Package size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-6">You haven't added any products to your store yet.</p>
                        <Link
                            href="/seller/products/create"
                            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                            Add Your First Product
                        </Link>
                    </div>
                )}

            </SellerLayout>
        </>
    );
}
