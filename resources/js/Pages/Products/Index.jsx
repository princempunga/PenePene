import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/Product/ProductCard';
import ProductFilters from '@/Components/Product/ProductFilters';
import Pagination from '@/Components/UI/Pagination';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';

export default function Index({
    products,
    filters = {},
    usingDemo = false,
    category = null,
    subcategory = null,
    subcategoryMeta = null,
    brandOptions = [],
    pageMeta = null,
}) {
    const { t } = useTranslation();

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

    return (
        <AppLayout>
            <section className="relative overflow-hidden bg-gray-900">
                <img
                    src={bannerImage}
                    alt={pageTitle}
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                    onError={(e) => { e.target.src = '/images/demo-products/default.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/50" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2">{pageTitle}</h1>
                    <p className="text-gray-300 max-w-2xl text-sm sm:text-base">{description}</p>
                    <p className="mt-3 text-sm text-gray-400">
                        {t('products_page.products_found', { count: products?.total ?? productList.length })}
                    </p>
                    {usingDemo && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400/90 text-amber-950 px-4 py-1.5 text-sm font-semibold">
                            <Sparkles size={16} />
                            {t('products_page.demo_preview')}
                        </div>
                    )}
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    <ProductFilters filters={filters} brandOptions={brandOptions} />

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-gray-600 text-sm">
                                {t('products_page.showing_products', {
                                    from: products?.from || 0,
                                    to: products?.to || 0,
                                    total: products?.total ?? productList.length,
                                })}
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-gray-600 text-sm flex items-center gap-2 whitespace-nowrap">
                                    <SlidersHorizontal size={16} />
                                    {t('products_page.sort_label')}
                                </label>
                                <select
                                    value={filters.sort || 'newest'}
                                    onChange={handleSortChange}
                                    className="border border-gray-300 rounded-lg text-sm py-2 pl-3 pr-8 focus:ring-primary-500 focus:border-primary-500 min-w-[160px]"
                                >
                                    <option value="newest">{t('products_page.sort_newest')}</option>
                                    <option value="price_asc">{t('products_page.sort_price_asc')}</option>
                                    <option value="price_desc">{t('products_page.sort_price_desc')}</option>
                                    <option value="popular">{t('products_page.sort_popular')}</option>
                                    <option value="rating">{t('products_page.sort_rating')}</option>
                                </select>
                            </div>
                        </div>

                        {productList.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                    {productList.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                                <Pagination links={products?.links} />
                            </>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('products_page.no_products')}</h3>
                                <p className="text-gray-500">{t('products_page.browse_subcategory')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
