import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import Pagination from '@/Components/UI/Pagination';
import StatusBadge from '@/Components/UI/StatusBadge';
import { formatCurrency } from '@/lib/formatCurrency';
import { ORDER_STATUS_LABELS_FR } from '@/lib/orderStatusLabels';
import { Package, Calendar, Filter, X, MessageCircle, CreditCard, Truck, MapPin } from 'lucide-react';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function getFirstItem(order) {
    return order.items?.[0] ?? null;
}

function getItemCount(order) {
    return order.items?.length ?? 0;
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
            <Head title="Commandes" />
            <SellerLayout title="Commandes">
                <p className="text-gray-500 mb-6">Gérez vos commandes et accédez aux conversations clients.</p>

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
                        <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="w-full overflow-x-auto scrollbar-thin max-h-[600px] overflow-y-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="sticky top-0 z-10 bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-4">N° commande</th>
                                            <th className="px-4 py-4">Client</th>
                                            <th className="px-4 py-4">Produits</th>
                                            <th className="px-4 py-4">Total</th>
                                            <th className="px-4 py-4">Paiement</th>
                                            <th className="px-4 py-4">Date</th>
                                            <th className="px-4 py-4">Statut</th>
                                            <th className="px-4 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.data.map((order) => {
                                            const item = getFirstItem(order);
                                            const itemCount = getItemCount(order);
                                            const imgPath = item?.product?.images?.[0]?.image_path;

                                            return (
                                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-4 font-bold text-gray-900 whitespace-nowrap">
                                                        {order.order_number}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{order.buyer?.user?.name || 'Inconnu'}</p>
                                                            {order.buyer?.user?.phone && (
                                                                <p className="text-xs text-gray-500">{order.buyer.user.phone}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                                                                {imgPath ? (
                                                                    <img src={`/storage/${imgPath}`} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Package size={16} />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="truncate max-w-[140px] font-medium text-gray-900">
                                                                    {item?.product_name || item?.product?.name || '—'}
                                                                </p>
                                                                {itemCount > 1 && (
                                                                    <p className="text-xs text-gray-500">+{itemCount - 1} autre{itemCount > 2 ? 's' : ''}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 font-semibold whitespace-nowrap">
                                                        {formatCurrency(order.total_amount)}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${order.payment_status === 'paid' ? 'text-green-700' : 'text-amber-700'}`}>
                                                            <CreditCard size={12} />
                                                            {order.payment_status === 'paid' ? 'Payé' : 'En attente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {formatDate(order.created_at)}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <StatusBadge status={order.status} labels={ORDER_STATUS_LABELS_FR} />
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="inline-flex items-center gap-2">
                                                            {order.conversation_id && (
                                                                <Link
                                                                    href={`/seller/messages/${order.conversation_id}`}
                                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                                                                    title="Conversation"
                                                                >
                                                                    <MessageCircle size={14} />
                                                                </Link>
                                                            )}
                                                            <Link
                                                                href={`/seller/orders/${order.id}`}
                                                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium transition-colors text-xs"
                                                            >
                                                                Détails
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="lg:hidden space-y-3">
                            {orders.data.map((order) => {
                                const item = getFirstItem(order);
                                const itemCount = getItemCount(order);
                                const imgPath = item?.product?.images?.[0]?.image_path;

                                return (
                                    <Link
                                        key={order.id}
                                        href={`/seller/orders/${order.id}`}
                                        className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-primary-200 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                                                    {imgPath ? (
                                                        <img src={`/storage/${imgPath}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{order.order_number}</p>
                                                    <p className="text-sm text-gray-500 mt-0.5">
                                                        {order.buyer?.user?.name || 'Inconnu'}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={order.status} labels={ORDER_STATUS_LABELS_FR} />
                                        </div>

                                        <div className="space-y-1.5 text-sm mb-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Produit</span>
                                                <span className="font-medium text-gray-900 truncate ml-4">
                                                    {item?.product_name || '—'}
                                                    {itemCount > 1 && <span className="text-gray-400"> +{itemCount - 1}</span>}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Total</span>
                                                <span className="font-semibold text-gray-900">{formatCurrency(order.total_amount)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Paiement</span>
                                                <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-700' : 'text-amber-700'}`}>
                                                    {order.payment_status === 'paid' ? 'Payé' : 'En attente'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Date</span>
                                                <span>{formatDate(order.created_at)}</span>
                                            </div>
                                        </div>

                                        {order.conversation_id && (
                                            <span className="inline-flex items-center gap-1 text-xs text-primary-600 font-medium">
                                                <MessageCircle size={14} />
                                                Conversation disponible
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        <Pagination links={orders.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 sm:p-16 text-center shadow-sm">
                        <Package size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune commande trouvée</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {hasActiveFilters
                                ? 'Aucune commande ne correspond à vos filtres.'
                                : "Vous n'avez pas encore reçu de commande."}
                        </p>
                    </div>
                )}
            </SellerLayout>
        </>
    );
}
