import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import Pagination from '@/Components/UI/Pagination';
import { Package } from 'lucide-react';

const statusColors = {
    pending:   'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped:   'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersIndex({ orders }) {
    return (
        <>
            <Head title="My Orders" />
            <BuyerLayout title="My Orders">
                {orders.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {orders.data.map(order => (
                                    <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-bold text-gray-900">{order.order_number}</span>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Ordered {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {order.seller && ` · Seller: ${order.seller.business_name}`}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {order.items?.length || 0} item(s)
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="text-lg font-bold text-gray-900">
                                                    TZS {parseFloat(order.total_amount).toLocaleString()}
                                                </span>
                                                <Link
                                                    href={`/buyer/orders/${order.id}`}
                                                    className="px-4 py-2 text-sm font-medium bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Product thumbnails */}
                                        {order.items && order.items.length > 0 && (
                                            <div className="mt-4 flex gap-2">
                                                {order.items.slice(0, 4).map(item => {
                                                    const imgPath = item.product?.images?.[0]?.image_path;
                                                    return (
                                                        <div key={item.id} className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                            {imgPath ? (
                                                                <img src={`/storage/${imgPath}`} alt={item.product?.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package size={18} className="text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {order.items.length > 4 && (
                                                    <div className="w-14 h-14 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                        +{order.items.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Pagination links={orders.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <Package size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6">Your orders will appear here once you start shopping.</p>
                        <Link href="/products" className="inline-block bg-primary-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary-700">
                            Start Shopping
                        </Link>
                    </div>
                )}
            </BuyerLayout>
        </>
    );
}
