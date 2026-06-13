import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { MapPin, Heart, ShieldCheck, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
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
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col h-full group relative"
        >
            <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={favoriting}
                className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-all shadow-sm cursor-pointer disabled:opacity-60 ${
                    isFavorited
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white'
                }`}
                aria-label={isFavorited ? t('product.remove_from_wishlist') : t('product.add_to_wishlist')}
            >
                <Heart size={18} className={isFavorited ? 'fill-current' : ''} />
            </button>

            {displayBadge && (
                <div className={`absolute top-3 left-3 z-10 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm ${BADGE_STYLES[displayBadge] || 'bg-primary-600 text-white'}`}>
                    {t(BADGE_LABEL_KEYS[displayBadge] || displayBadge)}
                </div>
            )}

            <Link href={productUrl} className="block relative aspect-[4/3] overflow-hidden bg-gray-50 cursor-pointer">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                />
            </Link>

            <div className={`${compact ? 'p-3' : 'p-4'} flex flex-col flex-grow`}>
                {product.category && (
                    <span className="text-xs text-primary-600 font-semibold mb-1 uppercase tracking-wider">
                        {product.category.name}
                    </span>
                )}

                <Link href={productUrl} className="block mb-2 flex-grow cursor-pointer">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto">
                    <div className="flex items-end gap-2 mb-2">
                        <span className={`${compact ? 'text-lg' : 'text-xl'} font-extrabold text-gray-900`}>
                            {product.currency || 'USD'} {parseFloat(product.sale_price || product.price).toLocaleString()}
                        </span>
                        {product.sale_price && (
                            <span className="text-sm text-gray-400 line-through mb-0.5 font-medium">
                                {parseFloat(product.price).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 text-xs text-gray-500 mb-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 truncate min-w-0">
                                {product.seller?.is_verified && <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />}
                                <span className="truncate font-medium">
                                    {product.seller?.business_name || t('product.verified_seller')}
                                </span>
                            </div>
                            {rating > 0 && <RatingStars rating={rating} size={12} />}
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-400">
                            <MapPin size={12} className="flex-shrink-0" />
                            <span className="truncate">{product.city || product.seller?.city || t('product.local_delivery')}</span>
                        </div>
                    </div>

                    {showActions && (
                        <div className="flex gap-2 pt-3 border-t border-gray-50">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={outOfStock || adding}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                            >
                                <ShoppingCart size={14} />
                                {adding ? t('product.adding') : outOfStock ? t('product.out_of_stock') : t('product.add_to_cart')}
                            </button>
                            <Link
                                href={productUrl}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 border border-gray-200 hover:border-primary-500 hover:text-primary-600 text-gray-700 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                            >
                                <Eye size={14} />
                                {isDemo ? t('product.preview') : t('product.view_details')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
