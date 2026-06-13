import React from 'react';
import ProductCard from '../Product/ProductCard';
import SectionHeader from '../UI/SectionHeader';
import { motion } from 'framer-motion';

export default function SponsoredProducts({ products }) {
    if (!products || products.length === 0) return null;

    return (
        <section className="py-16 bg-amber-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader 
                    title="Sponsored Ads" 
                    subtitle="Promoted products from top sellers."
                />
                
                {/* Horizontal scroll container for mobile, grid for desktop */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4 lg:gap-5 max-md:flex max-md:overflow-x-auto max-md:pb-8 max-md:-mx-4 max-md:px-4 max-md:snap-x max-md:snap-mandatory hide-scrollbar">
                    {products.map((product, index) => (
                        <motion.div 
                            key={product.id} 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: index * 0.1 }}
                            className="max-md:w-[72vw] max-md:max-w-[240px] max-md:flex-shrink-0 max-md:snap-start md:w-full h-full min-w-0"
                        >
                            <ProductCard product={product} badge="sponsored" compact />
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
