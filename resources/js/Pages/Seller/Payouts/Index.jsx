import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import Pagination from '@/Components/UI/Pagination';
import { Wallet, Clock, CheckCircle2, Banknote, AlertCircle } from 'lucide-react';

const statusColors = {
    pending:    'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    completed:  'bg-green-100 text-green-800',
    failed:     'bg-red-100 text-red-800',
    cancelled:  'bg-gray-100 text-gray-800',
};

const paymentMethodLabels = {
    mobile_money:  'Mobile Money',
    bank_transfer: 'Bank Transfer',
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

export default function PayoutsIndex({ payouts, summary }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_method: 'mobile_money',
        account_number: '',
        account_name: '',
        notes: '',
    });

    const canRequest = summary.available_balance >= 1000 && !summary.has_pending_request;

    const submit = (e) => {
        e.preventDefault();
        post('/seller/payouts', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const requestFullBalance = () => {
        setData('amount', summary.available_balance.toFixed(2));
    };

    return (
        <>
            <Head title="Payouts" />
            <SellerLayout>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
                    <p className="text-gray-500 mt-1">
                        Request withdrawals and review your payout history.
                    </p>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {/* Summary KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                <Wallet size={24} />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Available Balance</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 tabular-nums">
                            {formatMoney(summary.available_balance, summary.currency)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Ready to withdraw</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 tabular-nums">
                            {formatMoney(summary.pending_requests, summary.currency)}
                        </p>
                        {summary.has_pending_request && (
                            <p className="text-xs text-amber-600 mt-2 font-medium">Processing in progress</p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                <Banknote size={24} />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Total Paid Out</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 tabular-nums">
                            {formatMoney(summary.total_paid_out, summary.currency)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">All completed payouts</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Request Payout Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                            <div className="p-5 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-gray-900">Request Payout</h2>
                                <p className="text-sm text-gray-500 mt-1">Minimum withdrawal: TZS 1,000.00</p>
                            </div>

                            {!canRequest ? (
                                <div className="p-6">
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                        <div>
                                            {summary.has_pending_request ? (
                                                <p>You already have a payout request being processed. Please wait until it is completed before submitting another.</p>
                                            ) : summary.available_balance < 1000 ? (
                                                <p>Your available balance is below the minimum withdrawal amount of TZS 1,000.00.</p>
                                            ) : (
                                                <p>Payout requests are currently unavailable.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={submit} className="p-6 space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                                            <button
                                                type="button"
                                                onClick={requestFullBalance}
                                                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                                            >
                                                Withdraw all
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">TZS</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="1000"
                                                max={summary.available_balance}
                                                value={data.amount}
                                                onChange={(e) => setData('amount', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm tabular-nums focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        {errors.amount && (
                                            <p className="text-red-600 text-xs mt-1">{errors.amount}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                        <select
                                            value={data.payment_method}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="mobile_money">Mobile Money (M-Pesa, Tigo, Airtel)</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                        </select>
                                        {errors.payment_method && (
                                            <p className="text-red-600 text-xs mt-1">{errors.payment_method}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                                        <input
                                            type="text"
                                            value={data.account_number}
                                            onChange={(e) => setData('account_number', e.target.value)}
                                            placeholder="Phone number or account no."
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                        />
                                        {errors.account_number && (
                                            <p className="text-red-600 text-xs mt-1">{errors.account_number}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                                        <input
                                            type="text"
                                            value={data.account_name}
                                            onChange={(e) => setData('account_name', e.target.value)}
                                            placeholder="Name on account"
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                        />
                                        {errors.account_name && (
                                            <p className="text-red-600 text-xs mt-1">{errors.account_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes <span className="text-gray-400 font-normal">(optional)</span>
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={2}
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                            placeholder="Any special instructions..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition shadow-md shadow-primary-600/20 disabled:opacity-60"
                                    >
                                        {processing ? 'Submitting…' : 'Submit Payout Request'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Payout History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900 text-lg">Payout History</h2>
                            </div>

                            {payouts.data.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-gray-600">
                                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4">Reference</th>
                                                    <th className="px-6 py-4 text-right">Amount</th>
                                                    <th className="px-6 py-4">Method</th>
                                                    <th className="px-6 py-4">Requested</th>
                                                    <th className="px-6 py-4">Processed</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {payouts.data.map((payout) => (
                                                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900">
                                                            {payout.reference || `#${payout.id}`}
                                                        </td>
                                                        <td className="px-6 py-4 text-right tabular-nums font-semibold text-gray-900">
                                                            {formatMoney(payout.amount, payout.currency)}
                                                        </td>
                                                        <td className="px-6 py-4 capitalize">
                                                            {paymentMethodLabels[payout.payment_method] || payout.payment_method || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {formatDate(payout.requested_at || payout.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {formatDate(payout.processed_at)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusColors[payout.status] || 'bg-gray-100 text-gray-800'}`}>
                                                                {payout.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-6 pb-6">
                                        <Pagination links={payouts.links} />
                                    </div>
                                </>
                            ) : (
                                <div className="p-16 text-center">
                                    <CheckCircle2 size={48} className="text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No payouts yet</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">
                                        When you request a withdrawal, your payout history will appear here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SellerLayout>
        </>
    );
}
