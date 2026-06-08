import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import RatingStars from '@/Components/UI/RatingStars';
import Pagination from '@/Components/UI/Pagination';
import { Star } from 'lucide-react';

export default function ReviewsIndex({ reviews }) {
    return (
        <>
            <Head title="My Reviews" />
            <BuyerLayout title="My Reviews">
                {reviews.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {reviews.data.map(review => (
                                    <div key={review.id} className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 shrink-0">
                                                {review.seller?.business_name?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <Link href={`/sellers/${review.seller?.slug}`} className="font-semibold text-gray-900 hover:text-primary-600">
                                                        {review.seller?.business_name}
                                                    </Link>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <RatingStars rating={review.rating} size={14} />
                                                {review.comment && (
                                                    <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Pagination links={reviews.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <Star size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-500">After receiving a delivered order, you can write a review.</p>
                    </div>
                )}
            </BuyerLayout>
        </>
    );
}
