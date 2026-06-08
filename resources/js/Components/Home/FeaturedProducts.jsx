import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../Product/ProductCard';

export default function FeaturedProducts({ products, title = "Featured Products", link = "/products" }) {
    if (!products || products.length === 0) return null;

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <Link 
                        href={link} 
                        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                        View All
                        <ArrowRight size={16} />
                    </Link>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
