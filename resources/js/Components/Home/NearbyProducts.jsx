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
                
                <div className="grid grid-cols-2 items-start gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4 md:gap-y-10 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-12 max-md:flex max-md:overflow-x-auto max-md:pb-8 max-md:-mx-4 max-md:px-4 max-md:snap-x max-md:snap-mandatory hide-scrollbar">
                    {products.map((product, index) => (
                        <motion.div 
                            key={product.id} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: index * 0.1 }}
                            className="max-md:w-[72vw] max-md:max-w-[240px] max-md:flex-shrink-0 max-md:snap-start md:w-full min-w-0 flex flex-col"
                        >
                            <ProductCard product={product} compact />
                            {/* Visual distance badge (demo) */}
                            <div className="mt-3 text-center text-xs text-green-600 font-semibold bg-green-50 py-1.5 px-2 rounded-lg border border-green-100 shrink-0">
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
