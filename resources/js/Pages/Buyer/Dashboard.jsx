import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { Package, Heart, MessageCircle, ShoppingBag, Bell } from 'lucide-react';

const statusColors = {
    pending:   'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped:   'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function Dashboard({ buyer, recentOrders, stats }) {
    const { auth, flash } = usePage().props;

    return (
        <>
            <Head title="My Dashboard" />
            <BuyerLayout>
                {/* Greeting */}
                <div className="mb-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-primary-100 text-sm font-medium mb-1">Welcome back,</p>
                    <h1 className="text-2xl font-bold">{auth.user?.name} 👋</h1>
                    {!auth.user?.email_verified_at && (
                        <div className="mt-4 bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-3 text-sm flex items-start gap-2">
                            <Bell size={16} className="mt-0.5 shrink-0" />
                            <span>
                                Please{' '}
                                <Link href="/email/verify" className="font-bold underline">verify your email address</Link>
                                {' '}to fully access all features.
                            </span>
                        </div>
                    )}
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <Package size={20} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                        <p className="text-sm text-gray-500 mt-1">Total Orders</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                <ShoppingBag size={20} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            TZS {parseFloat(stats.totalSpent || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Total Spent</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                                <Heart size={20} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.wishlistCount}</p>
                        <p className="text-sm text-gray-500 mt-1">Wishlist Items</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                <Bell size={20} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.unreadNotifs}</p>
                        <p className="text-sm text-gray-500 mt-1">Notifications</p>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 text-lg">Recent Orders</h2>
                        <Link href="/buyer/orders" className="text-sm text-primary-600 font-medium hover:text-primary-700">
                            View All →
                        </Link>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {recentOrders.map(order => (
                                <div key={order.id} className="p-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <Package size={18} className="text-gray-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{order.order_number}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString()} · {order.items?.length || 0} item(s)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                            TZS {parseFloat(order.total_amount).toLocaleString()}
                                        </span>
                                        <Link href={`/buyer/orders/${order.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Package size={40} className="text-gray-300 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-1">No orders yet</h3>
                            <p className="text-gray-500 text-sm mb-4">Start shopping to see your orders here.</p>
                            <Link href="/products" className="inline-block bg-primary-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-primary-700">
                                Browse Products
                            </Link>
                        </div>
                    )}
                </div>
            </BuyerLayout>
        </>
    );
}
