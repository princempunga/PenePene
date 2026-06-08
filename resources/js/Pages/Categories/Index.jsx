import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';
import { Package, ChevronRight } from 'lucide-react';

export default function Index({ categories }) {
    return (
        <AppLayout>
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
                    <p className="text-gray-500 mt-2">Browse products by category</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(category => (
                        <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                            <Link href={`/categories/${category.slug}`} className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50 group-hover:bg-primary-50 transition-colors">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                                    {category.icon ? (
                                        <img src={`/storage/${category.icon}`} alt={category.name} className="w-6 h-6" />
                                    ) : (
                                        <Package size={24} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                                        {category.name}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">{category.products_count || 0} products</p>
                                </div>
                                <ChevronRight className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                            </Link>

                            {category.subcategories && category.subcategories.length > 0 && (
                                <div className="p-6">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Subcategories</h3>
                                    <ul className="space-y-3">
                                        {category.subcategories.map(sub => (
                                            <li key={sub.id}>
                                                <Link 
                                                    href={`/products?category=${category.slug}&subcategory=${sub.slug}`}
                                                    className="text-gray-700 hover:text-primary-600 flex items-center gap-2"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
