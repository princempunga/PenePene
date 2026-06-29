import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import useTranslation from '@/hooks/useTranslation';
import { formatCurrency } from '@/lib/formatCurrency';
import {
    FlaskConical, Package, Heart, Clock, CheckCircle2,
    ArrowRight, ExternalLink, ShoppingBag,
} from 'lucide-react';

const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
};

function StatCard({ icon: Icon, label, value, tone = 'blue' }) {
    const tones = {
        blue: 'bg-blue-100 text-[#1E3A8A]',
        amber: 'bg-amber-100 text-amber-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        purple: 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="dashboard-card p-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${tones[tone]}`}>
                <Icon size={22} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
    );
}

export default function BuyerPanel({ stats, recentOrders, quickLinks }) {
    const { t } = useTranslation();
    const { flash, auth } = usePage().props;

    return (
        <>
            <Head title={t('demo_buyer.title')} />
            <BuyerLayout title={t('demo_buyer.title')} subtitle={t('demo_buyer.subtitle')}>
                <div className="dashboard-card p-4 sm:p-5 border-blue-200/80 bg-gradient-to-r from-blue-50 to-amber-50 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-[#1E3A8A] text-sm font-semibold">
                        <FlaskConical size={18} />
                        {t('demo_buyer.dev_only')}
                    </div>
                    <p className="text-sm text-blue-900/80 flex-1">
                        {t('demo_buyer.description')} — <span className="font-semibold">{auth.user?.name}</span>
                    </p>
                </div>

                {flash?.success && (
                    <div className="dashboard-card p-4 bg-emerald-50 border-emerald-200 text-emerald-800 text-sm">{flash.success}</div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Package} label={t('demo_buyer.stat_orders')} value={stats.orders} tone="blue" />
                    <StatCard icon={Heart} label={t('demo_buyer.stat_wishlist')} value={stats.wishlist} tone="amber" />
                    <StatCard icon={Clock} label={t('demo_buyer.stat_pending')} value={stats.pending} tone="purple" />
                    <StatCard icon={CheckCircle2} label={t('demo_buyer.stat_delivered')} value={stats.delivered} tone="emerald" />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <section className="dashboard-card overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">{t('demo_buyer.recent_orders')}</h2>
                            <Link href="/buyer/orders" className="text-sm text-[#1E3A8A] hover:text-amber-600 font-medium transition-colors">
                                {t('demo_buyer.view_all')}
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentOrders.length === 0 ? (
                                <div className="p-10 text-center">
                                    <ShoppingBag className="mx-auto text-gray-300 mb-3" size={36} />
                                    <p className="text-sm text-gray-500">{t('demo_buyer.no_orders')}</p>
                                    <Link href="/products" className="inline-block mt-4 text-sm font-semibold text-amber-600 hover:text-amber-700">
                                        {t('demo_buyer.browse')} →
                                    </Link>
                                </div>
                            ) : (
                                recentOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/buyer/orders/${order.id}`}
                                        className="flex items-center gap-4 p-4 hover:bg-blue-50/50 transition-colors duration-200 group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold shrink-0">
                                            {order.items_count}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-gray-900 truncate group-hover:text-[#1E3A8A]">{order.order_number}</p>
                                            <p className="text-xs text-gray-500 truncate">{order.seller_name}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</p>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <ArrowRight size={16} className="text-gray-300 group-hover:text-amber-500 shrink-0 transition-colors" />
                                    </Link>
                                ))
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 className="font-bold text-gray-900 mb-4">{t('demo_buyer.quick_access')}</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="dashboard-card p-4 group flex items-start gap-3 hover:border-amber-200"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-blue-700 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                                        <ExternalLink size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 group-hover:text-[#1E3A8A] transition-colors">{link.label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </BuyerLayout>
        </>
    );
}
