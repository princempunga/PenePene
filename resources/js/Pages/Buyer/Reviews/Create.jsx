import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { Star } from 'lucide-react';

function StarPicker({ value, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none"
                >
                    <Star
                        size={28}
                        className={`transition-colors ${star <= (hover || value) ? 'text-amber-400' : 'text-gray-200'}`}
                        fill={star <= (hover || value) ? 'currentColor' : 'none'}
                    />
                </button>
            ))}
        </div>
    );
}

export default function ReviewCreate({ order }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        seller_rating: 0,
        seller_comment: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/buyer/orders/${order.id}/review`);
    };

    return (
        <>
            <Head title="Write a Review" />
            <BuyerLayout title="Write a Review">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-2xl">
                    <div className="flex items-center gap-3 pb-5 mb-6 border-b border-gray-100">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600">
                            {order.seller?.business_name?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{order.seller?.business_name}</p>
                            <p className="text-sm text-gray-500">Order: {order.order_number}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Overall Seller Rating <span className="text-red-500">*</span>
                            </label>
                            <StarPicker value={data.seller_rating} onChange={v => setData('seller_rating', v)} />
                            {errors.seller_rating && (
                                <p className="mt-1 text-sm text-red-600">{errors.seller_rating}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Your Comment <span className="text-gray-400">(optional)</span>
                            </label>
                            <textarea
                                value={data.seller_comment}
                                onChange={e => setData('seller_comment', e.target.value)}
                                rows={4}
                                placeholder="Share your experience with this seller..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing || data.seller_rating === 0}
                            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                        >
                            {processing ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            </BuyerLayout>
        </>
    );
}
