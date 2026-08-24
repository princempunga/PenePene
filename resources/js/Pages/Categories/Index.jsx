import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import CategoryIcon from '@/Components/Category/CategoryIcon';
import { getCategoryIconMeta, getSubcategoryIcon } from '@/lib/categoryIcons';
import useTranslation from '@/hooks/useTranslation';
import AnimateIn from '@/Components/UI/AnimateIn';
import StaggerChildren, { StaggerItem } from '@/Components/UI/StaggerChildren';
import MaskReveal from '@/Components/UI/MaskReveal';
import { useReducedMotion } from 'framer-motion';

export default function Index({ categories }) {
    const { t } = useTranslation();
    const prefersReducedMotion = useReducedMotion();

    return (
        <AppLayout>
            <div className="bg-white border-b overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <MaskReveal as="h1" className="text-3xl font-bold text-gray-900">
                        {t('categories_page.all_categories', 'Toutes les catégories')}
                    </MaskReveal>
                    {prefersReducedMotion ? (
                        <p className="text-gray-500 mt-2">
                            {t('categories_page.browse_by_category', 'Parcourez les produits par catégorie')}
                        </p>
                    ) : (
                        <p className="text-gray-500 mt-2 animate-fade-in">
                            {t('categories_page.browse_by_category', 'Parcourez les produits par catégorie')}
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.08}>
                    {categories.map((category) => {
                        const meta = getCategoryIconMeta(category.slug);

                        return (
                            <StaggerItem key={category.id}>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg hover:border-primary-100 transition-all duration-300 premium-card h-full">
                                    <Link
                                        href={`/categories/${category.slug}`}
                                        className={`p-6 border-b border-gray-100 flex items-center gap-4 transition-colors ${meta.bg} ${meta.hoverBg}`}
                                    >
                                        <CategoryIcon slug={category.slug} size={26} />
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-primary-700">
                                                {category.name}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {category.products_count || 0}{' '}
                                                {t('categories_page.products', 'produits')}
                                            </p>
                                        </div>
                                        <ChevronRight className={`shrink-0 transition-colors ${meta.color} opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform duration-300`} />
                                    </Link>

                                    {category.children && category.children.length > 0 && (
                                        <div className="px-6 py-5">
                                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                                {t('categories_page.subcategories', 'Sous-catégories')}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {category.children.map((sub) => {
                                                    const SubIcon = getSubcategoryIcon(sub.slug, category.slug);

                                                    return (
                                                        <Link
                                                            key={sub.id}
                                                            href={`/categories/${sub.slug}`}
                                                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 pl-2 pr-3 py-1.5 text-xs font-medium text-gray-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                                        >
                                                            <SubIcon size={13} strokeWidth={2} className="shrink-0" />
                                                            {sub.name}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </StaggerItem>
                        );
                    })}
                </StaggerChildren>
            </div>
        </AppLayout>
    );
}
