import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import SectionHeader from '../UI/SectionHeader';
import useTranslation from '@/hooks/useTranslation';

const DEFAULT_IMAGE = '/images/categories/default.jpg';

function getCategoryImage(category) {
    if (category.image) {
        if (category.image.startsWith('http') || category.image.startsWith('/')) {
            return category.image;
        }
        if (category.image.startsWith('images/')) {
            return `/${category.image}`;
        }
        return `/storage/${category.image}`;
    }

    if (category.slug) {
        return `/images/categories/${category.slug}.jpg`;
    }

    return DEFAULT_IMAGE;
}

function formatProductCount(count, t) {
    if (count === undefined || count === null) return null;
    return count === 1 ? `1 ${t('home.item')}` : `${count.toLocaleString()} ${t('home.items')}`;
}

export default function PopularCategories({ categories = [] }) {
    const { t } = useTranslation();
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
    };

    if (!categories.length) {
        return null;
    }

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    title={t('home.popular_categories')}
                    subtitle={t('home.categories_subtitle')}
                    actionText={t('home.view_all_categories')}
                    actionLink="/categories"
                />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-50px' }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
                >
                    {categories.map((category) => (
                        <motion.div key={category.id} variants={itemVariants}>
                            <Link
                                href={`/categories/${category.slug}`}
                                className="group relative block min-h-[180px] rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-1"
                            >
                                <img
                                    src={getCategoryImage(category)}
                                    alt={category.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                    onError={(e) => {
                                        if (!e.target.src.endsWith(DEFAULT_IMAGE)) {
                                            e.target.src = DEFAULT_IMAGE;
                                        }
                                    }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/90 group-hover:via-black/50" />

                                <div className="relative z-10 flex h-full min-h-[180px] flex-col justify-end p-4 sm:p-5">
                                    {formatProductCount(category.products_count, t) && (
                                        <span className="mb-2 inline-flex w-fit items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm ring-1 ring-white/25 transition-colors duration-300 group-hover:bg-primary-600/80 group-hover:ring-primary-400/50">
                                            {formatProductCount(category.products_count, t)}
                                        </span>
                                    )}

                                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight drop-shadow-sm transition-transform duration-300 group-hover:translate-x-0.5">
                                        {category.name}
                                    </h3>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
