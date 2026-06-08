import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import StatusBadge from '@/Components/UI/StatusBadge';
import { User, MapPin, Package, Check, X, Truck, MessageCircle } from 'lucide-react';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatCurrency(amount) {
    return `TZS ${parseFloat(amount || 0).toLocaleString()}`;
}

function formatAddress(order) {
    const parts = [
        order.shipping_address || order.delivery_address,
        order.delivery_city,
        order.delivery_province,
        order.delivery_country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'No address provided';
}

export default function OrderShow({ order }) {
    const { flash, errors } = usePage().props;
    const [processing, setProcessing] = React.useState(false);

    const updateStatus = (newStatus) => {
        if (!confirm(`Change order status to ${newStatus}?`)) return;

        setProcessing(true);
        router.patch(
            `/seller/orders/${order.id}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            }
        );
    };

    const currentStep = STATUS_STEPS.indexOf(order.status);
    const isTerminal = ['cancelled', 'rejected'].includes(order.status);

    return (
        <>
            <Head title={`Manage Order ${order.order_number}`} />
            <SellerLayout title="Order Details">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Link
                            href="/seller/orders"
                            className="text-sm text-gray-500 hover:text-primary-600"
                        >
                            ← Back to Orders
                        </Link>
                        <span className="text-gray-300 hidden sm:inline">/</span>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                            {order.order_number}
                        </h1>
                        <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                        Placed {formatDate(order.created_at)}
                    </p>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {errors?.status && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
                        {errors.status}
                    </div>
                )}

                {/* Status timeline */}
                {!isTerminal && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 mb-6 shadow-sm">
                        <h2 className="font-bold text-gray-900 mb-5">Fulfillment Progress</h2>
                        <div className="flex items-center overflow-x-auto pb-2">
                            {STATUS_STEPS.map((step, index) => (
                                <React.Fragment key={step}>
                                    <div className="flex flex-col items-center flex-shrink-0 min-w-[4.5rem]">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                                                index <= currentStep
                                                    ? 'bg-primary-600 border-primary-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-400'
                                            }`}
                                        >
                                            {index < currentStep ? '✓' : index + 1}
                                        </div>
                                        <p
                                            className={`text-xs mt-1.5 font-medium capitalize text-center ${
                                                index <= currentStep ? 'text-primary-600' : 'text-gray-400'
                                            }`}
                                        >
                                            {step}
                                        </p>
                                    </div>
                                    {index < STATUS_STEPS.length - 1 && (
                                        <div
                                            className={`flex-1 h-0.5 mx-1 sm:mx-2 min-w-[1.5rem] ${
                                                index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                                            }`}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        {order.confirmed_at && (
                            <p className="text-xs text-gray-500 mt-4">
                                Confirmed {formatDate(order.confirmed_at)}
                                {order.delivered_at && ` · Delivered ${formatDate(order.delivered_at)}`}
                            </p>
                        )}
                    </div>
                )}

                {order.status === 'cancelled' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800">
                        This order has been cancelled.
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Line items */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900">Items Ordered</h2>
                            </div>

                            {order.items?.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {order.items.map((item) => {
                                        const imgPath = item.product?.images?.[0]?.image_path;
                                        const name = item.product?.name || item.product_name;

                                        return (
                                            <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                                    {imgPath ? (
                                                        <img
                                                            src={`/storage/${imgPath}`}
                                                            alt={name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package size={20} className="text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {item.product?.slug ? (
                                                        <Link
                                                            href={`/products/${item.product.slug}`}
                                                            target="_blank"
                                                            className="font-semibold text-gray-900 hover:text-primary-600 truncate block"
                                                        >
                                                            {name}
                                                        </Link>
                                                    ) : (
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {name}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-gray-900">
                                                        {formatCurrency(item.total_price)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        @ {formatCurrency(item.unit_price)} each
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    No line items found for this order.
                                </div>
                            )}

                            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <div className="w-full sm:w-64 space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>
                                            {parseFloat(order.shipping_cost) > 0
                                                ? formatCurrency(order.shipping_cost)
                                                : 'Free'}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
                                        <span>Total</span>
                                        <span>{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {order.buyer_notes && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h2 className="font-bold text-gray-900 mb-2">Customer Notes</h2>
                                <p className="text-sm text-gray-600">{order.buyer_notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Status actions */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">
                                Update Status
                            </h2>

                            <div className="grid grid-cols-1 gap-2">
                                {order.status === 'pending' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => updateStatus('confirmed')}
                                            disabled={processing}
                                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Check size={16} />
                                            {processing ? 'Updating...' : 'Confirm Order'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateStatus('cancelled')}
                                            disabled={processing}
                                            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                                        >
                                            <X size={16} />
                                            Cancel Order
                                        </button>
                                    </>
                                )}

                                {order.status === 'confirmed' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => updateStatus('shipped')}
                                            disabled={processing}
                                            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Truck size={16} />
                                            {processing ? 'Updating...' : 'Mark as Shipped'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateStatus('cancelled')}
                                            disabled={processing}
                                            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                                        >
                                            <X size={16} />
                                            Cancel Order
                                        </button>
                                    </>
                                )}

                                {order.status === 'shipped' && (
                                    <button
                                        type="button"
                                        onClick={() => updateStatus('delivered')}
                                        disabled={processing}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Check size={16} />
                                        {processing ? 'Updating...' : 'Mark as Delivered'}
                                    </button>
                                )}

                                {['delivered', 'cancelled', 'rejected'].includes(order.status) && (
                                    <div className="text-center p-3 bg-gray-50 rounded-lg text-sm text-gray-500 font-medium">
                                        Order fulfillment is complete.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Buyer info */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                                <User size={18} className="text-primary-500" />
                                Customer Details
                            </h2>
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {order.buyer?.user?.name || 'Unknown customer'}
                                </p>
                                {order.buyer?.user?.email && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {order.buyer.user.email}
                                    </p>
                                )}
                                {order.buyer?.user?.phone && (
                                    <p className="text-sm text-gray-500">{order.buyer.user.phone}</p>
                                )}
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-2">
                                    <MapPin size={16} className="text-gray-400" />
                                    Shipping Address
                                </h3>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {formatAddress(order)}
                                </p>
                            </div>

                            {order.buyer?.user?.name && (
                                <Link
                                    href={`/seller/messages?search=${encodeURIComponent(order.buyer.user.name)}`}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg transition-colors"
                                >
                                    <MessageCircle size={16} />
                                    Message Customer
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </SellerLayout>
        </>
    );
}
