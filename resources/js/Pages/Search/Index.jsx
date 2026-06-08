import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/Product/ProductCard';
import Pagination from '@/Components/UI/Pagination';
import { Search as SearchIcon } from 'lucide-react';

export default function Index({ products, categories, filters }) {
    return (
        <AppLayout>
            <div className="bg-primary-900 text-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <h1 className="text-3xl font-bold mb-6">Search Results</h1>
                    
                    <form action="/search" method="GET" className="max-w-3xl flex bg-white rounded-lg p-1 shadow-md">
                        <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-l-md border border-r-0 border-gray-200">
                            <SearchIcon className="text-gray-400" size={20} />
                            <input 
                                type="text" 
                                name="q"
                                defaultValue={filters.q || ''}
                                placeholder="What are you looking for?" 
                                className="w-full bg-transparent border-none focus:ring-0 px-3 py-3 text-gray-900"
                            />
                        </div>
                        <select 
                            name="category"
                            defaultValue={filters.category || ''}
                            className="bg-white border-y border-gray-200 px-4 text-gray-700 focus:ring-0 cursor-pointer hidden md:block"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-8 font-medium rounded-r-md transition-colors">
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
                <div className="flex-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {filters.q ? `Results for "${filters.q}"` : 'All Products'} 
                            <span className="text-gray-500 font-normal ml-2">({products.total})</span>
                        </h2>
                    </div>

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
                        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <SearchIcon size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                We couldn't find any products matching your search. Try using different keywords or browsing our categories.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
