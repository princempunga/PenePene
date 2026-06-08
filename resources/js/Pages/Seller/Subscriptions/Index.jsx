import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Check, Star, Shield, ArrowRight } from 'lucide-react';

export default function SubscriptionsIndex({ seller, plans, history }) {
    const { flash } = usePage().props;
    const { post, processing } = useForm();

    const subscribe = (planId) => {
        if (confirm('Are you sure you want to subscribe to this plan? This will replace your current active plan.')) {
            post(`/seller/subscriptions/${planId}/subscribe`);
        }
    };

    const activeSub = seller.active_subscription;

    return (
        <SellerLayout>
            <Head title="Subscription Plans" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Subscription</h1>
                <p className="text-gray-500 mt-1">Upgrade your plan to unlock more features and boost your sales.</p>
            </div>

            {flash?.success && (
                <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                    {flash.success}
                </div>
            )}

            {/* Current Plan Alert */}
            {activeSub && (
                <div className="mb-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white shadow-md flex items-center justify-between">
                    <div>
                        <p className="text-primary-100 text-sm font-medium mb-1">Current Active Plan</p>
                        <h2 className="text-2xl font-bold">{activeSub.plan.name}</h2>
                        <p className="text-sm mt-1 opacity-90">
                            Expires on {new Date(activeSub.expires_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="hidden md:block w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Shield size={32} className="text-white" />
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {plans.map(plan => {
                    const features = JSON.parse(plan.features || '[]');
                    const isCurrent = activeSub && activeSub.subscription_plan_id === plan.id;

                    return (
                        <div key={plan.id} className={`bg-white rounded-2xl border ${plan.is_featured ? 'border-primary-500 shadow-xl shadow-primary-500/10 relative' : 'border-gray-200 shadow-sm'} p-6 flex flex-col`}>
                            {plan.is_featured && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                                    <Star size={12} className="fill-white" /> Recommended
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                <p className="text-sm text-gray-500 mt-2 h-10">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-3xl font-extrabold text-gray-900">
                                    {plan.price == 0 ? 'Free' : `TZS ${parseFloat(plan.price).toLocaleString()}`}
                                </span>
                                {plan.price > 0 && <span className="text-gray-500 font-medium">/{plan.billing_cycle === 'monthly' ? 'mo' : 'yr'}</span>}
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
                                onClick={() => subscribe(plan.id)}
                                disabled={processing || isCurrent}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                                    isCurrent
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : plan.is_featured
                                            ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20'
                                            : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                                }`}
                            >
                                {isCurrent ? 'Current Plan' : (plan.price == 0 ? 'Get Started' : 'Subscribe Now')}
                                {!isCurrent && <ArrowRight size={18} />}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* History */}
            {history.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 text-lg">Billing History</h2>
                    </div>
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Period</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{sub.plan.name}</td>
                                    <td className="px-6 py-4">{sub.currency} {parseFloat(sub.amount_paid).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        {new Date(sub.starts_at).toLocaleDateString()} to {new Date(sub.expires_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            sub.status === 'active' ? 'bg-green-100 text-green-800' :
                                            sub.status === 'expired' ? 'bg-amber-100 text-amber-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {sub.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </SellerLayout>
    );
}
