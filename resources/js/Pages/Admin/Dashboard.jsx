import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, Store, ShoppingBag, DollarSign, Clock } from 'lucide-react';

export default function Dashboard({ stats, pendingSellers, recentOrders }) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminLayout title="Platform Overview">
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Buyers</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                            <Store size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Verified Sellers</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalSellers.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Platform GMV</p>
                            <p className="text-2xl font-bold text-gray-900">
                                TZS {parseFloat(stats.totalRevenue).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Pending Sellers */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Clock className="text-amber-500" size={20} />
                                <h2 className="font-bold text-gray-900">Pending Seller Approvals</h2>
                            </div>
                            <Link href="/admin/sellers?status=pending" className="text-sm text-primary-600 font-medium hover:text-primary-700">View All</Link>
                        </div>
                        {pendingSellers.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {pendingSellers.map(seller => (
                                    <div key={seller.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-gray-900">{seller.business_name}</p>
                                            <p className="text-sm text-gray-500">{seller.user?.email}</p>
                                        </div>
                                        <Link 
                                            href={`/admin/sellers/${seller.id}`}
                                            className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">No pending approvals.</div>
                        )}
                    </div>

                    {/* Recent Orders Overview */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Recent Platform Orders</h2>
                        </div>
                        {recentOrders.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {recentOrders.map(order => (
                                    <div key={order.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-gray-900">{order.order_number}</p>
                                            <p className="text-xs text-gray-500">
                                                By {order.buyer?.user?.name} • From {order.seller?.business_name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">TZS {parseFloat(order.total_amount).toLocaleString()}</p>
                                            <span className="text-xs capitalize text-gray-500">{order.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">No recent orders.</div>
                        )}
                    </div>
                </div>

            </AdminLayout>
        </>
    );
}
