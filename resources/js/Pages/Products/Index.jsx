import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/Product/ProductCard';
import Pagination from '@/Components/UI/Pagination';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function Index({ products, filters }) {
    const handleSortChange = (e) => {
        router.get('/products', { ...filters, sort: e.target.value }, { preserveState: true });
    };

    return (
        <AppLayout>
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
                    <p className="text-gray-500 mt-2">Discover the best products from local sellers.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                
                {/* Filters Sidebar */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 sticky top-24">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 font-semibold text-lg border-b pb-4">
                            <Filter size={20} />
                            <span>Filters</span>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                            <div className="flex items-center gap-2">
                                <input type="number" placeholder="Min" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                                <span className="text-gray-400">-</span>
                                <input type="number" placeholder="Max" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                            </div>
                            <button className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-1.5 rounded transition-colors">
                                Apply
                            </button>
                        </div>
                        
                        {/* More filters can be added here */}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-200">
                        <div className="text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{products.from || 0}</span> to <span className="font-semibold text-gray-900">{products.to || 0}</span> of <span className="font-semibold text-gray-900">{products.total}</span> products
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <label className="text-gray-600 text-sm flex items-center gap-2">
                                <SlidersHorizontal size={16} />
                                Sort by:
                            </label>
                            <select 
                                value={filters.sort || 'newest'} 
                                onChange={handleSortChange}
                                className="border border-gray-300 rounded-md text-sm py-1.5 pl-3 pr-8 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="popularity">Popularity</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
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
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
                        </div>
                    )}
                </div>
                
            </div>
        </AppLayout>
    );
}
