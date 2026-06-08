import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import RatingStars from '@/Components/UI/RatingStars';
import StatusBadge from '@/Components/UI/StatusBadge';
import {
    Package, ShoppingCart, DollarSign, Clock, Star,
    Plus, MessageCircle, FileText, User, AlertTriangle,
    TrendingUp, ArrowRight, Inbox,
} from 'lucide-react';

const formatCurrency = (amount) =>
    `TZS ${parseFloat(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function StatCard({ icon: Icon, iconBg, iconColor, label, value, subtext }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
                    <Icon size={20} />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
            {subtext && (
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <TrendingUp size={12} />
                    {subtext}
                </p>
            )}
        </div>
    );
}

function QuickAction({ href, icon: Icon, label, description, color }) {
    return (
        <Link
            href={href}
            className="group bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-amber-300 hover:shadow-md transition-all flex items-start gap-3"
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-amber-500 shrink-0 mt-1 transition-colors" />
        </Link>
    );
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }) {
    return (
        <div className="p-10 text-center">
            <Icon size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-500 text-sm mb-4 max-w-xs mx-auto">{description}</p>
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="inline-flex items-center gap-2 bg-amber-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}

export default function SellerDashboard({ seller, stats, recentOrders, recentReviews, revenueData }) {
    const { auth, flash } = usePage().props;
    const store = seller ?? auth.user?.seller;

    const maxRevenue = Math.max(...revenueData.map((d) => d.amount), 0);
    const hasRevenue = revenueData.some((d) => d.amount > 0);
    const pendingItems = stats.pendingOrders + stats.pendingProducts + stats.lowStockProducts;

    return (
        <>
            <Head title="Seller Dashboard" />
            <SellerLayout title="Dashboard">

                {/* Welcome Banner */}
                <div className="mb-8 bg-gradient-to-r from-amber-500 to-amber-700 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-amber-100 text-sm font-medium mb-1">Welcome back,</p>
                    <h2 className="text-2xl font-bold">{store?.business_name || auth.user?.name} 👋</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-amber-100">
                        {stats.averageRating > 0 && (
                            <span className="flex items-center gap-1.5">
                                <Star size={14} className="text-amber-200 fill-amber-200" />
                                {stats.averageRating.toFixed(1)} avg. rating
                            </span>
                        )}
                        {stats.unreadMessages > 0 && (
                            <Link href="/seller/messages" className="flex items-center gap-1.5 hover:text-white transition-colors">
                                <MessageCircle size={14} />
                                {stats.unreadMessages} unread message{stats.unreadMessages !== 1 ? 's' : ''}
                            </Link>
                        )}
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {store?.status === 'pending' && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                        <Clock className="text-amber-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-bold text-amber-800">Account Pending Verification</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Your seller account is under review. You can set up your store and add products,
                                but they won&apos;t be visible to buyers until you are verified.
                            </p>
                        </div>
                    </div>
                )}

                {/* KPI Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={ShoppingCart}
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                        label="Total Orders"
                        value={stats.totalOrders.toLocaleString()}
                        subtext={stats.ordersThisWeek > 0 ? `${stats.ordersThisWeek} this week` : null}
                    />
                    <StatCard
                        icon={DollarSign}
                        iconBg="bg-green-50"
                        iconColor="text-green-600"
                        label="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        subtext={stats.revenueThisWeek > 0 ? `${formatCurrency(stats.revenueThisWeek)} this week` : null}
                    />
                    <StatCard
                        icon={Package}
                        iconBg="bg-purple-50"
                        iconColor="text-purple-600"
                        label="Total Products"
                        value={stats.totalProducts.toLocaleString()}
                    />
                    <StatCard
                        icon={AlertTriangle}
                        iconBg="bg-amber-50"
                        iconColor="text-amber-600"
                        label="Pending Items"
                        value={pendingItems.toLocaleString()}
                        subtext={
                            stats.pendingOrders > 0
                                ? `${stats.pendingOrders} order${stats.pendingOrders !== 1 ? 's' : ''} awaiting action`
                                : null
                        }
                    />
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <QuickAction
                            href="/seller/products/create"
                            icon={Plus}
                            label="Add Product"
                            description="List a new item"
                            color="bg-amber-50 text-amber-600"
                        />
                        <QuickAction
                            href="/seller/orders"
                            icon={ShoppingCart}
                            label="Manage Orders"
                            description="Fulfill & track orders"
                            color="bg-blue-50 text-blue-600"
                        />
                        <QuickAction
                            href="/seller/messages"
                            icon={MessageCircle}
                            label="Messages"
                            description={stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : 'Chat with buyers'}
                            color="bg-purple-50 text-purple-600"
                        />
                        <QuickAction
                            href="/seller/reports"
                            icon={FileText}
                            label="Reports"
                            description="Sales & analytics"
                            color="bg-green-50 text-green-600"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-gray-900">Revenue (Last 7 Days)</h2>
                            <Link href="/seller/reports" className="text-sm text-amber-600 font-medium hover:text-amber-700">
                                Full Report →
                            </Link>
                        </div>

                        {hasRevenue ? (
                            <div className="h-56 flex items-end justify-between gap-2 px-1">
                                {revenueData.map((data, i) => {
                                    const heightPct = maxRevenue > 0 ? (data.amount / maxRevenue) * 100 : 0;
                                    return (
                                        <div key={i} className="flex flex-col items-center flex-1 h-full group relative">
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity z-10 pointer-events-none">
                                                {formatCurrency(data.amount)}
                                            </div>
                                            <div className="flex-1 w-full max-w-[48px] flex flex-col justify-end">
                                                <div
                                                    className="w-full bg-amber-500 rounded-t-md transition-all duration-500"
                                                    style={{ height: `${Math.max(heightPct, data.amount > 0 ? 4 : 0)}%`, minHeight: data.amount > 0 ? '4px' : '0' }}
                                                />
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500 truncate w-full text-center">{data.date}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={TrendingUp}
                                title="No revenue yet"
                                description="Delivered orders will appear here as a daily revenue chart."
                                actionLabel="View Orders"
                                actionHref="/seller/orders"
                            />
                        )}
                    </div>

                    {/* Pending Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
                        <h2 className="font-bold text-gray-900 mb-4">Pending Actions</h2>
                        <div className="flex-1 flex flex-col gap-3">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">{stats.pendingOrders}</p>
                                    <p className="text-sm text-gray-500">Orders awaiting fulfillment</p>
                                </div>
                                <Link
                                    href="/seller/orders?status=pending"
                                    className="text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-100 shrink-0"
                                >
                                    View
                                </Link>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">{stats.lowStockProducts}</p>
                                    <p className="text-sm text-gray-500">Products low on stock</p>
                                </div>
                                <Link
                                    href="/seller/products"
                                    className="text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-100 shrink-0"
                                >
                                    Manage
                                </Link>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">{stats.pendingProducts}</p>
                                    <p className="text-sm text-gray-500">Products pending approval</p>
                                </div>
                                <Link
                                    href="/seller/products"
                                    className="text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-100 shrink-0"
                                >
                                    Review
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
                            <Link href="/seller/orders" className="text-sm text-amber-600 font-medium hover:text-amber-700">
                                View All →
                            </Link>
                        </div>

                        {recentOrders.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                                <Inbox size={18} className="text-gray-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{order.order_number}</p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {order.buyer?.user?.name ?? 'Customer'} ·{' '}
                                                    {new Date(order.created_at).toLocaleDateString()} ·{' '}
                                                    {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <StatusBadge status={order.status} className="hidden sm:inline-block" />
                                            <span className="text-sm font-bold text-gray-900">
                                                {formatCurrency(order.total_amount)}
                                            </span>
                                            <Link
                                                href={`/seller/orders/${order.id}`}
                                                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={ShoppingCart}
                                title="No orders yet"
                                description="When buyers place orders, they'll show up here."
                                actionLabel="View Products"
                                actionHref="/seller/products"
                            />
                        )}
                    </div>

                    {/* Recent Reviews */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Recent Reviews</h2>
                            {stats.averageRating > 0 && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                    <RatingStars rating={stats.averageRating} size={14} />
                                    <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        {recentReviews.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {recentReviews.map((review) => (
                                    <div key={review.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <span className="font-semibold text-gray-900 truncate">
                                                {review.buyer?.user?.name ?? 'Buyer'}
                                            </span>
                                            <RatingStars rating={review.rating} size={14} />
                                        </div>
                                        {review.title && (
                                            <p className="text-sm font-medium text-gray-800 mb-0.5">{review.title}</p>
                                        )}
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {review.comment || 'No comment provided.'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1.5">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Star}
                                title="No reviews yet"
                                description="Great service earns great reviews from your buyers."
                            />
                        )}
                    </div>
                </div>

                {/* Store Profile shortcut */}
                <div className="mt-6">
                    <Link
                        href="/seller/profile"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors"
                    >
                        <User size={14} />
                        Manage store profile & settings
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </SellerLayout>
        </>
    );
}
