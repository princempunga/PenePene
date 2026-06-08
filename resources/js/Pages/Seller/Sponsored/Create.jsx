import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';

export default function SponsoredCreate({ products }) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        placement: 'homepage_banner',
        starts_at: '',
        expires_at: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/seller/sponsored');
    };

    return (
        <SellerLayout>
            <Head title="New Sponsored Campaign" />

            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Sponsored Campaign</h1>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                            <select
                                value={data.product_id}
                                onChange={e => setData('product_id', e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="">-- Choose a product --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.product_id && <p className="text-red-600 text-sm mt-1">{errors.product_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                            <select
                                value={data.placement}
                                onChange={e => setData('placement', e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="homepage_banner">Homepage Banner</option>
                                <option value="product_of_day">Product of the Day</option>
                                <option value="product_of_week">Product of the Week</option>
                                <option value="featured_listing">Featured Listing (Search Top)</option>
                                <option value="category_top">Category Top</option>
                            </select>
                            {errors.placement && <p className="text-red-600 text-sm mt-1">{errors.placement}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={data.starts_at}
                                    onChange={e => setData('starts_at', e.target.value)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                {errors.starts_at && <p className="text-red-600 text-sm mt-1">{errors.starts_at}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={data.expires_at}
                                    onChange={e => setData('expires_at', e.target.value)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                {errors.expires_at && <p className="text-red-600 text-sm mt-1">{errors.expires_at}</p>}
                            </div>
                        </div>

                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-4">
                            <strong>Note:</strong> Campaign requests are manually reviewed by the platform admins. Payment instructions will be provided upon approval.
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
}
