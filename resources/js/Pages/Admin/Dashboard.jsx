import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, Store, ShoppingBag, DollarSign, Clock } from 'lucide-react';

export default function Dashboard({ stats, pendingSellers, recentOrders }) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminLayout title="Platform Overview">

                {/* Stats — 2 cols sur xs, 4 cols sur lg */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                            <Users size={20} className="sm:hidden" />
                            <Users size={24} className="hidden sm:block" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Buyers</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                            <Store size={20} className="sm:hidden" />
                            <Store size={24} className="hidden sm:block" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Sellers</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalSellers.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                            <ShoppingBag size={20} className="sm:hidden" />
                            <ShoppingBag size={24} className="hidden sm:block" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Orders</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                            <DollarSign size={20} className="sm:hidden" />
                            <DollarSign size={24} className="hidden sm:block" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">GMV</p>
                            <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                                TZS {parseFloat(stats.totalRevenue).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    {/* Pending Sellers */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Clock className="text-amber-500 shrink-0" size={18} />
                                <h2 className="font-bold text-gray-900 text-sm sm:text-base">Pending Approvals</h2>
                            </div>
                            <Link href="/admin/sellers?status=pending" className="text-xs sm:text-sm text-primary-600 font-medium hover:text-primary-700 whitespace-nowrap">View All</Link>
                        </div>
                        {pendingSellers.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {pendingSellers.map(seller => (
                                    <div key={seller.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{seller.business_name}</p>
                                            <p className="text-xs text-gray-500 truncate">{seller.user?.email}</p>
                                        </div>
                                        <Link
                                            href={`/admin/sellers/${seller.id}`}
                                            className="shrink-0 px-2.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-medium rounded-lg transition-colors"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">No pending approvals.</div>
                        )}
                    </div>

                    {/* Recent Orders Overview */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900 text-sm sm:text-base">Recent Platform Orders</h2>
                        </div>
                        {recentOrders.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {recentOrders.map(order => (
                                    <div key={order.id} className="p-3 sm:p-4 flex justify-between items-center hover:bg-gray-50 gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{order.order_number}</p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {order.buyer?.user?.name} · {order.seller?.business_name}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-gray-900 text-sm">TZS {parseFloat(order.total_amount).toLocaleString()}</p>
                                            <span className="text-xs capitalize text-gray-500">{order.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">No recent orders.</div>
                        )}
                    </div>
                </div>

            </AdminLayout>
        </>
    );
}

