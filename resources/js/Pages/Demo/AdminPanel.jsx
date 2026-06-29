import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminStatCard from '@/Components/Admin/AdminStatCard';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminBadge from '@/Components/Admin/AdminBadge';
import AdminAlert from '@/Components/Admin/AdminAlert';
import useTranslation from '@/hooks/useTranslation';
import { formatCurrency } from '@/lib/formatCurrency';
import {
    FlaskConical, Users, Store, ShoppingBag, DollarSign, Clock,
    Shield, ArrowRight, ToggleLeft, ToggleRight, ExternalLink,
    TrendingUp, MapPin, Star, CreditCard, MessageSquare, Package,
    Activity,
} from 'lucide-react';

const ACTIVITY_ICONS = {
    seller: Store,
    order: ShoppingBag,
    review: Star,
    payment: CreditCard,
    support: MessageSquare,
};

function SalesBarChart({ labels, values }) {
    const max = Math.max(...values, 1);
    return (
        <div className="flex h-52 items-end gap-2 sm:h-60 sm:gap-3">
            {values.map((val, i) => (
                <div key={labels[i]} className="group flex flex-1 flex-col items-center gap-2">
                    <span className="hidden text-[10px] font-semibold text-slate-500 opacity-0 transition group-hover:opacity-100 sm:block">
                        {(val / 1000000).toFixed(1)}M
                    </span>
                    <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#002E5D] to-[#0056B3] transition-all duration-300 group-hover:from-[#0056B3] group-hover:to-[#0066CC]"
                        style={{ height: `${Math.max((val / max) * 100, 8)}%` }}
                    />
                    <span className="text-[10px] font-medium text-slate-500 sm:text-xs">{labels[i]}</span>
                </div>
            ))}
        </div>
    );
}

