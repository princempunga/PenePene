import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/UI/Pagination';
import { Store, ShieldCheck, XCircle, Clock } from 'lucide-react';

const statusConfig = {
    pending:   { label: 'Pending Review', color: 'bg-amber-100 text-amber-800', icon: Clock },
    active:    { label: 'Active',         color: 'bg-green-100 text-green-800', icon: ShieldCheck },
    rejected:  { label: 'Rejected',       color: 'bg-red-100 text-red-800',     icon: XCircle },
    suspended: { label: 'Suspended',      color: 'bg-gray-100 text-gray-800',   icon: XCircle },
};

export default function SellersIndex({ sellers, filters }) {
    const handleFilter = (status) => {
        router.get('/admin/sellers', { status }, { preserveState: true });
    };

    return (
        <>
            <Head title="Seller Management" />
            <AdminLayout title="Seller Management">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm overflow-x-auto w-full sm:w-auto">
                        {['all', 'pending', 'active', 'rejected', 'suspended'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleFilter(status === 'all' ? '' : status)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                                    (filters.status === status) || (!filters.status && status === 'all')
                                        ? 'bg-slate-800 text-white'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {sellers.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Store Details</th>
                                        <th className="px-6 py-4">Owner Contact</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sellers.data.map((seller) => {
                                        const config = statusConfig[seller.status] || statusConfig.suspended;
                                        const StatusIcon = config.icon;
                                        return (
                                            <tr key={seller.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900">{seller.business_name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">Applied: {new Date(seller.created_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-900">{seller.user?.name}</p>
                                                    <p className="text-xs text-gray-500">{seller.user?.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {seller.city}, {seller.country}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}>
                                                        <StatusIcon size={14} />
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/admin/sellers/${seller.id}`}
                                                        className="inline-flex items-center justify-center px-3 py-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
                                                    >
                                                        Review
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={sellers.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <Store size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No sellers found</h3>
                        <p className="text-gray-500">There are no sellers matching this status.</p>
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
