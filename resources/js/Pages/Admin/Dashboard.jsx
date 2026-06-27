import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminStatCard from '@/Components/Admin/AdminStatCard';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminBadge from '@/Components/Admin/AdminBadge';
import { formatCurrency } from '@/lib/formatCurrency';
import { blockAdminDemoAction } from '@/lib/adminDemo';
import {
    Users, Store, ShoppingBag, DollarSign, Clock, ArrowRight, Activity,
} from 'lucide-react';

export default function Dashboard({ stats, pendingSellers, recentOrders }) {
    const { usingDemoData } = usePage().props;

    const handleDemoClick = (e) => {
        if (blockAdminDemoAction(usingDemoData)) {
            e.preventDefault();
        }
    };
    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminLayout
                subtitle="Console d'administration"
                title="Vue d'ensemble plateforme"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminStatCard
                        icon={Users}
                        label="Total acheteurs"
                        value={stats.totalUsers.toLocaleString()}
                        tone="blue"
                    />
                    <AdminStatCard
                        icon={Store}
                        label="Vendeurs vérifiés"
                        value={stats.totalSellers.toLocaleString()}
                        tone="gold"
                    />
                    <AdminStatCard
                        icon={ShoppingBag}
                        label="Commandes totales"
                        value={stats.totalOrders.toLocaleString()}
                        tone="navy"
                    />
                    <AdminStatCard
                        icon={DollarSign}
                        label="GMV plateforme"
                        value={formatCurrency(stats.totalRevenue, { symbol: 'TZS' })}
                        tone="emerald"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard
                        title="Approbations vendeurs en attente"
                        icon={Clock}
                        actionLabel="Voir tout"
                        actionHref="/admin/sellers?status=pending"
                    >
                        {pendingSellers.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {pendingSellers.map((seller) => (
                                    <div
                                        key={seller.id}
                                        className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-[#002E5D]">{seller.business_name}</p>
                                            <p className="mt-0.5 truncate text-sm text-slate-500">{seller.user?.email}</p>
                                        </div>
                                        <Link
                                            href={`/admin/sellers/${seller.id}`}
                                            onClick={handleDemoClick}
                                            className="admin-btn-primary shrink-0"
                                        >
                                            Examiner
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-5 py-12 text-center text-sm text-slate-500">
                                Aucune approbation en attente.
                            </div>
                        )}
                    </AdminCard>

                    <AdminCard title="Commandes récentes" icon={Activity}>
                        {recentOrders.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {recentOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/admin/orders/${order.id}`}
                                        onClick={handleDemoClick}
                                        className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-semibold text-[#002E5D]">{order.order_number}</p>
                                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                                {order.buyer?.user?.name} · {order.seller?.business_name}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="font-bold text-[#002E5D]">
                                                {formatCurrency(order.total_amount, { symbol: 'TZS' })}
                                            </p>
                                            <AdminBadge variant={order.status} className="mt-1.5">
                                                {order.status}
                                            </AdminBadge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="px-5 py-12 text-center text-sm text-slate-500">
                                Aucune commande récente.
                            </div>
                        )}
                    </AdminCard>
                </div>
            </AdminLayout>
        </>
    );
}
