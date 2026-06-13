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
        <section className="py-10 sm:py-14 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader 
                    title={t('home.trending_products')}
                    subtitle={t('home.trending_subtitle')}
                    actionText={t('home.view_all_trending')}
                    actionLink="/products?sort=trending"
                />
                
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4 lg:gap-5 max-md:flex max-md:overflow-x-auto max-md:pb-6 max-md:-mx-4 max-md:px-4 max-md:snap-x max-md:snap-mandatory hide-scrollbar">
                    {products.map((product, index) => (
                        <motion.div 
                            key={product.id} 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: index * 0.05 }}
                            className="max-md:w-[72vw] max-md:max-w-[240px] max-md:flex-shrink-0 max-md:snap-start md:w-full h-full min-w-0"
                        >
                            <ProductCard product={product} badge={index < 3 ? 'hot_deal' : null} compact />
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
