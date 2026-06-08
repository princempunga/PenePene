import React from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import RatingStars from '@/Components/UI/RatingStars';
import Pagination from '@/Components/UI/Pagination';
import { MessageSquare, Star, Package } from 'lucide-react';

function getProductNames(review) {
    const products = review.order?.items?.map((item) => item.product?.name).filter(Boolean) || [];
    return products.length > 0 ? products.join(', ') : null;
}

export default function ReviewsIndex({ reviews, summary, filters }) {
    const handleFilter = (rating) => {
        router.get('/seller/reviews', { rating: rating || undefined }, { preserveState: true });
    };

    const activeRating = filters.rating ? parseInt(filters.rating, 10) : null;

    return (
        <>
            <Head title="Customer Reviews" />
            <SellerLayout>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
                    <p className="text-gray-500 mt-1">See what buyers are saying about your store and products.</p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                            <Star size={28} fill="currentColor" strokeWidth={0} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Average Rating</p>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-3xl font-bold text-gray-900">{summary.average_rating}</p>
                                <RatingStars rating={summary.average_rating} size={18} />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{summary.total_reviews} total review{summary.total_reviews !== 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-700 mb-4">Rating Breakdown</p>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = summary.breakdown[rating] || 0;
                                const pct = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0;
                                return (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => handleFilter(activeRating === rating ? '' : rating)}
                                        className={`w-full flex items-center gap-3 group rounded-lg px-2 py-1 -mx-2 transition-colors ${
                                            activeRating === rating ? 'bg-amber-50' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-sm font-medium text-gray-600 w-12 text-left">{rating} star</span>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Filter pills */}
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm overflow-x-auto w-full sm:w-auto mb-6">
                    <button
                        type="button"
                        onClick={() => handleFilter('')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                            !activeRating ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        All ratings
                    </button>
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            type="button"
                            onClick={() => handleFilter(rating)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                                activeRating === rating ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {rating} <Star size={12} className="fill-amber-400 text-amber-400" />
                        </button>
                    ))}
                </div>

                {reviews.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {reviews.data.map((review) => {
                                    const productNames = getProductNames(review);
                                    return (
                                        <div key={review.id} className="p-6 hover:bg-gray-50 transition">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 font-bold">
                                                    {review.buyer?.user?.name?.charAt(0) || 'B'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {review.buyer?.user?.name || 'Anonymous Buyer'}
                                                            </h3>
                                                            <RatingStars rating={review.rating} size={14} />
                                                        </div>
                                                        <span className="text-xs text-gray-400 shrink-0">
                                                            {new Date(review.created_at).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>

                                                    {productNames && (
                                                        <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                                                            <Package size={14} className="shrink-0" />
                                                            <span className="truncate">{productNames}</span>
                                                        </div>
                                                    )}

                                                    {review.title && (
                                                        <p className="mt-2 font-medium text-gray-800 text-sm">{review.title}</p>
                                                    )}

                                                    <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                                                        {review.comment || (
                                                            <span className="italic text-gray-400">No written comment</span>
                                                        )}
                                                    </p>

                                                    {review.order?.order_number && (
                                                        <p className="mt-2 text-xs text-gray-400">
                                                            Order #{review.order.order_number}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <Pagination links={reviews.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <MessageSquare size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {activeRating
                                ? `You don't have any ${activeRating}-star reviews. Try clearing the filter to see all feedback.`
                                : 'Reviews appear here after buyers rate their delivered orders. Great service leads to great ratings!'}
                        </p>
                    </div>
                )}
            </SellerLayout>
        </>
    );
}
