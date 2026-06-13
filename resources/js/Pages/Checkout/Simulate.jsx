import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import useTranslation from '@/hooks/useTranslation';
import {
    CreditCard, Smartphone, Banknote, FlaskConical, Package, User, Store,
    MapPin, AlertCircle, CheckCircle2, XCircle, ArrowLeft,
} from 'lucide-react';

const METHOD_ICONS = {
    mobile_money: Smartphone,
    card: CreditCard,
    cash_on_delivery: Banknote,
    demo: FlaskConical,
};

export default function Simulate({ items, total, buyer, seller, paymentMethods }) {
    const { t } = useTranslation();
    const { errors } = usePage().props;
    const [paymentMethod, setPaymentMethod] = useState('demo');
    const [processing, setProcessing] = useState(false);

    const submitPayment = (simulationResult = null) => {
        if (processing) return;

        setProcessing(true);

        router.post('/checkout/simulate/pay', {
            payment_method: paymentMethod,
            simulation_result: simulationResult,
        }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const paymentError = errors?.payment || errors?.cart;

    return (
        <AppLayout>
            <Head title={t('checkout_sim.title')} />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link
                    href="/cart"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-6"
                >
                    <ArrowLeft size={16} />
                    {t('checkout_sim.back_to_cart')}
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t('checkout_sim.title')}</h1>
                    <p className="text-gray-600 mt-2">{t('checkout_sim.subtitle')}</p>
                </div>

                {paymentError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">{t('checkout_sim.payment_failed_title')}</p>
                            <p className="text-sm mt-1">{paymentError}</p>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        {/* Order summary */}
                        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Package size={20} />
                                {t('checkout_sim.order_summary')}
                            </h2>
                            <div className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                                            <p className="text-sm text-gray-500">{item.seller_name}</p>
                                            <p className="text-sm text-gray-500">× {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-gray-900 shrink-0">
                                            ${item.subtotal.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-100 mt-4 pt-4">
                                <span className="font-semibold text-gray-700">{t('checkout_sim.total')}</span>
                                <span className="text-xl font-bold text-primary-600">${total.toFixed(2)}</span>
                            </div>
                        </section>

                        {/* Buyer & seller info */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <User size={18} />
                                    {t('checkout_sim.buyer_info')}
                                </h3>
                                <dl className="space-y-2 text-sm">
                                    <div><dt className="text-gray-500">{t('checkout_sim.name')}</dt><dd className="font-medium">{buyer.name}</dd></div>
                                    <div><dt className="text-gray-500">{t('checkout_sim.email')}</dt><dd className="font-medium">{buyer.email}</dd></div>
                                    {buyer.phone && <div><dt className="text-gray-500">{t('checkout_sim.phone')}</dt><dd className="font-medium">{buyer.phone}</dd></div>}
                                </dl>
                            </section>

                            {seller && (
                                <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Store size={18} />
                                        {t('checkout_sim.seller_info')}
                                    </h3>
                                    <dl className="space-y-2 text-sm">
                                        <div><dt className="text-gray-500">{t('checkout_sim.store')}</dt><dd className="font-medium">{seller.business_name}</dd></div>
                                        <div><dt className="text-gray-500">{t('checkout_sim.location')}</dt><dd className="font-medium">{seller.city}, {seller.country}</dd></div>
                                    </dl>
                                </section>
                            )}
                        </div>

                        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin size={18} />
                                {t('checkout_sim.delivery_address')}
                            </h3>
                            <p className="text-sm text-gray-700">{buyer.address}</p>
                        </section>
                    </div>

                    {/* Payment methods */}
                    <div className="lg:col-span-2">
                        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('checkout_sim.payment_method')}</h2>

                            <div className="space-y-2 mb-6">
                                {paymentMethods.map((method) => {
                                    const Icon = METHOD_ICONS[method.id] || CreditCard;
                                    const isSelected = paymentMethod === method.id;

                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                                                isSelected
                                                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <Icon size={20} className={isSelected ? 'text-primary-600' : 'text-gray-500'} />
                                            <span className="font-medium text-gray-900">{t(method.label_key)}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {paymentMethod === 'demo' ? (
                                <div className="space-y-3">
                                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                                        {t('checkout_sim.demo_hint')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => submitPayment('success')}
                                        disabled={processing}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
                                    >
                                        <CheckCircle2 size={18} />
                                        {t('checkout_sim.simulate_success')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => submitPayment('failed')}
                                        disabled={processing}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-red-200 hover:border-red-400 text-red-700 font-semibold rounded-xl transition-colors disabled:opacity-60"
                                    >
                                        <XCircle size={18} />
                                        {t('checkout_sim.simulate_failed')}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => submitPayment('success')}
                                    disabled={processing}
                                    className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
                                >
                                    {processing ? t('checkout_sim.processing') : t('checkout_sim.confirm_payment')}
                                </button>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
