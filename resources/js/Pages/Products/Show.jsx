import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    MapPin, ShieldCheck, Truck, ArrowRight, MessageCircle, Heart,
    Phone, Sparkles, ShoppingCart, Zap, X, Zap as BoltIcon,
    Package as PackageIcon, ClipboardList, CheckCircle2, ChevronDown,
} from 'lucide-react';
import ImageGallery from '@/Components/Product/ImageGallery';
import RatingStars from '@/Components/UI/RatingStars';
import ProductCard from '@/Components/Product/ProductCard';
import ChatWindow from '@/Components/Chat/ChatWindow';
import { dispatchToast } from '@/Components/UI/Toast';
import useTranslation from '@/hooks/useTranslation';
import ReportSellerModal from '@/Components/ReportSellerModal';
import { Flag, CheckCircle, Package } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

function ProductActions({
    availableStock,
    adding,
    favoriting,
    isFavorited,
    onBuyNow,
    onAddToCart,
    onToggleFavorite,
    onOrderNow,
}) {
    const { t } = useTranslation();
    const disabled = adding || availableStock < 1;

    return (
        <div className="w-full space-y-2.5">
            {/* Bouton principal : Commander directement */}
            <button
                type="button"
                onClick={onOrderNow}
                disabled={disabled}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                <ClipboardList size={18} className="shrink-0" />
                <span>{disabled && availableStock < 1 ? 'Rupture de stock' : 'Commander maintenant'}</span>
            </button>

            {/* Bouton secondaire : Contacter le vendeur */}
            <button
                type="button"
                onClick={onBuyNow}
                disabled={adding}
                className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                <MessageCircle size={18} className="shrink-0" />
                <span>{adding ? t('product.processing') : 'Contacter le vendeur'}</span>
            </button>

            {/* Ligne 2 : Panier & Favoris côte à côte */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={onAddToCart}
                    disabled={disabled}
                    className="w-full py-2.5 px-3 rounded-xl border border-primary-600 hover:bg-primary-50 active:scale-[0.98] text-primary-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <ShoppingCart size={15} className="shrink-0" />
                    <span className="truncate">{adding ? t('product.adding') : t('product.add_to_cart')}</span>
                </button>

                <button
                    type="button"
                    onClick={onToggleFavorite}
                    disabled={favoriting}
                    aria-label={isFavorited ? t('product.remove_from_wishlist') : t('product.add_to_wishlist')}
                    className={`w-full py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                        isFavorited
                            ? 'border-red-300 bg-red-50 text-red-500'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:text-red-500 hover:bg-red-50'
                    }`}
                >
                    <Heart size={15} className={`shrink-0 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                    <span className="truncate">{isFavorited ? 'Sauvegardé' : 'Ajouter aux favoris'}</span>
                </button>
            </div>
        </div>
    );
}

/* ── Modal de commande directe ──────────────────────────────── */
function OrderModal({ product, quantity, availableStock, onClose, auth }) {
    const [address, setAddress] = useState('');
    const [notes, setNotes]     = useState('');
    const [qty, setQty]         = useState(quantity);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone]       = useState(false);

    const unitPrice = parseFloat(product.sale_price || product.price);
    const total     = unitPrice * qty;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!auth?.user) {
            router.get(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        setSubmitting(true);
        router.post('/buyer/orders', {
            product_id:       product.id,
            quantity:         qty,
            shipping_address: address,
            notes:            notes || null,
        }, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
            onSuccess: () => setDone(true),
        });
    };

    if (done) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Commande envoyée !</h3>
                    <p className="text-gray-500 text-sm mb-6">Le vendeur a été notifié et va traiter votre demande très bientôt.</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Fermer
                        </button>
                        <button
                            onClick={() => router.visit('/buyer/orders')}
                            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                        >
                            Mes commandes
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                            <ClipboardList size={18} className="text-green-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">Commander maintenant</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Corps */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
                    <div className="p-5 space-y-5 flex-1">

                        {/* Résumé produit */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                {product.images?.[0]?.image_path ? (
                                    <img src={`/storage/${product.images[0].image_path}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <PackageIcon size={24} className="m-auto mt-3 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate text-sm">{product.name}</p>
                                <p className="text-primary-600 font-bold">{product.currency} {unitPrice.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Quantité */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantité</label>
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-36">
                                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">−</button>
                                <span className="flex-1 text-center font-bold text-gray-900">{qty}</span>
                                <button type="button" onClick={() => setQty(Math.min(availableStock, qty + 1))}
                                    className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">+</button>
                            </div>
                        </div>

                        {/* Adresse */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Adresse de livraison <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                rows={3}
                                placeholder="Ex : Av. de la Paix, Commune de Gombe, Kinshasa…"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Notes <span className="text-gray-400 font-normal">(facultatif)</span>
                            </label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={2}
                                placeholder="Instructions spéciales, couleur, taille…"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer avec total et bouton */}
                    <div className="p-5 border-t border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-600">Total estimé</span>
                            <span className="text-lg font-black text-green-700">{product.currency} {total.toLocaleString()}</span>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !address.trim()}
                            className="w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ClipboardList size={18} />
                            {submitting ? 'Envoi en cours…' : 'Confirmer la commande'}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-2">Le vendeur recevra votre commande et vous contactera</p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Show({
    product,
    relatedProducts,
    reviews = [],
    favoriteProductId = null,
    isFavorited: initialFavorited = false,
}) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const { formatAmount } = useCurrency();
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [favoriting, setFavoriting] = useState(false);
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [showChatModal, setShowChatModal] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [startingChat, setStartingChat] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const autoChatStarted = useRef(false);

    const seller = product.seller;
    const availableStock = Math.max(0, (product.initial_stock ?? 0) - (product.confirmed_sales ?? 0));

    useEffect(() => {
        setIsFavorited(initialFavorited);
    }, [initialFavorited]);

    const addToCart = (redirect = false) => {
        if (availableStock < 1 || adding) return;

        setAdding(true);

        const payload = { product_id: product.id, quantity };

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

        const payload = { product_id: Number(favoriteProductId || product.id) };

        if (!payload.product_id || Number.isNaN(payload.product_id)) {
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
        ? { ...seller.user, business_name: seller.business_name, logo: seller.logo, seller_id: seller.id }
        : { name: seller?.business_name, business_name: seller?.business_name, seller_id: seller?.id };

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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    {/* Left Column: Image Gallery (4 Cols) */}
                    <div className="lg:col-span-4 w-full">
                        <div className="sticky top-24">
                            <ImageGallery images={product.images} productName={product.name} />
                        </div>
                    </div>

                    {/* Middle Column: Product Information & Actions (5 Cols) */}
                    <div className="lg:col-span-5 w-full space-y-6">
                        <div>
                            {product.category && (
                                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">
                                    {product.category.name}
                                </span>
                            )}
                             <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug tracking-tight mb-2">
                                 {product.name}
                             </h1>

                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                {product.average_rating > 0 ? (
                                    <RatingStars rating={product.average_rating} count={product.total_reviews} />
                                ) : (
                                    <span className="text-xs text-gray-400 font-medium">Aucun avis pour le moment</span>
                                )}
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500 font-medium">
                                    <strong className="text-gray-900">{product.confirmed_sales ?? 0}</strong> Vendus
                                </span>
                            </div>
                        </div>

                        {/* Price Card */}
                        <div className="p-4 sm:p-5 bg-gradient-to-br from-primary-50/60 via-white to-gray-50 border border-primary-100/80 rounded-2xl shadow-xs flex items-baseline gap-3">
                            <span className="text-3xl sm:text-4xl font-black text-primary-600 tracking-tight">
                                {formatAmount(product.sale_price || product.price, product.currency || 'CDF')}
                            </span>
                            {product.sale_price && (
                                <span className="text-base text-gray-400 line-through font-medium">
                                    {formatAmount(product.price, product.currency || 'CDF')}
                                </span>
                            )}
                        </div>

                        {/* Quantity & Stock */}
                        <div className="p-5 bg-white border border-gray-200/80 rounded-2xl shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-800">{t('product.quantity')}</span>
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold text-lg"
                                    >−</button>
                                    <span className="w-12 text-center font-extrabold text-gray-900 text-sm">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold text-lg"
                                    >+</button>
                                </div>
                            </div>

                            <p className="text-xs font-semibold">
                                {availableStock > 0 ? (
                                    <span className="text-emerald-600 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        {availableStock} articles disponibles
                                    </span>
                                ) : (
                                    <span className="text-red-600">Rupture de stock</span>
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
                                onOrderNow={() => {
                                    if (!auth?.user) {
                                        router.get(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                                        return;
                                    }
                                    if (auth.user.role !== 'buyer') {
                                        dispatchToast('Seuls les acheteurs peuvent passer des commandes.', 'info');
                                        return;
                                    }
                                    setShowOrderModal(true);
                                }}
                            />
                        </div>

                        {/* Product Description */}
                        {product.description && (
                            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Description du produit</h3>
                                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {product.description}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Seller Profile & Guarantees (3 Cols) */}
                    <div className="lg:col-span-3 w-full">
                        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sticky top-24 shadow-sm space-y-5">
                            {/* Seller Header */}
                            <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
                                    <Link
                                        href={`/sellers/${seller?.slug}`}
                                        className="w-14 h-14 bg-gray-100 rounded-full border border-gray-200 overflow-hidden shrink-0 shadow-xs flex items-center justify-center"
                                    >
                                    {seller?.logo || seller?.user?.avatar ? (
                                        <img src={`/storage/${seller.logo || seller.user?.avatar}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-primary-600 text-white font-extrabold text-xl flex items-center justify-center uppercase">
                                            {seller?.business_name?.charAt(0) || 'V'}
                                        </div>
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <h3 className="font-bold text-gray-900 text-base truncate">
                                            <Link href={`/sellers/${seller?.slug}`} className="hover:text-primary-600 transition-colors">
                                                {seller?.business_name || 'Vendeur'}
                                            </Link>
                                        </h3>
                                        {auth?.user?.role === 'buyer' && (
                                            <button
                                                type="button"
                                                onClick={() => setReportModalOpen(true)}
                                                title="Signaler ce vendeur"
                                                className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <Flag size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                        <MapPin size={12} className="shrink-0 text-gray-400" />
                                        <span className="truncate">{seller?.city || 'Localisation non spécifiée'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Seller Stats */}
                            <div className="grid grid-cols-2 gap-2 text-center py-2 bg-gray-50 rounded-xl">
                                <div>
                                    <span className="block text-[11px] font-medium text-gray-400">Note</span>
                                    <span className="font-extrabold text-gray-900 text-sm">
                                        {seller?.average_rating > 0 ? parseFloat(seller.average_rating).toFixed(1) : '5.0'}
                                    </span>
                                </div>
                                <div className="border-l border-gray-200">
                                    <span className="block text-[11px] font-medium text-gray-400">Inscrit</span>
                                    <span className="font-extrabold text-gray-900 text-sm">
                                        {seller?.created_at ? new Date(seller.created_at).getFullYear() : '2026'}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Action Buttons */}
                            <div className="space-y-2">
                                <a
                                    href={`https://wa.me/${sellerPhone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl font-bold text-xs transition-colors shadow-xs"
                                >
                                    <MessageCircle size={16} />
                                    WhatsApp
                                </a>
                                <a
                                    href={`tel:${sellerPhone}`}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors"
                                >
                                    <Phone size={15} />
                                    Voir le numéro
                                </a>
                                <button
                                    type="button"
                                    onClick={startChat}
                                    disabled={startingChat}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-bold text-xs transition-colors shadow-xs"
                                >
                                    <MessageCircle size={15} />
                                    {startingChat ? 'Ouverture...' : 'Discuter avec le vendeur'}
                                </button>
                                {seller?.slug && (
                                    <Link
                                        href={`/sellers/${seller.slug}`}
                                        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-xs transition-colors"
                                    >
                                        Voir la boutique
                                        <ArrowRight size={14} />
                                    </Link>
                                )}
                            </div>

                            {/* Trust Badges */}
                            <div className="pt-3 border-t border-gray-100 space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Paiements sécurisés</h4>
                                        <p className="text-[11px] text-gray-500 leading-tight">Paiements 100 % sécurisés par mobile money ou carte.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                                        <Truck size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Livraison locale</h4>
                                        <p className="text-[11px] text-gray-500 leading-tight">Livraison organisée directement avec le vendeur.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {reviews?.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-gray-200">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Avis sur ce produit</h2>
                            <div className="text-right">
                                <span className="font-bold text-xl text-gray-900">{product.average_rating > 0 ? parseFloat(product.average_rating).toFixed(1) : '-'} / 5</span>
                                <span className="block text-sm text-gray-500">Basé sur {product.total_reviews || reviews.length} avis</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                {review.buyer?.user?.name?.charAt(0) || 'A'}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-sm">{review.buyer?.user?.name || 'Acheteur anonyme'}</h4>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(review.created_at).toLocaleDateString('fr-FR', {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        {review.conversation_id && (
                                            <span className="flex items-center gap-1 text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                <CheckCircle size={10} />
                                                Achat Vérifié
                                            </span>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <RatingStars rating={review.rating} size={14} />
                                    </div>
                                    {review.title && <h5 className="font-semibold text-gray-800 text-sm mb-1">{review.title}</h5>}
                                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment || <span className="italic text-gray-400">Aucun commentaire</span>}</p>

                                    {review.seller_reply && (
                                        <div className="mt-3 ml-4 border-l-2 border-primary-200 pl-4 bg-primary-50/40 rounded-r-lg py-2">
                                            <p className="text-xs font-semibold text-primary-700 mb-1">💬 Réponse du vendeur</p>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.seller_reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                            onConversationDeleted={() => setShowChatModal(false)}
                            onClose={() => setShowChatModal(false)}
                            isModal
                        />
                    </div>
                </div>
            )}

            <ReportSellerModal
                sellerId={seller.id}
                sellerName={seller.business_name}
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
            />

            {showOrderModal && (
                <OrderModal
                    product={product}
                    quantity={quantity}
                    availableStock={availableStock}
                    auth={auth}
                    onClose={() => setShowOrderModal(false)}
                />
            )}
        </AppLayout>
    );
}
