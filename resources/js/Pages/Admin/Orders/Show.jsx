import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Store, MapPin, Phone } from 'lucide-react';

export default function OrdersShow({ order }) {
    const statusColors = {
        pending: 'bg-amber-100 text-amber-800',
        confirmed: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <AdminLayout>
            <Head title={`Admin Oversight: Order #${order.order_number}`} />

            <div className="mb-6">
                <Link href="/admin/orders" className="text-primary-600 hover:underline flex items-center gap-1 text-sm font-medium mb-3">
                    <ArrowLeft size={16} /> Back to Orders List
                </Link>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColors[order.status]}`}>
                        {order.status}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-900">Order Items</h2>
                        </div>
                        <div className="divide-y divide-gray-100 p-5">
                            {order.items.map(item => (
                                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        {item.product?.images?.[0] && (
                                            <img src={`/storage/${item.product.images[0].path}`} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900">{item.product_name}</p>
                                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">TZS {parseFloat(item.price * item.quantity).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 mt-1">TZS {parseFloat(item.price).toLocaleString()} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Buyer Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Store size={18} className="text-gray-400"/> Buyer Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <p><strong>Name:</strong> {order.buyer?.user?.name}</p>
                            <p><strong>Email:</strong> {order.buyer?.user?.email}</p>
                        </div>
                    </div>

                    {/* Seller Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Store size={18} className="text-gray-400"/> Seller Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <p><strong>Business:</strong> {order.seller?.business_name}</p>
                            <p><strong>Status:</strong> {order.seller?.status}</p>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 mb-4">Financial Overview</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>TZS {parseFloat(order.subtotal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping Fee</span>
                                <span>TZS {parseFloat(order.shipping_cost).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-bold text-gray-900 text-lg">
                                <span>Total Amount</span>
                                <span>TZS {parseFloat(order.total_amount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
