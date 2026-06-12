import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import Pagination from '@/Components/UI/Pagination';
import StatusBadge from '@/Components/UI/StatusBadge';
import { formatCurrency } from '@/lib/formatCurrency';
import { ORDER_STATUS_LABELS_FR } from '@/lib/orderStatusLabels';
import { Package, Calendar, Filter, X } from 'lucide-react';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function OrdersIndex({ orders, filters }) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const applyFilters = (overrides = {}) => {
        router.get('/seller/orders', {
            status: filters.status || '',
            date_from: dateFrom,
            date_to: dateTo,
            ...overrides,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleStatusFilter = (status) => {
        applyFilters({ status: status === 'all' ? '' : status });
    };

    const handleDateFilter = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const clearDateFilters = () => {
        setDateFrom('');
        setDateTo('');
        applyFilters({ date_from: '', date_to: '' });
    };

    const hasDateFilters = filters.date_from || filters.date_to;
    const hasActiveFilters = filters.status || hasDateFilters;

    return (
        <>
            <Head title="Commandes de la boutique" />
            <SellerLayout title="Commandes">
                <p className="text-gray-500 mb-6">Gérez et traitez les commandes de vos clients.</p>

                {/* Filtres */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm overflow-x-auto w-full">
                        {STATUS_TABS.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusFilter(status)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                                    (filters.status === status) || (!filters.status && status === 'all')
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {ORDER_STATUS_LABELS_FR[status]}
                            </button>
                        ))}
                    </div>

                    <form
                        onSubmit={handleDateFilter}
                        className="flex flex-col sm:flex-row gap-3 items-start sm:items-end"
                    >
                        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                            <label className="flex flex-col gap-1 text-sm flex-1">
                                <span className="font-medium text-gray-700 flex items-center gap-1.5">
                                    <Calendar size={14} /> Du
                                </span>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-sm flex-1">
                                <span className="font-medium text-gray-700 flex items-center gap-1.5">
                                    <Calendar size={14} /> Au
                                </span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </label>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                type="submit"
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <Filter size={16} />
                                Appliquer
                            </button>
                            {hasDateFilters && (
                                <button
                                    type="button"
                                    onClick={clearDateFilters}
                                    className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <X size={16} />
                                    Effacer
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {orders.data.length > 0 ? (
                    <>
                        {/* Tableau bureau */}
                        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Commande</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Articles</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {order.order_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900">
                                                    {order.buyer?.user?.name || 'Inconnu'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.items_count ?? order.items?.length ?? 0}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.status} labels={ORDER_STATUS_LABELS_FR} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/seller/orders/${order.id}`}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium transition-colors"
                                                >
                                                    Gérer
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cartes mobile */}
                        <div className="md:hidden space-y-3">
                            {orders.data.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div>
                                            <p className="font-bold text-gray-900">{order.order_number}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <StatusBadge status={order.status} labels={ORDER_STATUS_LABELS_FR} />
                                    </div>

                                    <div className="space-y-1.5 text-sm mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Client</span>
                                            <span className="font-medium text-gray-900">
                                                {order.buyer?.user?.name || 'Inconnu'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Articles</span>
                                            <span className="text-gray-900">
                                                {order.items_count ?? order.items?.length ?? 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Total</span>
                                            <span className="font-bold text-gray-900">
                                                {formatCurrency(order.total_amount)}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/seller/orders/${order.id}`}
                                        className="block w-full text-center px-3 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium text-sm transition-colors"
                                    >
                                        Gérer la commande
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <Pagination links={orders.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 sm:p-16 text-center shadow-sm">
                        <Package size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune commande trouvée</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {hasActiveFilters
                                ? 'Aucune commande ne correspond à vos filtres actuels. Essayez de modifier le statut ou la période.'
                                : "Vous n'avez pas encore reçu de commande. Elles apparaîtront ici dès que vos clients commenceront à acheter."}
                        </p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={() => {
                                    setDateFrom('');
                                    setDateTo('');
                                    router.get('/seller/orders', {}, { preserveState: true });
                                }}
                                className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                            >
                                <X size={16} />
                                Effacer tous les filtres
                            </button>
                        )}
                    </div>
                )}
            </SellerLayout>
        </>
    );
}
