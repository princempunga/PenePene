import React from 'react';
import ProductCard from '../Product/ProductCard';
import SectionHeader from '../UI/SectionHeader';
import { motion } from 'framer-motion';

export default function FeaturedProducts({ products }) {
    if (!products || products.length === 0) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader 
                    title="Featured Products" 
                    subtitle="Hand-picked premium quality products from trusted sellers."
                    actionText="View All Featured"
                    actionLink="/products?filter=featured"
                />
                
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                >
                    {products.map(product => (
                        <motion.div key={product.id} variants={itemVariants} className="h-full">
                            <ProductCard product={product} badge="Featured" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
