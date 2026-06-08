import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Megaphone, Plus, Trash2 } from 'lucide-react';

export default function SponsoredIndex({ sponsored }) {
    const { flash } = usePage().props;

    const statusColors = {
        pending: 'bg-amber-100 text-amber-800',
        active: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        completed: 'bg-gray-100 text-gray-800',
    };

    return (
        <SellerLayout>
            <Head title="Sponsored Products" />

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Sponsored Campaigns</h1>
                <Link
                    href="/seller/sponsored/create"
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
                >
                    <Plus size={18} />
                    New Campaign
                </Link>
            </div>

            {flash?.success && (
                <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-lg text-sm border border-red-200">
                    {flash.error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Placement</th>
                            <th className="px-6 py-4">Duration</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sponsored.data.length > 0 ? sponsored.data.map(campaign => (
                            <tr key={campaign.id} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {campaign.product?.name || 'Deleted Product'}
                                </td>
                                <td className="px-6 py-4">
                                    {campaign.placement.replace('_', ' ').toUpperCase()}
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(campaign.starts_at).toLocaleDateString()} to {new Date(campaign.expires_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[campaign.status]}`}>
                                        {campaign.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {campaign.status !== 'active' && (
                                        <Link
                                            href={`/seller/sponsored/${campaign.id}`}
                                            method="delete"
                                            as="button"
                                            className="text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                                        >
                                            <Trash2 size={16} /> Cancel
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    <Megaphone size={40} className="mx-auto mb-3 opacity-20" />
                                    <p>You have no sponsored product campaigns.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </SellerLayout>
    );
}
