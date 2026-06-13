import React from 'react';
import useTranslation from '@/hooks/useTranslation';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/Product/ProductCard';
import Pagination from '@/Components/UI/Pagination';
import { Link } from '@inertiajs/react';
import { ShieldCheck, Truck, Headphones, ArrowRight, Sparkles } from 'lucide-react';

export default function Show({
    category,
    products,
    usingDemo = false,
    featuredProducts = [],
    subcategoryCards = [],
    popularBrands = [],
}) {
    const { t } = useTranslation();
    const productList = products?.data ?? [];
    const productTotal = products?.total ?? productList.length;
    const bannerImage = category?.image || `/images/categories/${category?.slug}.jpg`;
    const description = category?.description
        || t('categories_page.default_category_desc', { category: category?.name?.toLowerCase() ?? '' });

    const SectionTitle = ({ title, subtitle, actionText, actionLink }) => (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div className="max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
                {subtitle && <p className="mt-2 text-base text-gray-500">{subtitle}</p>}
            </div>
            {actionText && actionLink && (
                <Link href={actionLink} className="mt-4 sm:mt-0 inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold">
                    {actionText}
                    <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
            )}
        </div>
    );

    if (!category) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">{t('categories_page.category_not_found')}</h1>
                    <Link href="/categories" className="mt-4 inline-block text-primary-600 font-semibold">{t('categories_page.browse_all')}</Link>
                </div>
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
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/images/categories/default.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <nav className="flex items-center gap-2 text-sm text-white/70 mb-6 flex-wrap">
                        <Link href="/" className="hover:text-white transition-colors">{t('categories_page.home')}</Link>
                        <span>/</span>
                        <Link href="/categories" className="hover:text-white transition-colors">{t('categories_page.categories')}</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{category.name}</span>
                    </nav>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">{category.name}</h1>
                    <p className="text-white/85 max-w-2xl text-base sm:text-lg leading-relaxed">{description}</p>
                    {usingDemo && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400/90 text-amber-950 px-4 py-1.5 text-sm font-semibold">
                            <Sparkles size={16} />
                            {t('categories_page.preview_mode')}
                        </div>
                    )}
                </div>
            </section>

            {subcategoryCards.length > 0 && (
                <section className="bg-gray-50 border-b border-gray-200 py-10 sm:py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionTitle
                            title={t('categories_page.shop_by_type', { category: category.name })}
                            subtitle={t('categories_page.shop_by_type_subtitle')}
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                            {subcategoryCards.map((sub) => (
                                <Link
                                    key={`sub-${sub.id}`}
                                    href={`/products?category=${category.slug}&subcategory=${sub.short_slug || sub.slug}`}
                                    className="group relative block min-h-[140px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <img
                                        src={sub.image || '/images/demo-products/default.jpg'}
                                        alt={sub.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.src = '/images/demo-products/default.jpg'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="relative z-10 flex h-full min-h-[140px] items-end p-4">
                                        <h3 className="text-sm sm:text-base font-bold text-white leading-tight">{sub.name}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {featuredProducts.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <SectionTitle
                        title={t('categories_page.featured_category', { category: category.name })}
                        subtitle={t('categories_page.featured_subtitle')}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {featuredProducts.slice(0, 8).map((product) => (
                            <ProductCard key={`featured-${product.id}`} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {popularBrands.length > 0 && (
                <section className="bg-white border-y border-gray-100 py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionTitle
                            title={t('categories_page.popular_brands')}
                            subtitle={t('categories_page.popular_brands_subtitle')}
                        />
                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
                            {popularBrands.map((brand) => (
                                <Link
                                    key={brand.name}
                                    href={`/products?category=${category.slug}&brand=${brand.name}`}
                                    className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all bg-white"
                                >
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all">
                                        <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/images/demo-products/default.jpg'; }} />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700 text-center">{brand.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <SectionTitle
                    title={t('categories_page.all_products_title', { category: category.name })}
                    subtitle={t('categories_page.all_products_subtitle', { count: productTotal })}
                    actionText={t('categories_page.view_all_grid')}
                    actionLink={`/products?category=${category.slug}`}
                />
                {productList.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {productList.map((product) => (
                                <ProductCard key={`grid-${product.id}`} product={product} />
                            ))}
                        </div>
                        <Pagination links={products?.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('categories_page.no_products_yet')}</h3>
                        <p className="text-gray-500 mb-6">{t('categories_page.no_products_check_back')}</p>
                        <Link href={`/products?category=${category.slug}`} className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors">
                            {t('categories_page.browse_category', { category: category.name })}
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </section>

            <section className="bg-primary-950 text-white py-12 sm:py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('categories_page.shop_with_confidence', { category: category.name })}</h2>
                        <p className="text-primary-200 max-w-2xl mx-auto">{t('categories_page.shop_with_confidence_desc')}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {trustItems.map(({ icon: TrustIcon, title, text }) => (
                            <div key={title} className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-primary-600/30 flex items-center justify-center mx-auto mb-4">
                                    <TrustIcon size={22} className="text-primary-300" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{title}</h3>
                                <p className="text-primary-200 text-sm">{text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link href={`/products?category=${category.slug}`} className="inline-flex items-center gap-2 bg-white text-primary-900 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
                            {t('categories_page.browse_all_category', { category: category.name })}
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
