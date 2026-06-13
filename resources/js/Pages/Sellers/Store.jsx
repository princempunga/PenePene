import React, { useState, useEffect, useRef, useCallback } from 'react';
import useTranslation from '@/hooks/useTranslation';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/Product/ProductCard';
import Pagination from '@/Components/UI/Pagination';
import RatingStars from '@/Components/UI/RatingStars';
import { MapPin, Phone, ShieldCheck, Calendar, MessageSquareText, Package, Star } from 'lucide-react';
import ChatWindow from '@/Components/Chat/ChatWindow';
import OnlineStatusBadge from '@/Components/Chat/OnlineStatusBadge';

export default function Store({ seller, products, reviews }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [showChatModal, setShowChatModal] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [startingChat, setStartingChat] = useState(false);
    const autoChatStarted = useRef(false);

    const startChat = useCallback(async () => {
        if (!auth?.user) {
            const returnUrl = `${window.location.pathname}?openChat=1`;
            router.get(`/login?redirect=${encodeURIComponent(returnUrl)}`);
            return;
        }

        if (auth.user.role !== 'buyer') {
            alert('Only buyer accounts can message sellers.');
            return;
        }

        setStartingChat(true);
        try {
            const res = await axios.post(
                '/chat/conversations/start',
                { seller_id: seller.id },
                { headers: { Accept: 'application/json' } },
            );

            const id = res.data?.conversation_id;
            if (!id) {
                throw new Error('No conversation id returned');
            }

            setConversationId(id);
            setShowChatModal(true);

            const url = new URL(window.location.href);
            if (url.searchParams.has('openChat')) {
                url.searchParams.delete('openChat');
                window.history.replaceState({}, '', url.pathname + url.search);
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 419) {
                const returnUrl = `${window.location.pathname}?openChat=1`;
                router.get(`/login?redirect=${encodeURIComponent(returnUrl)}`);
                return;
            }

            console.error('Failed to start chat', error);
            alert(error.response?.data?.message || 'Unable to start chat. Please try again.');
        } finally {
            setStartingChat(false);
        }
    }, [auth?.user, seller.id]);

    useEffect(() => {
        if (autoChatStarted.current) return;

        const params = new URLSearchParams(window.location.search);
        if (params.get('openChat') === '1' && auth?.user?.role === 'buyer') {
            autoChatStarted.current = true;
            startChat();
        }
    }, [auth?.user?.id, auth?.user?.role, startChat]);

    return (
        <AppLayout>
            {/* Store Header/Banner */}
            <div className="relative bg-white border-b">
                <div className="h-48 md:h-64 bg-gray-900 relative">
                    {seller.banner ? (
                        <img src={`/storage/${seller.banner}`} alt={`${seller.business_name} banner`} className="w-full h-full object-cover opacity-80" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700 opacity-90"></div>
                    )}
                </div>

                <div className="max-w-7xl mx-auto px-4 relative pb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden shrink-0 flex items-center justify-center relative z-10">
                            {seller.logo ? (
                                <img src={`/storage/${seller.logo}`} alt={seller.business_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-5xl font-bold text-primary-300">{seller.business_name.charAt(0)}</span>
                            )}
                        </div>

                        <div className="flex-1 pb-2">
                            <div className="flex flex-col gap-2 mb-3">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-gray-900">{seller.business_name}</h1>
                                    {seller.status === 'verified' && (
                                        <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold border border-blue-100">
                                            <ShieldCheck size={14} />
                                            Verified
                                        </div>
                                    )}
                                </div>
                                <OnlineStatusBadge isOnline={seller.user.is_online} lastSeenText={seller.user.last_seen_text} />
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span>{seller.city}, {seller.country}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>Joined {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <Package size={16} className="text-gray-400" />
                                    <span>{products.total} Products</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <Star size={16} className="text-gray-400" />
                                    <span>{seller.total_reviews} Reviews</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto pb-2 shrink-0">
                            <button
                                type="button"
                                onClick={startChat}
                                disabled={startingChat}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <MessageSquareText size={18} />
                                {startingChat ? 'Connecting...' : 'Chat with Seller'}
                            </button>
                            <a href={`tel:${seller.phone}`} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-6 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg font-medium transition-colors shadow-sm">
                                <Phone size={18} />
                                Call Seller
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 prose max-w-3xl text-gray-600">
                        <p>{seller.description}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Main Content: Products */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Store Products</h2>
                            <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                                {products.total} items
                            </span>
                        </div>

                        {products.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                    {products.data.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                                <Pagination links={products.links} />
                            </>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('products_page.no_products')}</h3>
                                <p className="text-gray-500">This seller currently has no active products listed.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Reviews */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                                Recent Reviews
                                <span className="text-sm font-normal text-gray-500">{seller.total_reviews} total</span>
                            </h3>

                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map(review => {
                                        const buyerName = review.buyer?.user?.name || review.buyer?.name || 'Customer';
                                        const initials = review.buyer?.initials || buyerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                                        return (
                                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                            <div className="flex items-start gap-3 mb-2">
                                                <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-gray-900">{buyerName}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(review.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="mb-1">
                                                        <RatingStars rating={review.rating} size={14} />
                                                    </div>
                                                    {review.comment && (
                                                        <p className="text-sm text-gray-600 line-clamp-3">{review.comment}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-4">No reviews yet.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Chat Modal */}
            {showChatModal && conversationId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-200">
                        <ChatWindow
                            conversationId={conversationId}
                            currentUserId={auth.user?.id}
                            otherUser={seller.user}
                            onClose={() => setShowChatModal(false)}
                            isModal={true}
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
