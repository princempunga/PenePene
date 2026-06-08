import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { MapPin, Store, Package, X, Star } from 'lucide-react';

const statusColors = {
    pending:   'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped:   'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrderShow({ order }) {
    const { flash } = usePage().props;
    const { patch, processing } = useForm({});

    const cancel = () => {
        if (confirm('Are you sure you want to cancel this order?')) {
            patch(`/buyer/orders/${order.id}/cancel`);
        }
    };

    const currentStep = statusSteps.indexOf(order.status);

    return (
        <>
            <Head title={`Order ${order.order_number}`} />
            <BuyerLayout>
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/buyer/orders" className="text-sm text-gray-500 hover:text-primary-600">← Back to Orders</Link>
                    <span className="text-gray-300">/</span>
                    <h1 className="text-xl font-bold text-gray-900">{order.order_number}</h1>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">{flash.success}</div>
                )}

                {/* Order Progress Bar */}
                {order.status !== 'cancelled' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                        <h2 className="font-bold text-gray-900 mb-5">Order Status</h2>
                        <div className="flex items-center">
                            {statusSteps.map((step, index) => (
                                <React.Fragment key={step}>
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                                            index <= currentStep
                                                ? 'bg-primary-600 border-primary-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-400'
                                        }`}>
                                            {index < currentStep ? '✓' : index + 1}
                                        </div>
                                        <p className={`text-xs mt-1.5 font-medium capitalize ${index <= currentStep ? 'text-primary-600' : 'text-gray-400'}`}>
                                            {step}
                                        </p>
                                    </div>
                                    {index < statusSteps.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-2 ${index < currentStep ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-4">
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
                                                <Link href={`/products/${item.product?.slug}`} className="font-semibold text-gray-900 hover:text-primary-600 truncate block">
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
                        </div>

                        {/* Shipping address */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin size={18} className="text-primary-500" />
                                Shipping Address
                            </h2>
                            <p className="text-gray-600">{order.shipping_address}</p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Order summary */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>TZS {parseFloat(order.subtotal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>{order.shipping_cost > 0 ? `TZS ${parseFloat(order.shipping_cost).toLocaleString()}` : 'Free'}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base">
                                    <span>Total</span>
                                    <span>TZS {parseFloat(order.total_amount).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t text-sm space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Payment Status</span>
                                    <span className="font-medium capitalize text-gray-900">{order.payment_status}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Order Date</span>
                                    <span className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Seller info */}
                        {order.seller && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Store size={18} className="text-primary-500" />
                                    Seller
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 shrink-0">
                                        {order.seller.business_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{order.seller.business_name}</p>
                                        <Link href={`/sellers/${order.seller.slug}`} className="text-xs text-primary-600 hover:text-primary-700">
                                            View Store
                                        </Link>
                                    </div>
                                </div>

                                <Link
                                    href={`/buyer/messages/seller/${order.seller_id}`}
                                    method="post"
                                    as="button"
                                    className="mt-4 w-full text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition-colors text-center block"
                                >
                                    Contact Seller
                                </Link>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                            {order.status === 'delivered' && (
                                <Link
                                    href={`/buyer/orders/${order.id}/review`}
                                    className="w-full flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                                >
                                    <Star size={16} />
                                    Write a Review
                                </Link>
                            )}
                            {['pending', 'confirmed'].includes(order.status) && (
                                <button
                                    onClick={cancel}
                                    disabled={processing}
                                    className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-700 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-60 transition-colors"
                                >
                                    <X size={16} />
                                    {processing ? 'Cancelling...' : 'Cancel Order'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </BuyerLayout>
        </>
    );
}
