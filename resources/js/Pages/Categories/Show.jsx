import React from 'react';
import useTranslation from '@/hooks/useTranslation';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/Product/ProductCard';
import Pagination from '@/Components/UI/Pagination';
import { Link } from '@inertiajs/react';
import { ShieldCheck, Truck, Headphones, ArrowRight, Sparkles } from 'lucide-react';
import CategoryIcon from '@/Components/Category/CategoryIcon';
import AnimateIn from '@/Components/UI/AnimateIn';
import StaggerChildren, { StaggerItem } from '@/Components/UI/StaggerChildren';
import SectionReveal from '@/Components/UI/SectionReveal';
import SectionHeader from '@/Components/UI/SectionHeader';
import MaskReveal from '@/Components/UI/MaskReveal';
import { motion, useReducedMotion } from 'framer-motion';
import { scaleIn } from '@/lib/motion';
import { DURATION, EASE } from '@/lib/premiumMotion';

export default function Show({
    category,
    products,
    usingDemo = false,
    featuredProducts = [],
    subcategoryCards = [],
    popularBrands = [],
}) {
    const { t } = useTranslation();
    const prefersReducedMotion = useReducedMotion();
    const productList = products?.data ?? [];
    const productTotal = products?.total ?? productList.length;
    const bannerImage = category?.image || `/images/categories/${category?.slug}.jpg`;
    const description = category?.description
        || t('categories_page.default_category_desc', { category: category?.name?.toLowerCase() ?? '' });

    if (!category) {
        return (
            <AppLayout>
                <AnimateIn className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">{t('categories_page.category_not_found')}</h1>
                    <Link href="/categories" className="mt-4 inline-block text-primary-600 font-semibold">{t('categories_page.browse_all')}</Link>
                </AnimateIn>
            </AppLayout>
        );
    }

    const trustItems = [
        { icon: ShieldCheck, title: t('categories_page.verified_sellers'), text: t('categories_page.verified_sellers_desc') },
        { icon: Truck, title: t('categories_page.local_delivery'), text: t('categories_page.local_delivery_desc') },
        { icon: Headphones, title: t('categories_page.buyer_support'), text: t('categories_page.buyer_support_desc') },
    ];

    return (
        <AppLayout>
            <section className="relative min-h-[280px] sm:min-h-[320px] overflow-hidden">
                <img
                    src={bannerImage}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover hero-zoom-bg"
                    onError={(e) => { e.target.src = '/images/categories/default.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <AnimateIn delay={0}>
                        <nav className="flex items-center gap-2 text-sm text-white/70 mb-6 flex-wrap">
                            <Link href="/" className="hover:text-white transition-colors">{t('categories_page.home')}</Link>
                            <span>/</span>
                            <Link href="/categories" className="hover:text-white transition-colors">{t('categories_page.categories')}</Link>
                            <span>/</span>
                            <span className="text-white font-medium">{category.name}</span>
                        </nav>
                    </AnimateIn>

                    <div className="flex items-center gap-4 mb-4">
                        <AnimateIn variant={scaleIn} delay={0.08}>
                            <CategoryIcon slug={category.slug} size={28} className="shadow-lg" />
                        </AnimateIn>
                        <MaskReveal as="h1" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
                            {category.name}
                        </MaskReveal>
                    </div>

                    {prefersReducedMotion ? (
                        <p className="text-white/85 max-w-2xl text-base sm:text-lg leading-relaxed">{description}</p>
                    ) : (
                        <motion.p
                            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ delay: 0.2, duration: DURATION.normal, ease: EASE.outExpo }}
                            className="text-white/85 max-w-2xl text-base sm:text-lg leading-relaxed"
                        >
                            {description}
                        </motion.p>
                    )}

                    {usingDemo && (
                        <AnimateIn delay={0.28}>
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400/90 text-amber-950 px-4 py-1.5 text-sm font-semibold">
                                <Sparkles size={16} />
                                {t('categories_page.preview_mode')}
                            </div>
                        </AnimateIn>
                    )}
                </div>
            </section>

            {subcategoryCards.length > 0 && (
                <SectionReveal className="bg-gray-50 border-b border-gray-200 py-10 sm:py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title={t('categories_page.shop_by_type', { category: category.name })}
                            subtitle={t('categories_page.shop_by_type_subtitle')}
                        />
                        <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5" stagger={0.06}>
                            {subcategoryCards.map((sub) => (
                                <StaggerItem key={`sub-${sub.id}`}>
                                    <Link
                                        href={`/products?category=${category.slug}&subcategory=${sub.short_slug || sub.slug}`}
                                        className="group relative block min-h-[140px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 premium-card"
                                    >
                                        <img
                                            src={sub.image || '/images/demo-products/default.jpg'}
                                            alt={sub.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                            onError={(e) => { e.target.src = '/images/demo-products/default.jpg'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/90" />
                                        <div className="relative z-10 flex h-full min-h-[140px] items-end p-4">
                                            <h3 className="text-sm sm:text-base font-bold text-white leading-tight transition-transform duration-300 group-hover:translate-x-0.5">
                                                {sub.name}
                                            </h3>
                                        </div>
                                    </Link>
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                    </div>
                </SectionReveal>
            )}

            {featuredProducts.length > 0 && (
                <SectionReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <SectionHeader
                        title={t('categories_page.featured_category', { category: category.name })}
                        subtitle={t('categories_page.featured_subtitle')}
                    />
                    <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" stagger={0.05}>
                        {featuredProducts.slice(0, 8).map((product) => (
                            <StaggerItem key={`featured-${product.id}`}>
                                <ProductCard product={product} />
                            </StaggerItem>
                        ))}
                    </StaggerChildren>
                </SectionReveal>
            )}

            {popularBrands.length > 0 && (
                <SectionReveal className="bg-white border-y border-gray-100 py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title={t('categories_page.popular_brands')}
                            subtitle={t('categories_page.popular_brands_subtitle')}
                        />
                        <StaggerChildren className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4" stagger={0.04}>
                            {popularBrands.map((brand) => (
                                <StaggerItem key={brand.name}>
                                    <Link
                                        href={`/products?category=${category.slug}&brand=${brand.name}`}
                                        className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 bg-white hover:-translate-y-0.5"
                                    >
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all duration-300 group-hover:scale-105">
                                            <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/images/demo-products/default.jpg'; }} />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700 text-center">{brand.name}</span>
                                    </Link>
                                </StaggerItem>
                            ))}
                        </StaggerChildren>
                    </div>
                </SectionReveal>
            )}

            <SectionReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <SectionHeader
                    title={t('categories_page.all_products_title', { category: category.name })}
                    subtitle={t('categories_page.all_products_subtitle', { count: productTotal })}
                    actionText={t('categories_page.view_all_grid')}
                    actionLink={`/products?category=${category.slug}`}
                />
                {productList.length > 0 ? (
                    <>
                        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" stagger={0.05}>
                            {productList.map((product) => (
                                <StaggerItem key={`grid-${product.id}`}>
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
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('categories_page.no_products_yet')}</h3>
                            <p className="text-gray-500 mb-6">{t('categories_page.no_products_check_back')}</p>
                            <Link href={`/products?category=${category.slug}`} className="premium-cta inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors">
                                {t('categories_page.browse_category', { category: category.name })}
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </AnimateIn>
                )}
            </SectionReveal>

            <SectionReveal className="bg-primary-950 text-white py-12 sm:py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimateIn className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('categories_page.shop_with_confidence', { category: category.name })}</h2>
                        <p className="text-primary-200 max-w-2xl mx-auto">{t('categories_page.shop_with_confidence_desc')}</p>
                    </AnimateIn>
                    <StaggerChildren className="grid grid-cols-1 sm:grid-cols-3 gap-6" stagger={0.1}>
                        {trustItems.map(({ icon: TrustIcon, title, text }) => (
                            <StaggerItem key={title}>
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center transition-all duration-300 hover:bg-white/10 hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-full bg-primary-600/30 flex items-center justify-center mx-auto mb-4">
                                        <TrustIcon size={22} className="text-primary-300" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{title}</h3>
                                    <p className="text-primary-200 text-sm">{text}</p>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerChildren>
                    <AnimateIn delay={0.2} className="text-center mt-8">
                        <Link href={`/products?category=${category.slug}`} className="premium-cta inline-flex items-center gap-2 bg-white text-primary-900 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
                            {t('categories_page.browse_all_category', { category: category.name })}
                            <ArrowRight size={18} />
                        </Link>
                    </AnimateIn>
                </div>
            </SectionReveal>
        </AppLayout>
    );
}