function TrafficDonut({ sources }) {
    let cumulative = 0;
    const gradient = sources
        .map((s) => {
            const start = cumulative;
            cumulative += s.value;
            return `${s.color} ${start}% ${cumulative}%`;
        })
        .join(', ');

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div
                className="relative h-36 w-36 shrink-0 rounded-full shadow-inner ring-4 ring-white dark:ring-slate-800"
                style={{ background: `conic-gradient(${gradient})` }}
            >
                <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                    <span className="text-2xl font-bold text-[#002E5D] dark:text-white">100%</span>
                    <span className="text-[10px] text-slate-500">Trafic</span>
                </div>
            </div>
            <ul className="w-full space-y-2">
                {sources.map((s) => (
                    <li key={s.label} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                            {s.label}
                        </span>
                        <span className="font-bold text-[#002E5D] dark:text-white">{s.value}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function AdminPanel({
    stats,
    salesChart,
    trafficSources,
    pendingSellers,
    recentOrders,
    topProducts,
    activityFeed,
    regions,
    maintenanceMode,
    quickLinks,
}) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

    const toggleMaintenance = () => {
        router.post('/demo/admin-panel/maintenance', { enabled: !maintenanceMode }, { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('demo_admin.title')} />
            <AdminLayout title={t('demo_admin.title')} subtitle={t('demo_admin.subtitle')}>

                {/* Bannière démo */}
                <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:flex-row sm:items-center sm:p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                        <FlaskConical size={18} />
                        {t('demo_admin.dev_only')}
                    </div>
                    <p className="flex-1 text-sm text-amber-900/80">{t('demo_admin.description')}</p>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                        <Activity size={12} />
                        {t('demo_admin.fake_data')}
                    </span>
                </div>

                {flash?.success && <AdminAlert>{flash.success}</AdminAlert>}

                {/* KPIs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminStatCard
                        icon={DollarSign}
                        label={t('demo_admin.stat_revenue')}
                        value={formatCurrency(stats.totalRevenue, { symbol: 'TZS' })}
                        trend={stats.growthRevenue}
                        tone="emerald"
                    />
                    <AdminStatCard
                        icon={Users}
                        label={t('demo_admin.stat_users')}
                        value={stats.totalUsers.toLocaleString('fr-FR')}
                        trend={stats.growthUsers}
                        tone="blue"
                    />
                    <AdminStatCard
                        icon={ShoppingBag}
                        label={t('demo_admin.stat_orders')}
                        value={stats.totalOrders.toLocaleString('fr-FR')}
                        tone="navy"
                    />
                    <AdminStatCard
                        icon={TrendingUp}
                        label={t('demo_admin.stat_conversion')}
                        value={`${stats.conversionRate} %`}
                        tone="gold"
                    />
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-[#002E5D]">{t('demo_admin.sales_chart')}</h2>
                                <p className="text-sm text-slate-500">{t('demo_admin.sales_chart_sub')}</p>
                            </div>
                            <span className="rounded-lg bg-[#FFB300]/15 px-2.5 py-1 text-xs font-bold text-[#B8860B]">TZS</span>
                        </div>
                        <SalesBarChart labels={salesChart.labels} values={salesChart.values} />
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <h2 className="font-bold text-[#002E5D]">{t('demo_admin.traffic_chart')}</h2>
                        <p className="mb-4 text-sm text-slate-500">{t('demo_admin.traffic_chart_sub')}</p>
                        <TrafficDonut sources={trafficSources} />
                    </div>
                </div>

                {/* Vendeurs en attente + simulation */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <AdminCard
                        title={t('demo_admin.pending_sellers')}
                        icon={Clock}
                        actionLabel={t('demo_admin.view_all')}
                        actionHref="/admin/sellers"
                        className="lg:col-span-2"
                    >
                        <div className="grid gap-3 p-4 sm:grid-cols-2">
                            {pendingSellers.map((seller) => (
                                <div
                                    key={seller.id}
                                    className="group overflow-hidden rounded-xl border border-slate-100 bg-white transition hover:border-[#0056B3]/20 hover:shadow-md"
                                >
                                    <div className="relative h-24 overflow-hidden bg-slate-100">
                                        <img
                                            src={seller.cover}
                                            alt=""
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#002E5D]/60 to-transparent" />
                                        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#002E5D]">
                                            {seller.category}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3">
                                        <img
                                            src={seller.avatar}
                                            alt=""
                                            className="h-10 w-10 shrink-0 rounded-lg object-cover ring-2 ring-[#FFB300]/30"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-[#002E5D]">{seller.business_name}</p>
                                            <p className="truncate text-xs text-slate-500">{seller.owner_name}</p>
                                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                                <MapPin size={10} />
                                                {seller.city}, {seller.country}
                                            </p>
                                        </div>
                                        <button type="button" className="admin-btn-primary shrink-0 !px-2.5 !py-1.5 !text-xs">
                                            {t('demo_admin.review')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminCard>

                    <AdminCard title={t('demo_admin.simulation')} icon={Shield}>
                        <div className="space-y-4 p-5">
                            <p className="text-sm text-slate-500">{t('demo_admin.maintenance_hint')}</p>
                            <button
                                type="button"
                                onClick={toggleMaintenance}
                                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                                    maintenanceMode
                                        ? 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
                                        : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                }`}
                            >
                                <span>{maintenanceMode ? t('demo_admin.maintenance_on') : t('demo_admin.maintenance_off')}</span>
                                {maintenanceMode ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                            </button>

                            <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('demo_admin.active_today')}</p>
                                <p className="mt-1 text-2xl font-bold text-[#002E5D]">{stats.activeToday.toLocaleString('fr-FR')}</p>
                            </div>
                        </div>
                    </AdminCard>
                </div>

                {/* Top produits + activité */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <AdminCard title={t('demo_admin.top_products')} icon={Package}>
                        <div className="divide-y divide-slate-100">
                            {topProducts.map((product, i) => (
                                <div key={product.name} className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50/80">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#002E5D]/8 text-xs font-bold text-[#002E5D]">
                                        {i + 1}
                                    </span>
                                    <img src={product.image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-[#002E5D]">{product.name}</p>
                                        <p className="truncate text-xs text-slate-500">{product.seller}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-bold text-[#002E5D]">{product.sales} ventes</p>
                                        <p className="text-xs text-slate-500">{formatCurrency(product.revenue, { symbol: 'TZS' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminCard>

                    <AdminCard title={t('demo_admin.activity')} icon={Activity}>
                        <div className="divide-y divide-slate-100">
                            {activityFeed.map((item, i) => {
                                const Icon = ACTIVITY_ICONS[item.type] || Activity;
                                return (
                                    <div key={i} className="flex items-start gap-3 px-5 py-3 transition hover:bg-slate-50/80">
                                        {item.avatar ? (
                                            <img src={item.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                                        ) : (
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#002E5D]/8 text-[#0056B3]">
                                                <Icon size={16} />
                                            </span>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-[#002E5D]">{item.text}</p>
                                            <p className="mt-0.5 text-xs text-slate-400">{item.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </AdminCard>
                </div>

                {/* Commandes récentes */}
                <AdminCard title={t('demo_admin.recent_orders')} icon={ShoppingBag}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-bold uppercase tracking-wide text-[#002E5D]/60">
                                <tr>
                                    <th className="px-5 py-3">{t('demo_admin.col_order')}</th>
                                    <th className="px-5 py-3">{t('demo_admin.col_buyer')}</th>
                                    <th className="px-5 py-3">{t('demo_admin.col_product')}</th>
                                    <th className="px-5 py-3">{t('demo_admin.col_total')}</th>
                                    <th className="px-5 py-3">{t('demo_admin.col_status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="transition hover:bg-slate-50/80">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-[#002E5D]">{order.order_number}</p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(order.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <img src={order.buyer_avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                                                <span className="font-medium text-[#002E5D]">{order.buyer_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <img src={order.product_image} alt="" className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200" />
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-[#002E5D]">{order.product_name}</p>
                                                    <p className="truncate text-xs text-slate-500">{order.seller_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 font-bold text-[#002E5D]">
                                            {formatCurrency(order.total, { symbol: 'TZS' })}
                                        </td>
                                        <td className="px-5 py-3">
                                            <AdminBadge variant={order.status}>{order.status}</AdminBadge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminCard>

                {/* Régions */}
                <AdminCard title={t('demo_admin.regions')} icon={MapPin}>
                    <div className="space-y-3 p-5">
                        {regions.map((region) => (
                            <div key={region.name}>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span className="font-medium text-[#002E5D]">{region.name}</span>
                                    <span className="text-slate-500">{region.orders} cmd · {region.pct}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#002E5D] to-[#0056B3]"
                                        style={{ width: `${region.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminCard>

                {/* Accès rapide */}
                <section>
                    <h2 className="mb-4 font-bold text-[#002E5D]">{t('demo_admin.quick_access')}</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0056B3]/20 hover:shadow-md"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002E5D] text-[#FFB300] transition group-hover:scale-105">
                                    <ExternalLink size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-[#002E5D] group-hover:text-[#0056B3]">{link.label}</p>
                                    <p className="mt-0.5 text-xs text-slate-500">{link.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </AdminLayout>
        </>
    );
}
