import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Package, ShoppingCart, DollarSign, Clock, Star } from 'lucide-react';
import RatingStars from '@/Components/UI/RatingStars';

export default function SellerDashboard({ stats, recentOrders, recentReviews, revenueData }) {
    const { auth, flash } = usePage().props;
    const seller = auth.user.seller;

    // Simple bar chart implementation for revenue
    const maxRevenue = Math.max(...revenueData.map(d => d.amount), 1); // avoid div by 0

    return (
        <>
            <Head title="Seller Dashboard" />
            <SellerLayout title="Dashboard">
                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {seller.status === 'pending' && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                        <Clock className="text-amber-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-bold text-amber-800">Account Pending Verification</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Your seller account is currently under review by our team. You can set up your store and add products, but they won't be visible to buyers until you are verified.
                            </p>
                        </div>
                    </div>
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                TZS {parseFloat(stats.totalRevenue).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                            <Star size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                                <RatingStars rating={stats.averageRating} size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="font-bold text-gray-900 mb-6">Revenue (Last 7 Days)</h2>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {revenueData.map((data, i) => {
                                const heightPercentage = (data.amount / maxRevenue) * 100;
                                return (
                                    <div key={i} className="flex flex-col items-center flex-1 group relative">
                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity z-10 pointer-events-none">
                                            TZS {parseFloat(data.amount).toLocaleString()}
                                        </div>
                                        
                                        {/* Bar */}
                                        <div className="w-full max-w-[40px] bg-primary-100 rounded-t-md relative">
                                            <div 
                                                className="absolute bottom-0 left-0 w-full bg-primary-500 rounded-t-md transition-all duration-500"
                                                style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                                            ></div>
                                        </div>
                                        
                                        {/* Label */}
                                        <div className="mt-3 text-xs text-gray-500 transform -rotate-45 origin-top-left md:rotate-0">
                                            {data.date}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pending Action Items */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
                        <h2 className="font-bold text-gray-900 mb-4">Pending Actions</h2>
                        
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">{stats.pendingOrders}</p>
                                    <p className="text-sm text-gray-500">Orders awaiting fulfillment</p>
                                </div>
                                <Link href="/seller/orders?status=pending" className="text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-100">
                                    View
                                </Link>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {/* Assuming we might add low stock logic later, hardcode for UI now */}
                                        --
                                    </p>
                                    <p className="text-sm text-gray-500">Products low on stock</p>
                                </div>
                                <Link href="/seller/products" className="text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-100">
                                    Manage
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Recent Orders</h2>
                            <Link href="/seller/orders" className="text-sm text-primary-600 font-medium hover:text-primary-700">View All</Link>
                        </div>
                        {recentOrders.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {recentOrders.map(order => (
                                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-gray-900">{order.order_number}</p>
                                            <p className="text-sm text-gray-500">{order.buyer?.user?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">TZS {parseFloat(order.total_amount).toLocaleString()}</p>
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${
                                                order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">No orders yet.</div>
                        )}
                    </div>

                    {/* Recent Reviews */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Recent Reviews</h2>
                        </div>
                        {recentReviews.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {recentReviews.map(review => (
                                    <div key={review.id} className="p-4">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-semibold text-gray-900">{review.buyer?.user?.name}</span>
                                            <RatingStars rating={review.rating} size={14} />
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">{review.comment || 'No comment provided.'}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">No reviews yet.</div>
                        )}
                    </div>
                </div>
            </SellerLayout>
        </>
    );
}
