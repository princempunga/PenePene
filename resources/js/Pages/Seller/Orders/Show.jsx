import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { User, MapPin, Package, Check, X, Truck } from 'lucide-react';

const statusColors = {
    pending:   'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped:   'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function OrderShow({ order }) {
    const { flash } = usePage().props;
    const { patch, processing } = useForm({ status: order.status });

    const updateStatus = (newStatus) => {
        if (confirm(`Change order status to ${newStatus}?`)) {
            patch(`/seller/orders/${order.id}/status`, {
                data: { status: newStatus },
                preserveScroll: true
            });
        }
    };

    return (
        <>
            <Head title={`Manage Order ${order.order_number}`} />
            <SellerLayout title="Order Details">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/seller/orders" className="text-sm text-gray-500 hover:text-primary-600">← Back to Orders</Link>
                        <span className="text-gray-300">/</span>
                        <h1 className="text-xl font-bold text-gray-900">{order.order_number}</h1>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900">Items Ordered</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {order.items?.map(item => {
                                    const imgPath = item.product?.images?.[0]?.image_path;
                                    return (
                                        <div key={item.id} className="p-5 flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                                {imgPath ? (
                                                    <img src={`/storage/${imgPath}`} alt={item.product?.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package size={20} className="text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/products/${item.product?.slug}`} target="_blank" className="font-semibold text-gray-900 hover:text-primary-600 truncate block">
                                                    {item.product?.name}
                                                </Link>
                                                <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-bold text-gray-900">TZS {parseFloat(item.total_price).toLocaleString()}</p>
                                                <p className="text-xs text-gray-500">@ TZS {parseFloat(item.unit_price).toLocaleString()} each</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <div className="w-64 space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>TZS {parseFloat(order.subtotal).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>{order.shipping_cost > 0 ? `TZS ${parseFloat(order.shipping_cost).toLocaleString()}` : 'Free'}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
                                        <span>Total</span>
                                        <span>TZS {parseFloat(order.total_amount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Fulfillment Actions */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Update Status</h2>
                            
                            <div className="grid grid-cols-1 gap-2">
                                {order.status === 'pending' && (
                                    <>
                                        <button onClick={() => updateStatus('confirmed')} disabled={processing} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                            <Check size={16} /> Confirm Order
                                        </button>
                                        <button onClick={() => updateStatus('cancelled')} disabled={processing} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50">
                                            <X size={16} /> Cancel Order
                                        </button>
                                    </>
                                )}

                                {order.status === 'confirmed' && (
                                    <button onClick={() => updateStatus('shipped')} disabled={processing} className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
                                        <Truck size={16} /> Mark as Shipped
                                    </button>
                                )}

                                {order.status === 'shipped' && (
                                    <button onClick={() => updateStatus('delivered')} disabled={processing} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                                        <Check size={16} /> Mark as Delivered
                                    </button>
                                )}

                                {['delivered', 'cancelled'].includes(order.status) && (
                                    <div className="text-center p-3 bg-gray-50 rounded-lg text-sm text-gray-500 font-medium">
                                        Order fulfillment is complete.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                                <User size={18} className="text-primary-500" /> Customer Details
                            </h2>
                            <div>
                                <p className="font-semibold text-gray-900">{order.buyer?.user?.name}</p>
                                <p className="text-sm text-gray-500 mt-1">{order.buyer?.user?.email}</p>
                                <p className="text-sm text-gray-500">{order.buyer?.user?.phone}</p>
                            </div>
                            
                            <div className="pt-3 border-t border-gray-100">
                                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-2">
                                    <MapPin size={16} className="text-gray-400" /> Shipping Address
                                </h3>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {order.shipping_address}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SellerLayout>
        </>
    );
}
