import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/Product/ProductCard';
import ProductFilters from '@/Components/Product/ProductFilters';
import Pagination from '@/Components/UI/Pagination';
import AnimateIn from '@/Components/UI/AnimateIn';
import StaggerChildren, { StaggerItem } from '@/Components/UI/StaggerChildren';
import SectionReveal from '@/Components/UI/SectionReveal';
import MaskReveal from '@/Components/UI/MaskReveal';
import CategoryIcon from '@/Components/Category/CategoryIcon';
import { getSubcategoryIcon } from '@/lib/categoryIcons';
import { SlidersHorizontal } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import { motion, useReducedMotion } from 'framer-motion';
import { scaleIn, slideInLeft } from '@/lib/motion';
import { DURATION, EASE } from '@/lib/premiumMotion';

export default function Index({
    products,
    filters = {},
    category = null,
    subcategory = null,
    subcategoryMeta = null,
    brandOptions = [],
    pageMeta = null,
}) {
    const { t } = useTranslation();
    const prefersReducedMotion = useReducedMotion();

    const handleSortChange = (e) => {
        router.get('/products', { ...filters, sort: e.target.value }, { preserveState: true, preserveScroll: true });
    };

    const productList = products?.data ?? [];

    const pageTitle = pageMeta?.title
        || subcategoryMeta?.name
        || subcategory?.name
        || (category ? category.name : t('products_page.all_products'));

    const bannerImage = pageMeta?.image
        || subcategoryMeta?.image
        || category?.image
        || '/images/categories/electronics.jpg';

    const description = pageMeta?.description
        || subcategoryMeta?.description
        || (category
            ? t('products_page.category_desc', { category: category.name.toLowerCase() })
            : t('products_page.default_desc'));

    const subSlug = subcategoryMeta?.short_slug || subcategory?.slug;
    const SubIcon = subSlug && category ? getSubcategoryIcon(subSlug, category.slug) : null;

    return (
        <AppLayout>
            <section className="relative overflow-hidden bg-gray-900">
                <img
                    src={bannerImage}
                    alt={pageTitle}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 hero-zoom-bg"
                    onError={(e) => { e.target.src = '/images/categories/default.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/50" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                    <AnimateIn delay={0}>
                        <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4 flex-wrap">
                            <Link href="/" className="hover:text-white transition-colors">{t('products_page.home')}</Link>
                            <span>/</span>
                            {category ? (
                                <>
                                    <Link href={`/categories/${category.slug}`} className="hover:text-white transition-colors">{category.name}</Link>
                                    {(subcategoryMeta || subcategory) && (
                                        <>
                                            <span>/</span>
                                            <span className="text-white font-medium">{subcategoryMeta?.name || subcategory?.name}</span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <span className="text-white font-medium">{t('products_page.title')}</span>
                            )}
                        </nav>
                    </AnimateIn>

                    <div className="flex items-center gap-4 mb-2">
                        {category && (
                            <AnimateIn variant={scaleIn} delay={0.06}>
                                {SubIcon ? (
                                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/10 ring-2 ring-white/20 backdrop-blur-sm">
                                        <SubIcon size={24} className="text-white" strokeWidth={2} />
                                    </div>
                                ) : (
                                    <CategoryIcon slug={category.slug} size={24} className="shadow-lg ring-white/30" />
                                )}
                            </AnimateIn>
                        )}
                        <MaskReveal as="h1" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                            {pageTitle}
                        </MaskReveal>
                    </div>

                    {prefersReducedMotion ? (
                        <p className="text-gray-300 max-w-2xl text-sm sm:text-base">{description}</p>
                    ) : (
                        <motion.p
                            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ delay: 0.18, duration: DURATION.normal, ease: EASE.outExpo }}
                            className="text-gray-300 max-w-2xl text-sm sm:text-base"
                        >
                            {description}
                        </motion.p>
                    )}

                    {prefersReducedMotion ? (
                        <p className="mt-3 text-sm text-gray-400">
                            {t('products_page.products_found', { count: products?.total ?? productList.length })}
                        </p>
                    ) : (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.26, duration: DURATION.fast, ease: EASE.outExpo }}
                            className="mt-3 text-sm text-gray-400"
                        >
                            {t('products_page.products_found', { count: products?.total ?? productList.length })}
                        </motion.p>
                    )}
                </div>
            </section>

            <SectionReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Horizontal Filter Navigation Bar */}
                <AnimateIn variant={slideInLeft}>
                    <ProductFilters filters={filters} brandOptions={brandOptions} />
                </AnimateIn>

                {/* Sort & Counter Bar */}
                <AnimateIn delay={0.08}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                        <div className="text-gray-600 text-sm font-medium">
                            {t('products_page.showing_products', {
                                from: products?.from || 0,
                                to: products?.to || 0,
                                total: products?.total ?? productList.length,
                            })}
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-gray-600 text-sm flex items-center gap-2 whitespace-nowrap font-medium">
                                <SlidersHorizontal size={16} className="text-primary-600" />
                                {t('products_page.sort_label')}
                            </label>
                            <select
                                value={filters.sort || 'newest'}
                                onChange={handleSortChange}
                                className="bg-gray-50 border border-gray-200 rounded-xl text-sm py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium cursor-pointer"
                            >
                                <option value="newest">{t('products_page.sort_newest')}</option>
                                <option value="price_asc">{t('products_page.sort_price_asc')}</option>
                                <option value="price_desc">{t('products_page.sort_price_desc')}</option>
                                <option value="popular">{t('products_page.sort_popular')}</option>
                                <option value="rating">{t('products_page.sort_rating')}</option>
                            </select>
                        </div>
                    </div>
                </AnimateIn>

                {/* Product Grid */}
                {productList.length > 0 ? (
                    <>
                        <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" stagger={0.05}>
                            {productList.map((product) => (
                                <StaggerItem key={product.id}>
                                    <ProductCard product={product} />
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                        <AnimateIn delay={0.1}>
                            <Pagination links={products?.links} />
                        </AnimateIn>
                    </>
                ) : (
                            <AnimateIn>
                                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('products_page.no_products')}</h3>
                                    <p className="text-gray-500">{t('products_page.browse_subcategory')}</p>
                                </div>
                            </AnimateIn>
                        )}
            </SectionReveal>
        </AppLayout>
    );
}

