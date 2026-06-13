import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowRight, Check, X } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

const DEFAULT_PLANS = [
    {
        id: 'free',
        name: 'Free',
        slug: 'free',
        description: 'Get started selling on PenePene at no cost.',
        price: 0,
        currency: 'TZS',
        billing_cycle: 'monthly',
        is_featured: false,
        features: ['Up to 10 products', 'Basic analytics', 'Standard support', 'Buyer messaging'],
    },
    {
        id: 'standard',
        name: 'Standard',
        slug: 'standard',
        description: 'For growing sellers who need more exposure.',
        price: 29900,
        currency: 'TZS',
        billing_cycle: 'monthly',
        is_featured: true,
        features: ['Up to 100 products', 'Advanced analytics', 'Priority support', '1 sponsored slot', 'Order management'],
    },
    {
        id: 'premium',
        name: 'Premium',
        slug: 'premium',
        description: 'The ultimate plan for serious sellers.',
        price: 79900,
        currency: 'TZS',
        billing_cycle: 'monthly',
        is_featured: false,
        features: ['Unlimited products', 'Full analytics & reports', 'Dedicated support', '5 sponsored slots', 'Featured store badge', 'Homepage placement'],
    },
];

const COMPARISON_ROWS = [
    { feature: 'Active products', free: '10', standard: '100', premium: 'Unlimited' },
    { feature: 'Order management', free: true, standard: true, premium: true },
    { feature: 'Buyer messaging', free: true, standard: true, premium: true },
    { feature: 'Basic analytics', free: true, standard: true, premium: true },
    { feature: 'Advanced analytics', free: false, standard: true, premium: true },
    { feature: 'Sales reports (PDF/Excel)', free: false, standard: false, premium: true },
    { feature: 'Sponsored product slots', free: '0', standard: '1', premium: '5' },
    { feature: 'Featured store badge', free: false, standard: false, premium: true },
    { feature: 'Priority support', free: false, standard: true, premium: true },
];

function CellValue({ value }) {
    if (value === true) return <Check size={20} className="text-green-500 mx-auto" />;
    if (value === false) return <X size={20} className="text-gray-300 mx-auto" />;
    return <span className="text-gray-700 font-medium">{value}</span>;
}

export default function Pricing({ plans = [] }) {
    const { t } = useTranslation();
    const displayPlans = plans.length > 0 ? plans : DEFAULT_PLANS;

    return (
        <AppLayout>
            <Head title={t('static.pricing')} />

            <div className="bg-primary-900 py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-6">{t('pricing_page.title')}</h1>
                    <p className="text-xl text-primary-100">
                        {t('pricing_page.subtitle')}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16 -mt-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {displayPlans.slice(0, 3).map((plan) => (
                        <div
                            key={plan.id ?? plan.slug}
                            className={`bg-white rounded-2xl shadow-lg border-2 ${plan.is_featured ? 'border-primary-500 transform md:-translate-y-4' : 'border-gray-100'} overflow-hidden flex flex-col`}
                        >
                            {plan.is_featured && (
                                <div className="bg-primary-500 text-white text-center py-2 text-sm font-bold uppercase tracking-wider">
                                    {t('pricing_page.most_popular')}
                                </div>
                            )}

                            <div className="p-8 pb-0">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-gray-500 h-12">{plan.description}</p>

                                <div className="my-6">
                                    <span className="text-4xl font-extrabold text-gray-900">
                                        {parseFloat(plan.price) === 0 ? t('pricing_page.free') : `${plan.currency} ${parseFloat(plan.price).toLocaleString()}`}
                                    </span>
                                    {parseFloat(plan.price) > 0 && (
                                        <span className="text-gray-500 ml-2">/{plan.billing_cycle}</span>
                                    )}
                                </div>

                                <Link
                                    href="/seller/register"
                                    className={`block w-full py-3 px-4 rounded-md text-center font-bold transition-colors ${
                                        plan.is_featured
                                            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md'
                                            : 'bg-primary-50 hover:bg-primary-100 text-primary-700'
                                    }`}
                                >
                                    {t('nav.start_selling')}
                                </Link>
                            </div>

                            <div className="p-8 pt-6 flex-1 bg-gray-50 mt-8 border-t border-gray-100">
                                <h4 className="font-semibold text-gray-900 mb-4 tracking-wide uppercase text-sm">{t('pricing_page.whats_included')}</h4>
                                <ul className="space-y-4">
                                    {(plan.features ?? []).map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className="text-green-500 shrink-0 mt-0.5" size={18} />
                                            <span className="text-gray-600 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 pb-16">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{t('pricing_page.compare_plans')}</h2>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-6 py-4 font-semibold text-gray-900">{t('pricing_page.feature')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-center">{t('pricing_page.free')}</th>
                                <th className="px-6 py-4 font-semibold text-primary-700 text-center">{t('pricing_page.standard')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-center">{t('pricing_page.premium')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARISON_ROWS.map((row, i) => (
                                <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    <td className="px-6 py-4 text-gray-700 font-medium">{row.feature}</td>
                                    <td className="px-6 py-4 text-center"><CellValue value={row.free} /></td>
                                    <td className="px-6 py-4 text-center bg-primary-50/30"><CellValue value={row.standard} /></td>
                                    <td className="px-6 py-4 text-center"><CellValue value={row.premium} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('home.seller_banner_title')}</h2>
                <p className="text-gray-600 mb-8">
                    {t('home.seller_banner_desc')}
                </p>
                <Link
                    href="/seller/register"
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg"
                >
                    {t('nav.start_selling')}
                    <ArrowRight size={18} />
                </Link>
            </div>
        </AppLayout>
    );
}
