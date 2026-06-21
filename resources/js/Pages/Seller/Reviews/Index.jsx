import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import RatingStars from '@/Components/UI/RatingStars';
import Pagination from '@/Components/UI/Pagination';
import { MessageSquare, Star, Package, CheckCircle, ThumbsUp, Send, Image as ImageIcon } from 'lucide-react';

function starLabel(rating) {
    return rating === 1 ? '1 étoile' : `${rating} étoiles`;
}

function ReviewCard({ review }) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const { data, setData, post, processing } = useForm({ seller_reply: review.seller_reply || '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/seller/reviews/${review.id}/reply`, {
            onSuccess: () => setShowReplyForm(false),
        });
    };

    const isVerified = !!review.conversation_id;

    return (
        <div className="p-6 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-sm shadow-sm">
                    {review.buyer?.user?.name?.charAt(0) || 'A'}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900 text-sm">
                                    {review.buyer?.user?.name || 'Acheteur anonyme'}
                                </h3>
                                {isVerified && (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        <CheckCircle size={10} />
                                        Interaction Vérifiée
                                    </span>
                                )}
                            </div>
                            <RatingStars rating={review.rating} size={13} />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                            {new Date(review.created_at).toLocaleDateString('fr-FR', {
                                year: 'numeric', month: 'short', day: 'numeric',
                            })}
                        </span>
                    </div>

                    {review.product?.name && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                            <Package size={12} className="shrink-0" />
                            <span className="truncate">{review.product.name}</span>
                        </div>
                    )}

                    {review.title && (
                        <p className="mt-2 font-semibold text-gray-800 text-sm">{review.title}</p>
                    )}

                    <p className="mt-1.5 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {review.comment || <span className="italic text-gray-400">Aucun commentaire</span>}
                    </p>

                    {review.media?.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                            {review.media.map((path, i) => {
                                const ext = path.split('.').pop()?.toLowerCase();
                                const isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
                                return isImg ? (
                                    <a key={i} href={`/storage/${path}`} target="_blank" rel="noreferrer">
                                        <img src={`/storage/${path}`} alt="Review media"
                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-primary-400 transition-colors" />
                                    </a>
                                ) : (
                                    <a key={i} href={`/storage/${path}`} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                        <ImageIcon size={12} /> Fichier
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {review.helpful_votes > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                            <ThumbsUp size={11} className="text-green-500" />
                            {review.helpful_votes} personne{review.helpful_votes > 1 ? 's ont' : ' a'} trouvé cet avis utile
                        </div>
                    )}

                    {review.seller_reply && !showReplyForm && (
                        <div className="mt-3 ml-4 border-l-2 border-primary-200 pl-4 bg-primary-50/40 rounded-r-lg py-2">
                            <p className="text-xs font-semibold text-primary-700 mb-1">💬 Votre réponse</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.seller_reply}</p>
                            <button onClick={() => setShowReplyForm(true)} className="mt-1 text-xs text-primary-500 hover:text-primary-700">
                                Modifier la réponse
                            </button>
                        </div>
                    )}

                    {!review.seller_reply && !showReplyForm && (
                        <button
                            onClick={() => setShowReplyForm(true)}
                            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                        >
                            <MessageSquare size={13} /> Répondre à cet avis
                        </button>
                    )}

                    {showReplyForm && (
                        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
                            <textarea
                                rows={3}
                                value={data.seller_reply}
                                onChange={e => setData('seller_reply', e.target.value)}
                                placeholder="Votre réponse publique à cet avis..."
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                required
                            />
                            <div className="flex gap-2">
                                <button type="submit" disabled={processing}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                                    <Send size={12} /> Publier
                                </button>
                                <button type="button" onClick={() => setShowReplyForm(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                                    Annuler
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ReviewsIndex({ reviews, summary, filters }) {
    const handleFilter = (rating) => {
        router.get('/seller/reviews', { rating: rating || undefined }, { preserveState: true });
    };
    const activeRating = filters.rating ? parseInt(filters.rating, 10) : null;

    return (
        <>
            <Head title="Avis clients" />
            <SellerLayout>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Avis clients</h1>
                    <p className="text-gray-500 mt-1">Répondez publiquement aux avis pour renforcer la confiance.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                            <Star size={28} fill="currentColor" strokeWidth={0} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Note moyenne</p>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-3xl font-bold text-gray-900">{summary.average_rating || '—'}</p>
                                {summary.average_rating > 0 && <RatingStars rating={summary.average_rating} size={18} />}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{summary.total_reviews} avis au total</p>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-700 mb-4">Répartition des notes</p>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = summary.breakdown[rating] || 0;
                                const pct = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0;
                                return (
                                    <button key={rating} type="button"
                                        onClick={() => handleFilter(activeRating === rating ? '' : rating)}
                                        className={`w-full flex items-center gap-3 rounded-lg px-2 py-1 -mx-2 transition-colors ${activeRating === rating ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                                        <span className="text-sm font-medium text-gray-600 w-16 text-left">{starLabel(rating)}</span>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm overflow-x-auto mb-6">
                    <button type="button" onClick={() => handleFilter('')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${!activeRating ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        Toutes les notes
                    </button>
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <button key={rating} type="button" onClick={() => handleFilter(rating)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${activeRating === rating ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                            {rating} <Star size={12} className="fill-amber-400 text-amber-400" />
                        </button>
                    ))}
                </div>

                {reviews.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {reviews.data.map((review) => <ReviewCard key={review.id} review={review} />)}
                            </div>
                        </div>
                        <Pagination links={reviews.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <MessageSquare size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun avis pour le moment</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {activeRating
                                ? `Vous n'avez aucun avis de ${starLabel(activeRating)}.`
                                : 'Les avis apparaissent ici après que les acheteurs ont confirmé une transaction.'}
                        </p>
                    </div>
                )}
            </SellerLayout>
        </>
    );
}
