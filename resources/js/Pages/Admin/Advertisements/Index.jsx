import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Megaphone, Check, X } from 'lucide-react';

export default function AdvertisementsIndex({ advertisements, filters }) {
    const { flash } = usePage().props;
    const { patch } = useForm();

    const updateStatus = (id, action) => {
        if (confirm(`Are you sure you want to ${action} this campaign?`)) {
            patch(`/admin/advertisements/${id}/${action}`);
        }
    };

    const statusColors = {
        pending: 'bg-amber-100 text-amber-800',
        active: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        completed: 'bg-gray-100 text-gray-800',
    };

    return (
        <AdminLayout>
            <Head title="Sponsored Campaigns Moderation" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sponsored Campaigns</h1>
                    <p className="text-gray-500 mt-1">Review and approve seller advertisement requests.</p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                    {['pending', 'active', 'rejected', 'completed', 'all'].map(status => (
                        <Link
                            key={status}
                            href={`/admin/advertisements?status=${status}`}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition ${
                                filters.status === status || (!filters.status && status === 'all')
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {status}
                        </Link>
                    ))}
                </div>
            </div>

            {flash?.success && (
                <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                    {flash.success}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Seller</th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Placement & Duration</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {advertisements.data.length > 0 ? advertisements.data.map(ad => (
                            <tr key={ad.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-gray-900">{ad.seller?.business_name}</p>
                                    <p className="text-xs text-gray-500">{ad.seller?.user?.email}</p>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {ad.product?.name || 'Unknown Product'}
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-gray-900">{ad.placement.replace('_', ' ').toUpperCase()}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {new Date(ad.starts_at).toLocaleDateString()} – {new Date(ad.expires_at).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[ad.status]}`}>
                                        {ad.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {ad.status === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => updateStatus(ad.id, 'approve')}
                                                className="bg-green-100 text-green-700 hover:bg-green-200 p-1.5 rounded transition"
                                                title="Approve"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(ad.id, 'reject')}
                                                className="bg-red-100 text-red-700 hover:bg-red-200 p-1.5 rounded transition"
                                                title="Reject"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    <Megaphone size={40} className="mx-auto mb-3 opacity-20" />
                                    <p>No campaigns found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Placeholder */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <div>Showing {advertisements.from || 0} to {advertisements.to || 0} of {advertisements.total} results</div>
                <div className="flex gap-1">
                    {advertisements.links.map((link, i) => (
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
