import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { MapPin, Heart, ShieldCheck, ShoppingCart, Eye, Zap } from 'lucide-react';
import RatingStars from '@/Components/UI/RatingStars';
import { dispatchToast } from '@/Components/UI/Toast';
import useTranslation from '@/hooks/useTranslation';

const DEFAULT_PRODUCT_IMAGE = '/images/demo-products/default.jpg';

function getProductImage(product) {
    if (product.demo_image) {
        return product.demo_image;
    }

    const primaryImage = product.images?.find((img) => img.is_primary)?.image_path
        || product.images?.[0]?.image_path;

    return primaryImage ? `/storage/${primaryImage}` : DEFAULT_PRODUCT_IMAGE;
}

function getDiscountPercent(product) {
    if (!product.sale_price || !product.price) {
        return null;
    }

    const original = parseFloat(product.price);
    const sale = parseFloat(product.sale_price);

    if (original <= sale || original <= 0) {
        return null;
    }

    return Math.round((1 - sale / original) * 100);
}

function isOutOfStock(product) {
    if (product.is_demo) {
        return false;
    }

    return ((product.initial_stock ?? 0) - (product.confirmed_sales ?? 0)) < 1;
}

export default function FlashDealCard({ product }) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const imageUrl = getProductImage(product);
    const isDemo = product.is_demo;
    const rating = product.average_rating || product.seller?.average_rating || 0;
    const productUrl = `/products/${product.slug}`;
    const outOfStock = isOutOfStock(product);
    const discount = getDiscountPercent(product);
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
        <article className="flash-deal-card group bg-white rounded-2xl border border-white/80 overflow-hidden flex flex-col h-full shadow-lg shadow-black/10">
            <div className="relative">
                <button
                    type="button"
                    onClick={handleToggleWishlist}
                    disabled={favoriting}
                    className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-all shadow-md disabled:opacity-60 ${
                        isFavorited
                            ? 'bg-red-50 text-red-500'
                            : 'bg-white/95 text-gray-400 hover:text-red-500'
                    }`}
                    aria-label={isFavorited ? t('product.remove_from_wishlist') : t('product.add_to_wishlist')}
                >
                    <Heart size={18} className={isFavorited ? 'fill-current' : ''} />
                </button>

                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1 bg-[#EF4444] text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-sm">
                        <Zap size={12} className="fill-current" />
                        {t('home.flash_deals')}
                    </span>
                    {discount !== null && (
                        <span className="inline-flex w-fit bg-[#EF4444] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                            -{discount}%
                        </span>
                    )}
                </div>

                <Link href={productUrl} className="block relative aspect-[4/3] overflow-hidden bg-gray-50">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                    />
                </Link>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                {product.category && (
                    <span className="text-[11px] text-primary-600 font-bold mb-1.5 uppercase tracking-wider">
                        {product.category.name}
                    </span>
                )}

                <Link href={productUrl} className="block mb-3 flex-grow">
                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors text-sm sm:text-base">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-end gap-2 mb-3">
                    <span className="text-xl font-extrabold text-[#0F2D7A]">
                        {product.currency || 'USD'} {parseFloat(product.sale_price || product.price).toLocaleString()}
                    </span>
                    {product.sale_price && (
                        <span className="text-sm text-gray-400 line-through font-medium pb-0.5">
                            {parseFloat(product.price).toLocaleString()}
                        </span>
                    )}
                </div>

                <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate min-w-0">
                            {product.seller?.is_verified && (
                                <ShieldCheck size={14} className="text-green-500 shrink-0" />
                            )}
                            <span className="truncate font-semibold text-gray-700">
                                {product.seller?.business_name || t('product.verified_seller')}
                            </span>
                        </div>
                        {rating > 0 && <RatingStars rating={rating} size={12} />}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{product.city || product.seller?.city || t('product.local_delivery')}</span>
                    </div>
                </div>

                <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={outOfStock || adding}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#F59E0B] hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors duration-300 shadow-sm"
                    >
                        <ShoppingCart size={14} />
                        {adding ? t('product.adding') : outOfStock ? t('product.out_of_stock') : t('product.add_to_cart')}
                    </button>
                    <Link
                        href={productUrl}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 text-xs font-bold py-2.5 rounded-xl transition-colors duration-300"
                    >
                        <Eye size={14} />
                        {isDemo ? t('product.preview') : t('product.view_details')}
                    </Link>
                </div>
            </div>
        </article>
    );
}
