import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ShoppingCart, Eye } from 'lucide-react';

export default function OrdersIndex({ orders, filters }) {
    const statusColors = {
        pending: 'bg-amber-100 text-amber-800',
        confirmed: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <AdminLayout>
            <Head title="Order Oversight" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order Oversight</h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Monitor all platform transactions globally.</p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm overflow-x-auto self-start max-w-full">
                    {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'all'].map(status => (
                        <Link
                            key={status}
                            href={`/admin/orders?status=${status}`}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition whitespace-nowrap ${
                                (filters.status === status) || (!filters.status && status === 'all')
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {status}
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Mobile : cartes ── */}
            <div className="md:hidden space-y-3">
                {orders.data.length > 0 ? orders.data.map(order => (
                    <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate">{order.order_number}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase shrink-0 ${statusColors[order.status]}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">
                            <div className="flex justify-between gap-2">
                                <span className="text-gray-500">Buyer</span>
                                <span className="text-gray-900 font-medium truncate">{order.buyer?.user?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-gray-500">Seller</span>
                                <span className="text-gray-900 font-medium truncate">{order.seller?.business_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-gray-500">Amount</span>
                                <span className="text-gray-900 font-semibold">TZS {parseFloat(order.total_amount).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                            <Link
                                href={`/admin/orders/${order.id}`}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800"
                            >
                                <Eye size={16} /> View order
                            </Link>
                        </div>
                    </div>
                )) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 text-center text-gray-500">
                        <ShoppingCart size={40} className="mx-auto mb-3 opacity-20" />
                        <p>No orders found.</p>
                    </div>
                )}
            </div>

            {/* ── Tablette / PC : tableau ── */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Order Ref</th>
                            <th className="px-6 py-4">Buyer</th>
                            <th className="px-6 py-4">Seller</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.data.length > 0 ? orders.data.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {order.order_number}
                                    <div className="text-xs font-normal text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4">{order.buyer?.user?.name || 'N/A'}</td>
                                <td className="px-6 py-4">{order.seller?.business_name || 'N/A'}</td>
                                <td className="px-6 py-4 font-semibold text-gray-900">TZS {parseFloat(order.total_amount).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/admin/orders/${order.id}`} className="text-primary-600 hover:text-primary-800 p-2 inline-block">
                                        <Eye size={18} />
                                    </Link>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    <ShoppingCart size={40} className="mx-auto mb-3 opacity-20" />
                                    <p>No orders found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500">
                <div>Showing {orders.from || 0} to {orders.to || 0} of {orders.total} results</div>
                <div className="flex gap-1">
                    {orders.links.map((link, i) => (
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
