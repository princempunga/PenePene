import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    MapPin, ShieldCheck, Truck, ArrowRight, MessageCircle, Heart,
    Phone, Sparkles, ShoppingCart, Zap, X,
} from 'lucide-react';
import ImageGallery from '@/Components/Product/ImageGallery';
import RatingStars from '@/Components/UI/RatingStars';
import ProductCard from '@/Components/Product/ProductCard';
import ChatWindow from '@/Components/Chat/ChatWindow';
import { dispatchToast } from '@/Components/UI/Toast';
import useTranslation from '@/hooks/useTranslation';

function ProductActions({
    availableStock,
    adding,
    favoriting,
    isFavorited,
    onBuyNow,
    onAddToCart,
    onToggleFavorite,
}) {
    const { t } = useTranslation();
    const disabled = adding || availableStock < 1;

    return (
        <div className="w-full space-y-3">
            <button
                type="button"
                onClick={onBuyNow}
                disabled={disabled}
                className="w-full h-14 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Zap className="w-5 h-5 shrink-0" />
                <span>{adding ? t('product.processing') : t('product.buy_now')}</span>
            </button>

            <button
                type="button"
                onClick={onAddToCart}
                disabled={disabled}
                className="w-full h-14 rounded-2xl border-2 border-primary-600 bg-white text-primary-600 font-bold flex items-center justify-center gap-2 whitespace-nowrap hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ShoppingCart className="w-5 h-5 shrink-0" />
                <span>{adding ? t('product.adding') : t('product.add_to_cart')}</span>
            </button>

            <button
                type="button"
                onClick={onToggleFavorite}
                disabled={favoriting}
                aria-label={isFavorited ? t('product.remove_from_wishlist') : t('product.add_to_wishlist')}
                className={`w-full h-14 rounded-2xl border-2 font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFavorited
                        ? 'border-red-300 bg-red-50 text-red-500'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:text-red-500 hover:bg-red-50'
                }`}
            >
                <Heart className={`w-5 h-5 shrink-0 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                <span>{isFavorited ? t('product.saved_to_wishlist') : t('product.add_to_wishlist')}</span>
            </button>
        </div>
    );
}

export default function Show({
    product,
    relatedProducts,
    usingDemo = false,
    favoriteProductId = null,
    isFavorited: initialFavorited = false,
}) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [favoriting, setFavoriting] = useState(false);
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [showChatModal, setShowChatModal] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [startingChat, setStartingChat] = useState(false);
    const autoChatStarted = useRef(false);

    const seller = product.seller;
    const isDemo = usingDemo || product.is_demo;
    const availableStock = isDemo
        ? 99
        : Math.max(0, (product.initial_stock ?? 0) - (product.confirmed_sales ?? 0));

    useEffect(() => {
        setIsFavorited(initialFavorited);
    }, [initialFavorited]);

    const addToCart = (redirect = false) => {
        if (availableStock < 1 || adding) return;

        setAdding(true);

        const payload = isDemo
            ? { demo_slug: product.slug, quantity }
            : { product_id: product.id, quantity };

        router.post('/cart/add', payload, {
            preserveScroll: true,
            onFinish: () => setAdding(false),
            onSuccess: () => {
                if (redirect) {
                    router.visit('/cart');
                } else {
                    dispatchToast(t('product.added_to_cart'));
                }
            },
            onError: () => dispatchToast(t('product.cart_error'), 'error'),
        });
    };

    const toggleFavorite = async () => {
        if (!auth?.user) {
            router.get(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (auth.user.role !== 'buyer') {
            dispatchToast(t('product.wishlist_buyer_only'), 'info');
            return;
        }

        const payload = isDemo
            ? { demo_slug: product.slug }
            : { product_id: Number(favoriteProductId || product.id) };

        if (!payload.demo_slug && (!payload.product_id || Number.isNaN(payload.product_id))) {
            dispatchToast(t('product.wishlist_error'), 'error');
            return;
        }

        if (favoriting) return;

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
                router.get(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                return;
            }
            dispatchToast(error.response?.data?.message || t('product.wishlist_update_error'), 'error');
        } finally {
            setFavoriting(false);
        }
    };

    const startChat = useCallback(async () => {
        if (!auth?.user) {
            const returnUrl = `${window.location.pathname}?openChat=1`;
            router.get(`/login?redirect=${encodeURIComponent(returnUrl)}`);
            return;
        }

        if (auth.user.role !== 'buyer') {
            dispatchToast(t('product.chat_buyer_only'), 'info');
            return;
        }

        if (!seller?.id) {
            dispatchToast(t('product.chat_unavailable'), 'error');
            return;
        }

        setStartingChat(true);
        try {
            const res = await axios.post(
                '/chat/conversations/start',
                { seller_id: seller.id, product_id: product?.id },
                { headers: { Accept: 'application/json' } },
            );

            const id = res.data?.conversation_id;
            if (!id) throw new Error('No conversation id');

            setConversationId(id);
            setShowChatModal(true);

            const url = new URL(window.location.href);
            if (url.searchParams.has('openChat')) {
                url.searchParams.delete('openChat');
                window.history.replaceState({}, '', url.pathname + url.search);
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 419) {
                router.get(`/login?redirect=${encodeURIComponent(`${window.location.pathname}?openChat=1`)}`);
                return;
            }
            dispatchToast(error.response?.data?.message || t('product.chat_error'), 'error');
        } finally {
            setStartingChat(false);
        }
    }, [auth?.user?.id, auth?.user?.role, seller?.id]);

    useEffect(() => {
        if (autoChatStarted.current) return;
        const params = new URLSearchParams(window.location.search);
        if (params.get('openChat') === '1' && auth?.user?.role === 'buyer') {
            autoChatStarted.current = true;
            startChat();
        }
    }, [auth?.user?.id, auth?.user?.role, startChat]);

    const chatPartner = seller?.user
        ? { ...seller.user, business_name: seller.business_name, logo: seller.logo }
        : { name: seller?.business_name, business_name: seller?.business_name };

    const sellerPhone = seller?.phone?.replace(/[^0-9+]/g, '') || '+243812345678';

    return (
        <AppLayout>
            <div className="bg-white border-b overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500 flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
                    <Link href="/" className="hover:text-primary-600 shrink-0">{t('product.breadcrumb_home')}</Link>
                    <span className="mx-2 shrink-0">&gt;</span>
                    {product.category && (
                        <>
                            <Link href={`/categories/${product.category.slug}`} className="hover:text-primary-600 shrink-0">
                                {product.category.name}
                            </Link>
                            <span className="mx-2 shrink-0">&gt;</span>
                        </>
                    )}
                    <span className="text-gray-900 truncate min-w-0">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col xl:flex-row gap-8 xl:gap-12">
                    <div className="w-full xl:w-[42%] shrink-0">
                        <ImageGallery images={product.images} productName={product.name} />
                    </div>

                    <div className="flex-1 w-full min-w-0">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                                {product.name}
                            </h1>
                            {isDemo && (
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-900 px-4 py-1.5 text-sm font-semibold">
                                    <Sparkles size={16} />
                                    {t('product.demo_preview_badge')}
                                </div>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                                {product.average_rating > 0 ? (
                                    <RatingStars rating={product.average_rating} count={product.total_reviews} />
                                ) : (
                                    <span className="text-gray-500">{t('product.no_reviews_yet')}</span>
                                )}
                                <span className="text-gray-300 hidden sm:inline">|</span>
                                <span className="text-gray-500 whitespace-nowrap">
                                    <span className="font-semibold text-gray-900">{product.confirmed_sales ?? 0}</span> {t('product.sold')}
                                </span>
                            </div>

                            <div className="p-5 bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-2xl mb-6">
                                <div className="flex flex-wrap items-end gap-3">
                                    <span className="text-3xl sm:text-4xl font-extrabold text-primary-600 whitespace-nowrap">
                                        {product.currency} {parseFloat(product.sale_price || product.price).toLocaleString()}
                                    </span>
                                    {product.sale_price && (
                                        <span className="text-lg text-gray-400 line-through mb-1 whitespace-nowrap">
                                            {parseFloat(product.price).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 w-full p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between gap-4 mb-5">
                                <span className="font-semibold text-gray-900">{t('product.quantity')}</span>
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                                    >−</button>
                                    <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                                        className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                                    >+</button>
                                </div>
                            </div>

                            <p className="text-sm mb-6">
                                {availableStock > 0 ? (
                                    <span className="text-green-600 font-medium">{t('product.available_items', { count: availableStock })}</span>
                                ) : (
                                    <span className="text-red-600 font-medium">{t('product.out_of_stock')}</span>
                                )}
                            </p>

                            <ProductActions
                                availableStock={availableStock}
                                adding={adding}
                                favoriting={favoriting}
                                isFavorited={isFavorited}
                                onBuyNow={startChat}
                                onAddToCart={() => addToCart(false)}
                                onToggleFavorite={toggleFavorite}
                            />
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('product.product_description')}</h3>
                            <div className="prose max-w-none text-gray-600">
                                <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full xl:w-80 shrink-0">
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-28 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <Link
                                    href={isDemo ? '/products' : `/sellers/${seller.slug}`}
                                    className="w-16 h-16 bg-gray-100 rounded-full border border-gray-200 overflow-hidden shrink-0"
                                >
                                    {seller.logo ? (
                                        <img src={`/storage/${seller.logo}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary-400 font-bold text-2xl">
                                            {seller.business_name?.charAt(0)}
                                        </div>
                                    )}
                                </Link>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">
                                        <Link href={isDemo ? '/products' : `/sellers/${seller.slug}`} className="hover:text-primary-600">
                                            {seller.business_name}
                                        </Link>
                                    </h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                        <MapPin size={14} className="shrink-0" />
                                        <span className="truncate">{seller.city}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-3 border-y border-gray-100 mb-4">
                                <div className="text-center flex-1">
                                    <span className="block text-xs text-gray-500">{t('product.rating')}</span>
                                    <span className="font-bold text-gray-900">
                                        {seller.average_rating > 0 ? parseFloat(seller.average_rating).toFixed(1) : t('product.seller_new')}
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div className="text-center flex-1">
                                    <span className="block text-xs text-gray-500">{t('product.joined')}</span>
                                    <span className="font-bold text-gray-900">
                                        {seller.created_at ? new Date(seller.created_at).getFullYear() : '2024'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <a
                                    href={`https://wa.me/${sellerPhone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex items-center justify-center gap-2 h-11 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    <MessageCircle size={18} />
                                    {t('product.whatsapp')}
                                </a>
                                <a
                                    href={`tel:${sellerPhone}`}
                                    className="w-full flex items-center justify-center gap-2 h-11 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-sm transition-colors"
                                >
                                    <Phone size={18} />
                                    {t('product.show_number')}
                                </a>
                                <button
                                    type="button"
                                    onClick={startChat}
                                    disabled={startingChat}
                                    className="w-full flex items-center justify-center gap-2 h-11 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                                >
                                    <MessageCircle size={18} />
                                    {startingChat ? t('product.opening_chat') : t('product.chat_with_seller')}
                                </button>
                                {!isDemo && seller.slug && (
                                    <Link
                                        href={`/sellers/${seller.slug}`}
                                        className="w-full flex items-center justify-center gap-2 h-11 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl font-semibold text-sm transition-colors"
                                    >
                                        {t('product.view_store')}
                                        <ArrowRight size={16} />
                                    </Link>
                                )}
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900">{t('product.secure_payments')}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{t('product.secure_payments_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg shrink-0">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900">{t('product.local_delivery')}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{t('product.local_delivery_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {relatedProducts?.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('product.related_products')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {relatedProducts.map((rel) => (
                                <ProductCard key={rel.id} product={rel} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showChatModal && conversationId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg relative">
                        <ChatWindow
                            conversationId={conversationId}
                            currentUserId={auth.user?.id}
                            otherUser={chatPartner}
                            onClose={() => setShowChatModal(false)}
                            isModal
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
