import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { MapPin, Heart, ShieldCheck, ShoppingCart, Eye } from 'lucide-react';
import RatingStars from '../UI/RatingStars';
import { dispatchToast } from '@/Components/UI/Toast';
import useTranslation from '@/hooks/useTranslation';

const BADGE_STYLES = {
    sponsored: 'bg-amber-400 text-amber-900',
    hot_deal: 'bg-red-500 text-white',
    sale: 'bg-red-500 text-white',
    new: 'bg-emerald-500 text-white',
    popular: 'bg-primary-600 text-white',
};

const BADGE_LABEL_KEYS = {
    sponsored: 'product.badge_sponsored',
    hot_deal: 'product.badge_hot_deal',
    sale: 'product.badge_sale',
    new: 'product.badge_new',
    popular: 'product.badge_popular',
};

const LEGACY_BADGE_MAP = {
    Sponsored: 'sponsored',
    'Hot Deal': 'hot_deal',
    Sale: 'sale',
    New: 'new',
    Popular: 'popular',
};

const DEFAULT_PRODUCT_IMAGE = '/images/demo-products/default.jpg';

function getProductImage(product) {
    if (product.demo_image) {
        return product.demo_image;
    }

    const primaryImage = product.images?.find((img) => img.is_primary)?.image_path
        || product.images?.[0]?.image_path;

    return primaryImage ? `/storage/${primaryImage}` : DEFAULT_PRODUCT_IMAGE;
}

function normalizeBadge(badge) {
    if (!badge) return null;
    if (BADGE_STYLES[badge]) return badge;
    return LEGACY_BADGE_MAP[badge] || null;
}

function getDisplayBadge(product, badge) {
    const normalized = normalizeBadge(badge);
    if (normalized) return normalized;
    if (product.badge) return normalizeBadge(product.badge);
    if (product.is_sponsored) return 'sponsored';
    if (product.sale_price) return 'sale';
    return null;
}

function isOutOfStock(product) {
    if (product.is_demo) {
        return false;
    }

    const stock = (product.initial_stock ?? 0) - (product.confirmed_sales ?? 0);

    return stock < 1;
}

