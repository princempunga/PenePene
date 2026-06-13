import React from 'react';
import ProductCard from '../Product/ProductCard';
import SectionHeader from '../UI/SectionHeader';
import { motion } from 'framer-motion';
import useTranslation from '@/hooks/useTranslation';

export default function TrendingProducts({ products }) {
    const { t } = useTranslation();
    if (!products || products.length === 0) return null;

    // Use top 10 for trending, maybe layout differently
    const topThree = products.slice(0, 3);
    const rest = products.slice(3, 11);

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader 
                    title={t('home.trending_products')}
                    subtitle={t('home.trending_subtitle')}
                    actionText={t('home.view_all_trending')}
                    actionLink="/products?sort=trending"
                />
                
                <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 snap-x snap-mandatory hide-scrollbar">
                    {products.map((product, index) => (
                        <motion.div 
                            key={product.id} 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: index * 0.05 }}
                            className="min-w-[280px] sm:min-w-0 flex-shrink-0 snap-start h-full"
                        >
                            <ProductCard product={product} badge={index < 3 ? 'Hot' : null} />
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
