import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Confirmation({ order }) {
    const { flash } = usePage().props;

    return (
        <AppLayout>
            <Head title={`Order ${order.order_number} Confirmed`} />

            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 size={34} />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Confirmed</h1>
                    <p className="text-gray-600 mb-6">
                        {flash?.success || 'Thank you for your purchase. Your order has been placed successfully.'}
                    </p>

                    <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 text-primary-700 px-4 py-2 text-sm font-semibold mb-8">
                        <Package size={16} />
                        {order.order_number}
                    </div>

                    <div className="text-left border border-gray-100 rounded-xl divide-y divide-gray-100 mb-8">
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">
                                        {item.product_name || item.product?.name}
                                    </p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-gray-900 shrink-0">
                                    ${parseFloat(item.subtotal ?? item.total_price ?? 0).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-100 pt-4 mb-8 text-sm">
                        <span className="text-gray-600">Order total</span>
                        <span className="text-xl font-bold text-gray-900">
                            ${parseFloat(order.total ?? order.total_amount ?? 0).toFixed(2)}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={`/buyer/orders/${order.id}`}
                            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                        >
                            View Order Details
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="/products"
                            className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-primary-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
                        >
                            <ShoppingBag size={18} />
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
