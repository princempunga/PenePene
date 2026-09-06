import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users, Store, ShoppingBag, DollarSign, Clock,
    FileDown, Ticket, Shield, ChevronRight, BarChart3,
} from 'lucide-react';

import { useCurrency } from '@/context/CurrencyContext';

export default function Dashboard({ stats, pendingSellers, recentOrders }) {
    const { formatAmount } = useCurrency();

    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminLayout title="Platform Overview">

                {/* Stats — shortcut buttons */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
                    <Link href="/admin/sellers" className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-primary-300 hover:shadow-md transition-all group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-200 transition-colors">
                            <Users size={20} className="sm:hidden" />
                            <Users size={24} className="hidden sm:block" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Buyers</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                        </div>
                    </Link>

                    <Link href="/admin/sellers" className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-primary-300 hover:shadow-md transition-all group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-200 transition-colors">
                            <Store size={20} className="sm:hidden" />
                            <Store size={24} className="hidden sm:block" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Sellers</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalSellers.toLocaleString()}</p>
                        </div>
                    </Link>

                    <Link href="/admin/orders" className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-primary-300 hover:shadow-md transition-all group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0 group-hover:bg-purple-200 transition-colors">
                            <ShoppingBag size={20} className="sm:hidden" />
                            <ShoppingBag size={24} className="hidden sm:block" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Orders</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
                        </div>
                    </Link>

                    <Link href="/admin/sales" className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-primary-300 hover:shadow-md transition-all group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0 group-hover:bg-green-200 transition-colors">
                            <DollarSign size={20} className="sm:hidden" />
                            <DollarSign size={24} className="hidden sm:block" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">GMV</p>
                            <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                                {formatAmount(stats.totalRevenue, 'CDF')}
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Quick Access Shortcuts */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 size={16} className="text-gray-400" />
                            Raccourcis rapides
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <Link
                            href="/admin/stats-requests"
                            className="group bg-white rounded-xl border border-gray-200 p-3 sm:p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200 transition-colors shrink-0">
                                    <FileDown size={18} className="sm:hidden" />
                                    <FileDown size={22} className="hidden sm:block" />
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" />
                            </div>
                            <p className="font-semibold text-gray-900 text-sm truncate">Demandes rapports</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 hidden sm:block">
                                Approuver / refuser les exports des vendeurs
                            </p>
                        </Link>

                        <Link
                            href="/admin/support"
                            className="group bg-white rounded-xl border border-gray-200 p-3 sm:p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 group-hover:bg-sky-200 transition-colors shrink-0">
                                    <Ticket size={18} className="sm:hidden" />
                                    <Ticket size={22} className="hidden sm:block" />
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" />
                            </div>
                            <p className="font-semibold text-gray-900 text-sm truncate">Support</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 hidden sm:block">
                                Tickets utilisateurs et vendeurs
                            </p>
                        </Link>

                        <Link
                            href="/admin/trust-center"
                            className="group bg-white rounded-xl border border-gray-200 p-3 sm:p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-red-100 rounded-xl flex items-center justify-center text-red-600 group-hover:bg-red-200 transition-colors shrink-0">
                                    <Shield size={18} className="sm:hidden" />
                                    <Shield size={22} className="hidden sm:block" />
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" />
                            </div>
                            <p className="font-semibold text-gray-900 text-sm truncate">Trust Center</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 hidden sm:block">
                                Signalements et suspensions
                            </p>
                        </Link>

                        <Link
                            href="/admin/reports"
                            className="group bg-white rounded-xl border border-gray-200 p-3 sm:p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-200 transition-colors shrink-0">
                                    <BarChart3 size={18} className="sm:hidden" />
                                    <BarChart3 size={22} className="hidden sm:block" />
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" />
                            </div>
                            <p className="font-semibold text-gray-900 text-sm truncate">Rapports</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 hidden sm:block">
                                Exporter les données de la plateforme
                            </p>
                        </Link>
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
                                            href={`/admin/sellers/${seller.slug}`}
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
                                            <p className="font-bold text-gray-900 text-sm">{formatAmount(order.total_amount, order.currency || 'CDF')}</p>
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