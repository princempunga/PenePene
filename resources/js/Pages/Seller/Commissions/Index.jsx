import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import Pagination from '@/Components/UI/Pagination';
import { Percent, Receipt, Wallet, Clock, CheckCircle2 } from 'lucide-react';

const statusColors = {
    pending:   'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    paid:      'bg-green-100 text-green-800',
    refunded:  'bg-red-100 text-red-800',
};

function formatMoney(amount, currency = 'TZS') {
    const value = parseFloat(amount || 0);
    return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function CommissionsIndex({ commissions, summary, filters }) {
    const handleFilter = (status) => {
        router.get('/seller/commissions', { status: status === 'all' ? '' : status }, { preserveState: true });
    };

    const activeFilter = filters?.status || 'all';

    return (
        <>
            <Head title="Commissions" />
            <SellerLayout>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
                    <p className="text-gray-500 mt-1">
                        Track platform fees and your net earnings from each order.
                    </p>
                </div>

                {/* Summary KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <Receipt size={20} />
                            </div>
                            <p className="text-sm font-medium text-gray-500">Gross Sales</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900 tabular-nums">
                            {formatMoney(summary.total_order_amount, summary.currency)}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                                <Percent size={20} />
                            </div>
                            <p className="text-sm font-medium text-gray-500">Platform Commission</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900 tabular-nums">
                            {formatMoney(summary.total_commission, summary.currency)}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                <Wallet size={20} />
                            </div>
                            <p className="text-sm font-medium text-gray-500">Your Net Earnings</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900 tabular-nums">
                            {formatMoney(summary.total_seller_payout, summary.currency)}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <p className="text-sm font-medium text-gray-500">Awaiting Payout</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900 tabular-nums">
                            {formatMoney(summary.confirmed_payout, summary.currency)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {formatMoney(summary.paid_payout, summary.currency)} already paid
                        </p>
                    </div>
                </div>

                {/* Status filter */}
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm overflow-x-auto w-full sm:w-auto mb-6">
                    {['all', 'pending', 'confirmed', 'paid', 'refunded'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleFilter(status)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                                activeFilter === status || (!filters?.status && status === 'all')
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {commissions.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Order</th>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4 text-right">Order Amount</th>
                                        <th className="px-6 py-4 text-right">Rate</th>
                                        <th className="px-6 py-4 text-right">Commission</th>
                                        <th className="px-6 py-4 text-right">Your Payout</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {commissions.data.map((commission) => (
                                        <tr key={commission.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                {commission.order ? (
                                                    <Link
                                                        href={`/seller/orders/${commission.order_id}`}
                                                        className="font-bold text-primary-700 hover:text-primary-800"
                                                    >
                                                        {commission.order.order_number}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 max-w-[180px] truncate">
                                                {commission.order_item?.product?.name
                                                    || commission.order_item?.product_name
                                                    || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right tabular-nums font-medium text-gray-900">
                                                {formatMoney(commission.order_amount, commission.currency)}
                                            </td>
                                            <td className="px-6 py-4 text-right tabular-nums">
                                                {parseFloat(commission.commission_rate).toFixed(2)}%
                                            </td>
                                            <td className="px-6 py-4 text-right tabular-nums text-red-600">
                                                −{formatMoney(commission.commission_amount, commission.currency)}
                                            </td>
                                            <td className="px-6 py-4 text-right tabular-nums font-semibold text-green-700">
                                                {formatMoney(commission.seller_payout, commission.currency)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {formatDate(commission.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusColors[commission.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {commission.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={commissions.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <CheckCircle2 size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No commission records</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {filters?.status
                                ? `You don't have any ${filters.status} commission records.`
                                : 'Commission records will appear here once you receive paid orders.'}
                        </p>
                    </div>
                )}
            </SellerLayout>
        </>
    );
}
