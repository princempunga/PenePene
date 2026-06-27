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

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Oversight</h1>
                    <p className="text-gray-500 mt-1">Monitor all platform transactions globally.</p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                    {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'all'].map(status => (
                        <Link
                            key={status}
                            href={`/admin/orders?status=${status}`}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${
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

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
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
