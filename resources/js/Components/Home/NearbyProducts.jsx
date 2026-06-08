import React from 'react';
import ProductCard from '../Product/ProductCard';
import SectionHeader from '../UI/SectionHeader';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function NearbyProducts({ products }) {
    if (!products || products.length === 0) return null;

    return (
        <section className="py-16 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-2">
                    <MapPin className="text-green-500" size={24} />
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Products Near You</h2>
                </div>
                <p className="text-gray-500 mb-8">Discover great deals within your city or region.</p>
                
                <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 snap-x snap-mandatory hide-scrollbar">
                    {products.map((product, index) => (
                        <motion.div 
                            key={product.id} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: index * 0.1 }}
                            className="min-w-[280px] sm:min-w-0 flex-shrink-0 snap-start h-full"
                        >
                            <ProductCard product={product} />
                            {/* Visual distance badge (demo) */}
                            <div className="mt-2 text-center text-xs text-green-600 font-semibold bg-green-50 py-1.5 rounded-lg border border-green-100">
                                ≈ {Math.floor(Math.random() * 15) + 1} km away in {product.city || 'Your City'}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}
