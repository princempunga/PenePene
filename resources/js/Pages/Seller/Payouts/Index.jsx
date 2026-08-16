import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import Pagination from '@/Components/UI/Pagination';
import { Wallet, Clock, CheckCircle2, Banknote, AlertCircle } from 'lucide-react';
import { formatCurrencyDecimal } from '@/lib/formatCurrency';

const statusColors = {
    pending:    'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    completed:  'bg-green-100 text-green-800',
    failed:     'bg-red-100 text-red-800',
    cancelled:  'bg-gray-100 text-gray-800',
};

const statusLabels = {
    pending:    'En attente',
    processing: 'En cours',
    completed:  'Payé',
    failed:     'Échoué',
    cancelled:  'Annulé',
};

const paymentMethodLabels = {
    mobile_money:  'Mobile Money',
    bank_transfer: 'Virement bancaire',
};

const MIN_WITHDRAWAL = 1000;

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
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

    const canRequest = summary.available_balance >= MIN_WITHDRAWAL && !summary.has_pending_request;

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
            <Head title="Retraits" />
            <SellerLayout>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Retraits</h1>
                    <p className="text-gray-500 mt-1">
                        Demandez des retraits et consultez l'historique de vos paiements.
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
                            <p className="text-sm font-medium text-gray-600">Solde disponible</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 tabular-nums">
                            {formatCurrencyDecimal(summary.available_balance)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Prêt à retirer</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Demandes en attente</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 tabular-nums">
                            {formatCurrencyDecimal(summary.pending_requests)}
                        </p>
                        {summary.has_pending_request && (
                            <p className="text-xs text-amber-600 mt-2 font-medium">Traitement en cours</p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                <Banknote size={24} />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Total versé</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 tabular-nums">
                            {formatCurrencyDecimal(summary.total_paid_out)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Tous les paiements effectués</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Request Payout Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                            <div className="p-5 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-gray-900">Demander un retrait</h2>
                                <p className="text-sm text-gray-500 mt-1">Retrait minimum : {formatCurrencyDecimal(MIN_WITHDRAWAL)}</p>
                            </div>

                            {!canRequest ? (
                                <div className="p-6">
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                        <div>
                                            {summary.has_pending_request ? (
                                                <p>Vous avez déjà une demande de retrait en cours de traitement. Veuillez patienter jusqu'à ce qu'elle soit terminée avant d'en soumettre une autre.</p>
                                            ) : summary.available_balance < MIN_WITHDRAWAL ? (
                                                <p>Votre solde disponible est inférieur au montant minimum de retrait de {formatCurrencyDecimal(MIN_WITHDRAWAL)}.</p>
                                            ) : (
                                                <p>Les demandes de retrait ne sont pas disponibles pour le moment.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={submit} className="p-6 space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Montant</label>
                                            <button
                                                type="button"
                                                onClick={requestFullBalance}
                                                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                                            >
                                                Tout retirer
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">FC</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min={MIN_WITHDRAWAL}
                                                max={summary.available_balance}
                                                value={data.amount}
                                                onChange={(e) => setData('amount', e.target.value)}
                                                placeholder="0,00"
                                                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm tabular-nums focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        {errors.amount && (
                                            <p className="text-red-600 text-xs mt-1">{errors.amount}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
                                        <select
                                            value={data.payment_method}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="mobile_money">Mobile Money (Orange, M-Pesa, Airtel)</option>
                                            <option value="bank_transfer">Virement bancaire</option>
                                        </select>
                                        {errors.payment_method && (
                                            <p className="text-red-600 text-xs mt-1">{errors.payment_method}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de compte</label>
                                        <input
                                            type="text"
                                            value={data.account_number}
                                            onChange={(e) => setData('account_number', e.target.value)}
                                            placeholder="Numéro de téléphone ou de compte"
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                        />
                                        {errors.account_number && (
                                            <p className="text-red-600 text-xs mt-1">{errors.account_number}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom du compte</label>
                                        <input
                                            type="text"
                                            value={data.account_name}
                                            onChange={(e) => setData('account_name', e.target.value)}
                                            placeholder="Nom du titulaire"
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                        />
                                        {errors.account_name && (
                                            <p className="text-red-600 text-xs mt-1">{errors.account_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes <span className="text-gray-400 font-normal">(facultatif)</span>
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={2}
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                            placeholder="Instructions particulières…"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition shadow-md shadow-primary-600/20 disabled:opacity-60"
                                    >
                                        {processing ? 'Envoi en cours…' : 'Soumettre la demande de retrait'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Payout History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900 text-lg">Historique des retraits</h2>
                            </div>

                            {payouts.data.length > 0 ? (
                                <>
                                    <div className="w-full overflow-x-auto scrollbar-thin">
                                        <table className="w-full text-left text-sm text-gray-600">
                                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4">Référence</th>
                                                    <th className="px-6 py-4 text-right">Montant</th>
                                                    <th className="px-6 py-4">Mode</th>
                                                    <th className="px-6 py-4">Demandé le</th>
                                                    <th className="px-6 py-4">Traité le</th>
                                                    <th className="px-6 py-4">Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {payouts.data.map((payout) => (
                                                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900">
                                                            {payout.reference || `#${payout.id}`}
                                                        </td>
                                                        <td className="px-6 py-4 text-right tabular-nums font-semibold text-gray-900">
                                                            {formatCurrencyDecimal(payout.amount)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {paymentMethodLabels[payout.payment_method] || payout.payment_method || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {formatDate(payout.requested_at || payout.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {formatDate(payout.processed_at)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[payout.status] || 'bg-gray-100 text-gray-800'}`}>
                                                                {statusLabels[payout.status] || payout.status}
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
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun retrait pour le moment</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">
                                        Lorsque vous demanderez un retrait, votre historique apparaîtra ici.
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
