import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/Product/ProductCard';
import Pagination from '@/Components/UI/Pagination';
import { Link } from '@inertiajs/react';

export default function Show({ category, products }) {
    return (
        <AppLayout>
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-primary-600">Home</Link>
                        <span>&gt;</span>
                        <Link href="/categories" className="hover:text-primary-600">Categories</Link>
                        <span>&gt;</span>
                        <span className="text-gray-900">{category.name}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                </div>
            </div>

            {/* Subcategories list */}
            {category.subcategories && category.subcategories.length > 0 && (
                <div className="bg-gray-50 border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                            {category.subcategories.map(sub => (
                                <Link 
                                    key={sub.id}
                                    href={`/products?category=${category.slug}&subcategory=${sub.slug}`}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm"
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8">
                {products.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {products.data.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        <Pagination links={products.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center mt-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500">There are currently no active products in this category.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
