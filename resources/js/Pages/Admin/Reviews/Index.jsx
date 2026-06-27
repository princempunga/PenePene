import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { MessageSquare, Trash2, Star } from 'lucide-react';

export default function ReviewsIndex({ reviews }) {
    const { flash } = usePage().props;
    const { delete: destroy } = useForm();

    const deleteReview = (id) => {
        if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            destroy(`/admin/reviews/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Review Moderation" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
                <p className="text-gray-500 mt-1">Monitor and moderate buyer reviews across the platform.</p>
            </div>

            {flash?.success && (
                <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                    {flash.success}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {reviews.data.length > 0 ? reviews.data.map(review => (
                        <div key={review.id} className="p-6 hover:bg-gray-50 transition flex gap-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                {review.buyer?.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{review.buyer?.user?.name || 'Unknown Buyer'}</h3>
                                        <div className="flex items-center gap-1 mt-1 text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'text-gray-300'} />
                                            ))}
                                            <span className="text-gray-500 text-xs ml-2">to {review.seller?.business_name}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteReview(review.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                                        title="Delete Review"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="mt-3 text-gray-700 text-sm whitespace-pre-wrap">
                                    {review.comment || <span className="italic text-gray-400">No comment provided</span>}
                                </div>
                                <div className="mt-3 text-xs text-gray-400">
                                    Posted on {new Date(review.created_at).toLocaleString()} · Order #{review.order?.order_number}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center text-gray-500">
                            <MessageSquare size={40} className="mx-auto mb-3 opacity-20" />
                            <p>No reviews found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <div>Showing {reviews.from || 0} to {reviews.to || 0} of {reviews.total} results</div>
                <div className="flex gap-1">
                    {reviews.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`px-3 py-1 rounded border ${link.active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
