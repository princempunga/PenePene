import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { formatCurrency } from '@/lib/formatCurrency';
import SellerLayout from '@/Layouts/SellerLayout';
import { Check, Star, Shield, ArrowRight, ArrowUp, ArrowDown, AlertCircle, CreditCard } from 'lucide-react';

const formatPrice = (amount) => formatCurrency(amount);

const ACTION_LABELS = {
    current: 'Plan actuel',
    get_started: 'Commencer',
    subscribe: 'S\'abonner',
    upgrade: 'Mettre à niveau',
    downgrade: 'Rétrograder',
    switch: 'Changer de plan',
};

const STATUS_LABELS = {
    active: 'Actif',
    expired: 'Expiré',
    cancelled: 'Annulé',
};

const BILLING_STATUS_LABELS = {
    active: 'ACTIF',
    warning: 'EXPIRATION',
    expired: 'EXPIRÉ',
    none: 'AUCUN',
};

function FlashAlert({ flash }) {
    if (!flash?.success && !flash?.error) return null;

    const isError = !!flash?.error;
    return (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
            isError
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-green-50 border-green-200 text-green-800'
        }`}>
            {flash.success || flash.error}
        </div>
    );
}

function parseFeatures(plan) {
    if (Array.isArray(plan.features)) return plan.features;
    if (typeof plan.features === 'string') {
        try {
            return JSON.parse(plan.features);
        } catch {
            return [];
        }
    }
    return [];
}

function resolvePlanAction(plan, currentPlan, isCurrent) {
    if (isCurrent) return 'current';
    if (!currentPlan) return plan.price == 0 ? 'get_started' : 'subscribe';

    if (plan.sort_order > currentPlan.sort_order || plan.price > currentPlan.price) {
        return 'upgrade';
    }
    if (plan.sort_order < currentPlan.sort_order || plan.price < currentPlan.price) {
        return 'downgrade';
    }
    return 'switch';
}

function planActionIcon(action) {
    if (action === 'upgrade') return <ArrowUp size={18} />;
    if (action === 'downgrade') return <ArrowDown size={18} />;
    if (action === 'current') return null;
    return <ArrowRight size={18} />;
}

const billingStatusStyles = {
    active: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    expired: 'bg-red-100 text-red-800 border-red-200',
    none: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function SubscriptionsIndex({ seller, plans, history, currentPlan, billingStatus }) {
    const { flash } = usePage().props;
    const { post, processing } = useForm();

    const activeSub = seller.active_subscription;

    const subscribe = (plan) => {
        const action = resolvePlanAction(plan, currentPlan, activeSub?.subscription_plan_id === plan.id);
        const message = action === 'downgrade'
            ? `Passer au plan ${plan.name} ? Votre plan actuel sera remplacé immédiatement.`
            : `S'abonner au plan ${plan.name} ? Cela remplacera votre plan actif.`;

        if (confirm(message)) {
            post(`/seller/subscriptions/${plan.slug}/subscribe`, { preserveScroll: true });
        }
    };

    return (
        <SellerLayout>
            <Head title="Plans d'abonnement" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gérer l&apos;abonnement</h1>
                    <p className="text-gray-500 mt-1">Améliorez votre plan pour débloquer plus de fonctionnalités et booster vos ventes.</p>
                </div>
                <Link
                    href="/seller/profile"
                    className="text-sm font-medium text-primary-600 hover:underline"
                >
                    ← Retour au profil
                </Link>
            </div>

            <FlashAlert flash={flash} />

            {/* Billing Status */}
            <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-wrap items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                    <CreditCard size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">Statut de facturation</p>
                    <p className="font-semibold text-gray-900">{billingStatus.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{billingStatus.detail}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${billingStatusStyles[billingStatus.status] || billingStatusStyles.none}`}>
                    {BILLING_STATUS_LABELS[billingStatus.status] || billingStatus.status.toUpperCase()}
                </span>
            </div>

            {/* Current Plan */}
            {activeSub ? (
                <div className="mb-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white shadow-md flex items-center justify-between">
                    <div>
                        <p className="text-primary-100 text-sm font-medium mb-1">Plan actif</p>
                        <h2 className="text-2xl font-bold">{activeSub.plan.name}</h2>
                        <p className="text-sm mt-1 opacity-90">
                            {activeSub.amount_paid > 0
                                ? `${formatPrice(activeSub.amount_paid)} · `
                                : ''}
                            Expire le {new Date(activeSub.expires_at).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                    <div className="hidden md:flex w-16 h-16 bg-white/20 rounded-full items-center justify-center backdrop-blur-sm">
                        <Shield size={32} className="text-white" />
                    </div>
                </div>
            ) : (
                <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-amber-900">Aucun abonnement actif</p>
                        <p className="text-sm text-amber-700 mt-1">Choisissez un plan ci-dessous pour accéder aux fonctionnalités vendeur.</p>
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {plans.map(plan => {
                    const features = parseFeatures(plan);
                    const isCurrent = activeSub?.subscription_plan_id === plan.id;
                    const action = resolvePlanAction(plan, currentPlan, isCurrent);
                    const actionLabel = ACTION_LABELS[action];
                    const isUpgrade = action === 'upgrade';
                    const isDowngrade = action === 'downgrade';

                    return (
                        <div
                            key={plan.id}
                            className={`bg-white rounded-2xl border ${
                                plan.is_featured
                                    ? 'border-primary-500 shadow-xl shadow-primary-500/10 relative'
                                    : 'border-gray-200 shadow-sm'
                            } p-6 flex flex-col`}
                        >
                            {plan.is_featured && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                                    <Star size={12} className="fill-white" /> Recommandé
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                <p className="text-sm text-gray-500 mt-2 min-h-[40px]">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-3xl font-extrabold text-gray-900">
                                    {plan.price == 0 ? 'Gratuit' : formatPrice(plan.price)}
                                </span>
                                {plan.price > 0 && (
                                    <span className="text-gray-500 font-medium">
                                        /{plan.billing_cycle === 'monthly' ? 'mois' : 'an'}
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={12} className="text-green-600" />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => subscribe(plan)}
                                disabled={processing || isCurrent}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                                    isCurrent
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : isUpgrade
                                            ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20'
                                            : isDowngrade
                                                ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                : plan.is_featured
                                                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                                                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                                }`}
                            >
                                {actionLabel}
                                {planActionIcon(action)}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* History */}
            {history.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 text-lg">Historique de facturation</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Montant</th>
                                    <th className="px-6 py-4">Période</th>
                                    <th className="px-6 py-4">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{sub.plan.name}</td>
                                        <td className="px-6 py-4">
                                            {sub.amount_paid == 0
                                                ? 'Gratuit'
                                                : formatPrice(sub.amount_paid)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(sub.starts_at).toLocaleDateString('fr-FR')} – {new Date(sub.expires_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                sub.status === 'active' ? 'bg-green-100 text-green-800' :
                                                sub.status === 'expired' ? 'bg-amber-100 text-amber-800' :
                                                sub.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {STATUS_LABELS[sub.status] || sub.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
}
