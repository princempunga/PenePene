import React from 'react';
import { Link } from '@inertiajs/react';
import { Package } from 'lucide-react';

export default function PopularCategories({ categories }) {
    if (!categories || categories.length === 0) return null;

    return (
        <section className="py-12 bg-gray-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Categories</h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categories.map(category => (
                        <Link 
                            key={category.id} 
                            href={`/categories/${category.slug}`}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-primary-200 hover:-translate-y-1 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                {category.icon ? (
                                    <img src={`/storage/${category.icon}`} alt={category.name} className="w-6 h-6" />
                                ) : (
                                    <Package size={24} />
                                )}
                            </div>
                            <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                {category.name}
                            </h3>
                            {category.products_count !== undefined && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {category.products_count} items
                                </p>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
