import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import RatingStars from '@/Components/UI/RatingStars';
import StatusBadge from '@/Components/UI/StatusBadge';
import { formatCurrency } from '@/lib/formatCurrency';
import { ORDER_STATUS_LABELS_FR } from '@/lib/orderStatusLabels';
import {
    Package, ShoppingCart, DollarSign, Clock, Star,
    Plus, MessageCircle, FileText, User, AlertTriangle,
    TrendingUp, ArrowRight, Inbox,
} from 'lucide-react';

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
            <Head title="Tableau de bord vendeur" />
            <SellerLayout title="Tableau de bord">

                {/* Bannière de bienvenue */}
                <div className="mb-8 bg-gradient-to-r from-amber-500 to-amber-700 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-amber-100 text-sm font-medium mb-1">Bon retour,</p>
                    <h2 className="text-2xl font-bold">{store?.business_name || auth.user?.name} 👋</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-amber-100">
                        {stats.averageRating > 0 && (
                            <span className="flex items-center gap-1.5">
                                <Star size={14} className="text-amber-200 fill-amber-200" />
                                {stats.averageRating.toFixed(1)} note moyenne
                            </span>
                        )}
                        {stats.unreadMessages > 0 && (
                            <Link href="/seller/messages" className="flex items-center gap-1.5 hover:text-white transition-colors">
                                <MessageCircle size={14} />
                                {stats.unreadMessages} message{stats.unreadMessages !== 1 ? 's' : ''} non lu{stats.unreadMessages !== 1 ? 's' : ''}
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
                            <h3 className="font-bold text-amber-800">Compte en attente de vérification</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Votre compte vendeur est en cours d&apos;examen. Vous pouvez configurer votre boutique et ajouter des produits,
                                mais ils ne seront pas visibles par les acheteurs tant que vous n&apos;êtes pas vérifié.
                            </p>
                        </div>
                    </div>
                )}

                {/* Indicateurs clés */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={ShoppingCart}
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                        label="Commandes totales"
                        value={stats.totalOrders.toLocaleString('fr-FR')}
                        subtext={stats.ordersThisWeek > 0 ? `${stats.ordersThisWeek} cette semaine` : null}
                    />
                    <StatCard
                        icon={DollarSign}
                        iconBg="bg-green-50"
                        iconColor="text-green-600"
                        label="Chiffre d'affaires total"
                        value={formatCurrency(stats.totalRevenue)}
                        subtext={stats.revenueThisWeek > 0 ? `${formatCurrency(stats.revenueThisWeek)} cette semaine` : null}
                    />
                    <StatCard
                        icon={Package}
                        iconBg="bg-purple-50"
                        iconColor="text-purple-600"
                        label="Produits totaux"
                        value={stats.totalProducts.toLocaleString('fr-FR')}
                    />
                    <StatCard
                        icon={AlertTriangle}
                        iconBg="bg-amber-50"
                        iconColor="text-amber-600"
                        label="Éléments en attente"
                        value={pendingItems.toLocaleString('fr-FR')}
                        subtext={
                            stats.pendingOrders > 0
                                ? `${stats.pendingOrders} commande${stats.pendingOrders !== 1 ? 's' : ''} à traiter`
                                : null
                        }
                    />
                </div>

                {/* CRM Pipeline - Suivi des conversations */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900">Pipeline des négociations</h2>
                        <Link href="/seller/messages" className="text-sm text-primary-600 font-medium hover:text-primary-700">
                            Voir les conversations →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link href="/seller/messages" className="group bg-blue-50 border border-blue-100 hover:border-blue-300 hover:shadow-md rounded-xl p-4 transition-all">
                            <p className="text-3xl font-bold text-blue-700 mb-1">{stats.activeInquiries ?? 0}</p>
                            <p className="text-sm font-medium text-blue-600">Demandes</p>
                            <p className="text-xs text-blue-400 mt-0.5">Nouvelles demandes de devis</p>
                        </Link>
                        <Link href="/seller/messages" className="group bg-amber-50 border border-amber-100 hover:border-amber-300 hover:shadow-md rounded-xl p-4 transition-all">
                            <p className="text-3xl font-bold text-amber-700 mb-1">{stats.negotiating ?? 0}</p>
                            <p className="text-sm font-medium text-amber-600">Négociation</p>
                            <p className="text-xs text-amber-400 mt-0.5">En cours de discussion</p>
                        </Link>
                        <Link href="/seller/messages" className="group bg-indigo-50 border border-indigo-100 hover:border-indigo-300 hover:shadow-md rounded-xl p-4 transition-all">
                            <p className="text-3xl font-bold text-indigo-700 mb-1">{stats.dealsConfirmed ?? 0}</p>
                            <p className="text-sm font-medium text-indigo-600">Confirmés</p>
                            <p className="text-xs text-indigo-400 mt-0.5">Accords conclus</p>
                        </Link>
                        <Link href="/seller/messages" className="group bg-green-50 border border-green-100 hover:border-green-300 hover:shadow-md rounded-xl p-4 transition-all">
                            <p className="text-3xl font-bold text-green-700 mb-1">{stats.dealsSold ?? 0}</p>
                            <p className="text-sm font-medium text-green-600">Vendus</p>
                            <p className="text-xs text-green-400 mt-0.5">Transactions complètes</p>
                        </Link>
                    </div>
                </div>

                {/* Actions rapides */}
                <div className="mb-8">
                    <h2 className="font-bold text-gray-900 mb-4">Actions rapides</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <QuickAction
                            href="/seller/products/create"
                            icon={Plus}
                            label="Ajouter un produit"
                            description="Mettre un nouvel article en ligne"
                            color="bg-amber-50 text-amber-600"
                        />
                        <QuickAction
                            href="/seller/orders"
                            icon={ShoppingCart}
                            label="Gérer les commandes"
                            description="Traiter et suivre les commandes"
                            color="bg-blue-50 text-blue-600"
                        />
                        <QuickAction
                            href="/seller/messages"
                            icon={MessageCircle}
                            label="Messages"
                            description={stats.unreadMessages > 0 ? `${stats.unreadMessages} non lu${stats.unreadMessages !== 1 ? 's' : ''}` : 'Discuter avec les acheteurs'}
                            color="bg-purple-50 text-purple-600"
                        />
                        <QuickAction
                            href="/seller/reports"
                            icon={FileText}
                            label="Rapports"
                            description="Ventes et statistiques"
                            color="bg-green-50 text-green-600"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Graphique du chiffre d'affaires */}
                    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-gray-900">Chiffre d&apos;affaires (7 derniers jours)</h2>
                            <Link href="/seller/reports" className="text-sm text-amber-600 font-medium hover:text-amber-700">
                                Rapport complet →
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
                                title="Aucun chiffre d'affaires pour le moment"
                                description="Les commandes livrées apparaîtront ici sous forme de graphique quotidien."
                                actionLabel="Voir les commandes"
                                actionHref="/seller/orders"
                            />
                        )}
                    </div>

                    {/* Actions en attente */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
                        <h2 className="font-bold text-gray-900 mb-4">Actions en attente</h2>
                        <div className="flex-1 flex flex-col gap-3">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">{stats.pendingOrders}</p>
                                    <p className="text-sm text-gray-500">Commandes en attente de traitement</p>
                                </div>
                                <Link
                                    href="/seller/orders?status=pending"
                                    className="text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-100 shrink-0"
                                >
                                    Voir
                                </Link>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">{stats.lowStockProducts}</p>
                                    <p className="text-sm text-gray-500">Produits en rupture de stock</p>
                                </div>
                                <Link
                                    href="/seller/products"
                                    className="text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-100 shrink-0"
                                >
                                    Gérer
                                </Link>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">{stats.pendingProducts}</p>
                                    <p className="text-sm text-gray-500">Produits en attente d&apos;approbation</p>
                                </div>
                                <Link
                                    href="/seller/products"
                                    className="text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-100 shrink-0"
                                >
                                    Examiner
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Commandes récentes */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Commandes récentes</h2>
                            <Link href="/seller/orders" className="text-sm text-amber-600 font-medium hover:text-amber-700">
                                Tout voir →
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
                                                    {order.buyer?.user?.name ?? 'Client'} ·{' '}
                                                    {new Date(order.created_at).toLocaleDateString('fr-FR')} ·{' '}
                                                    {order.items?.length ?? 0} article{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <StatusBadge status={order.status} labels={ORDER_STATUS_LABELS_FR} className="hidden sm:inline-block" />
                                            <span className="text-sm font-bold text-gray-900">
                                                {formatCurrency(order.total_amount)}
                                            </span>
                                            <Link
                                                href={`/seller/orders/${order.id}`}
                                                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                                            >
                                                Voir
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={ShoppingCart}
                                title="Aucune commande pour le moment"
                                description="Les commandes de vos acheteurs apparaîtront ici."
                                actionLabel="Voir les produits"
                                actionHref="/seller/products"
                            />
                        )}
                    </div>

                    {/* Avis récents */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Avis récents</h2>
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
                                                {review.buyer?.user?.name ?? 'Acheteur'}
                                            </span>
                                            <RatingStars rating={review.rating} size={14} />
                                        </div>
                                        {review.title && (
                                            <p className="text-sm font-medium text-gray-800 mb-0.5">{review.title}</p>
                                        )}
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {review.comment || 'Aucun commentaire.'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1.5">
                                            {new Date(review.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Star}
                                title="Aucun avis pour le moment"
                                description="Un excellent service attire de bons avis de la part de vos acheteurs."
                            />
                        )}
                    </div>
                </div>

                {/* Raccourci profil boutique */}
                <div className="mt-6">
                    <Link
                        href="/seller/profile"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors"
                    >
                        <User size={14} />
                        Gérer le profil et les paramètres de la boutique
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </SellerLayout>
        </>
    );
}
