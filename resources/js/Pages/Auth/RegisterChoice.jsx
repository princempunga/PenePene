import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShoppingBag, Store, ArrowRight } from 'lucide-react';
import Logo from '@/Components/Brand/Logo';
import useTranslation from '@/hooks/useTranslation';

export default function RegisterChoice() {
    const { t } = useTranslation();

    const buyerBenefits = [
        t('auth.buyer_benefit_1'),
        t('auth.buyer_benefit_2'),
        t('auth.buyer_benefit_3'),
    ];

    const sellerBenefits = [
        t('auth.seller_benefit_1'),
        t('auth.seller_benefit_2'),
        t('auth.seller_benefit_3'),
    ];

    return (
        <>
            <Head title={t('auth.choose_account_type')} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <Logo className="h-20 sm:h-24 w-auto max-w-[260px]" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{t('auth.join_pene_pene')}</h1>
                    <p className="mt-3 text-lg text-gray-600 max-w-lg mx-auto">
                        {t('auth.choose_how')}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
                    <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] hover:shadow-xl border border-gray-100 p-8 transition-all duration-300 flex flex-col justify-between group">
                        <div>
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                                <ShoppingBag size={28} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.buyer')}</h2>
                            <p className="text-gray-500 text-sm mb-6">{t('auth.buyer_signup_desc')}</p>
                            <ul className="space-y-3 text-gray-600">
                                {buyerBenefits.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link
                            href="/buyer/register"
                            className="mt-8 w-full inline-flex justify-center items-center gap-2 px-6 py-3.5 text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-600/25"
                        >
                            {t('auth.continue_as_buyer')}
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] hover:shadow-xl border border-amber-100 p-8 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
                                <Store size={28} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.seller')}</h2>
                            <p className="text-gray-500 text-sm mb-6">{t('auth.seller_signup_desc')}</p>
                            <ul className="space-y-3 text-gray-600">
                                {sellerBenefits.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link
                            href="/seller/register"
                            className="relative mt-8 w-full inline-flex justify-center items-center gap-2 px-6 py-3.5 text-base font-bold rounded-xl text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg shadow-amber-600/25"
                        >
                            {t('auth.continue_as_seller')}
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                <p className="text-center mt-12 text-gray-500">
                    {t('auth.already_have_account')}{' '}
                    <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                        {t('auth.sign_in')}
                    </Link>
                </p>
            </div>
        </>
    );
}