export default function ProductCard({ product, badge, showActions = true, compact = false }) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const imageUrl = getProductImage(product);
    const displayBadge = getDisplayBadge(product, badge);
    const isDemo = product.is_demo;
    const rating = product.average_rating || product.seller?.average_rating || 0;
    const productUrl = `/products/${product.slug}`;
    const outOfStock = isOutOfStock(product);
    const [adding, setAdding] = useState(false);
    const [isFavorited, setIsFavorited] = useState(Boolean(product.is_favorited));
    const [favoriting, setFavoriting] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (outOfStock || adding) {
            return;
        }

        setAdding(true);

        const payload = isDemo
            ? { demo_slug: product.slug, quantity: 1 }
            : { product_id: product.id, quantity: 1 };

        router.post('/cart/add', payload, {
            preserveScroll: true,
            onFinish: () => setAdding(false),
        });
    };

    const handleToggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!auth?.user) {
            router.get(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }

        if (auth.user.role !== 'buyer') {
            dispatchToast(t('product.wishlist_buyer_only'), 'info');
            return;
        }

        if (favoriting) {
            return;
        }

        const payload = isDemo || (typeof product.id === 'string' && String(product.id).startsWith('demo-'))
            ? { demo_slug: product.slug }
            : { product_id: Number(product.id) };

        if (!payload.demo_slug && (!payload.product_id || Number.isNaN(payload.product_id))) {
            dispatchToast(t('product.wishlist_error'), 'error');
            return;
        }

        setFavoriting(true);

        try {
            const res = await axios.post('/favorites/toggle', payload, {
                headers: { Accept: 'application/json' },
            });

            setIsFavorited(res.data.is_favorited);
            dispatchToast(res.data.message, res.data.is_favorited ? 'success' : 'info');
            window.dispatchEvent(new CustomEvent('wishlist-updated', {
                detail: { wishlist_count: res.data.wishlist_count },
            }));
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 419) {
                router.get(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                return;
            }
            dispatchToast(error.response?.data?.message || t('product.wishlist_update_error'), 'error');
        } finally {
            setFavoriting(false);
        }
    };

    return (
        <div className="web-card premium-card bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col h-full group relative min-w-0 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={favoriting}
                className={`absolute top-2 right-2 z-20 rounded-full transition-all shadow-sm cursor-pointer disabled:opacity-60 ${
                    compact ? 'p-1.5' : 'p-2'
                } ${
                    isFavorited
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : 'bg-white text-gray-400 hover:text-red-500 hover:bg-gray-50'
                }`}
                aria-label={isFavorited ? t('product.remove_from_wishlist') : t('product.add_to_wishlist')}
            >
                <Heart size={compact ? 15 : 18} className={isFavorited ? 'fill-current' : ''} />
            </button>

            {displayBadge && (
                <div className={`absolute top-2 left-2 z-10 font-bold rounded-md shadow-sm ${
                    compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
                } ${BADGE_STYLES[displayBadge] || 'bg-primary-600 text-white'}`}>
                    {t(BADGE_LABEL_KEYS[displayBadge] || displayBadge)}
                </div>
            )}

            <Link
                href={productUrl}
                className="block relative overflow-hidden bg-gray-50 cursor-pointer h-32 sm:h-36 md:h-auto md:aspect-[4/3]"
            >
                <img
                    src={imageUrl}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="web-image-zoom w-full h-full object-contain p-2 md:object-cover md:p-0"
                    onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                />
            </Link>

            <div className="p-3 md:p-4 flex flex-col flex-grow min-w-0">
                {product.category && (
                    <span className="text-[10px] md:text-xs text-primary-600 font-semibold mb-1 uppercase tracking-wider">
                        {product.category.name}
                    </span>
                )}

                <Link href={productUrl} className="block mb-1.5 md:mb-2 flex-grow cursor-pointer min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors text-xs sm:text-sm md:text-base">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto min-w-0">
                    <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5 mb-1.5 md:mb-2">
                        <span className="text-sm md:text-lg lg:text-xl font-extrabold text-gray-900">
                            {product.currency || 'USD'} {parseFloat(product.sale_price || product.price).toLocaleString()}
                        </span>
                        {product.sale_price && (
                            <span className="text-[10px] md:text-sm text-gray-400 line-through font-medium">
                                {parseFloat(product.price).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 text-[10px] md:text-xs text-gray-500 mb-2 md:mb-3">
                        <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-1 min-w-0">
                                {product.seller?.is_verified && <ShieldCheck size={12} className="text-green-500 flex-shrink-0 md:w-3.5 md:h-3.5" />}
                                <span className="truncate font-medium">
                                    {product.seller?.business_name || t('product.verified_seller')}
                                </span>
                            </div>
                            {rating > 0 && (
                                <div className="hidden md:block shrink-0">
                                    <RatingStars rating={rating} size={12} />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 text-gray-400 min-w-0">
                            <MapPin size={11} className="flex-shrink-0 md:w-3 md:h-3" />
                            <span className="truncate">{product.city || product.seller?.city || t('product.local_delivery')}</span>
                        </div>
                    </div>

                    {showActions && (
                        <div className="flex flex-col md:flex-row gap-1.5 md:gap-2 w-full min-w-0 pt-2 md:pt-3 border-t border-gray-50">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={outOfStock || adding}
                                className="web-btn flex-1 min-w-0 w-full inline-flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors cursor-pointer text-[11px] md:text-xs py-2 px-2 md:py-2.5"
                            >
                                <ShoppingCart size={14} className="shrink-0" />
                                <span className="truncate">
                                    {adding ? t('product.adding') : outOfStock ? t('product.out_of_stock') : t('product.add_to_cart')}
                                </span>
                            </button>
                            <Link
                                href={productUrl}
                                className="web-btn flex-1 min-w-0 w-full inline-flex items-center justify-center gap-1.5 border border-gray-200 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer text-[11px] md:text-xs py-2 px-2 md:py-2.5"
                            >
                                <Eye size={14} className="shrink-0" />
                                <span className="truncate">
                                    {isDemo ? t('product.preview') : t('product.view_details')}
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
