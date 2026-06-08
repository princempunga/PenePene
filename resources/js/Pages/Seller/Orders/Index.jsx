import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import Pagination from '@/Components/UI/Pagination';
import { Package, Search } from 'lucide-react';

const statusColors = {
    pending:   'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped:   'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersIndex({ orders, filters }) {
    const handleFilter = (status) => {
        router.get('/seller/orders', { status }, { preserveState: true });
    };

    return (
        <>
            <Head title="Store Orders" />
            <SellerLayout title="Orders">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm overflow-x-auto w-full sm:w-auto">
                        {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleFilter(status === 'all' ? '' : status)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                                    (filters.status === status) || (!filters.status && status === 'all')
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {orders.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {order.order_number}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900">{order.buyer?.user?.name}</span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                TZS {parseFloat(order.total_amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/seller/orders/${order.id}`}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 rounded bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium transition-colors"
                                                >
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={orders.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <Package size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500">
                            {filters.status ? `You don't have any ${filters.status} orders right now.` : "You haven't received any orders yet."}
                        </p>
                    </div>
                )}
            </SellerLayout>
        </>
    );
}
