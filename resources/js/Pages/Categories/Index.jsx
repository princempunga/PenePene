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

                                    {category.subcategories && category.subcategories.length > 0 && (
                                        <div className="p-6">
                                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                                {t('categories_page.subcategories', 'Sous-catégories')}
                                            </h3>
                                            <ul className="space-y-2">
                                                {category.subcategories.map((sub) => {
                                                    const SubIcon = getSubcategoryIcon(sub.slug, category.slug);
                                                    const subMeta = getCategoryIconMeta(category.slug);

                                                    return (
                                                        <li key={sub.id}>
                                                            <Link
                                                                    href={`/products?category=${category.slug}&subcategory=${sub.slug}`}
                                                                    className="text-gray-700 hover:text-primary-600 flex items-center gap-3 py-1.5 rounded-lg hover:bg-gray-50 px-2 -mx-2 transition-colors group/sub"
                                                                >
                                                                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${subMeta.bg} ${subMeta.color} shrink-0 transition-transform duration-300 group-hover/sub:scale-110`}>
                                                                        <SubIcon size={15} strokeWidth={2} />
                                                                    </span>
                                                                    <span className="font-medium text-sm">{sub.name}</span>
                                                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover/sub:opacity-50 group-hover/sub:translate-x-0.5 text-gray-400 transition-all duration-300" />
                                                                </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
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
