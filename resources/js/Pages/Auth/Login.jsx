import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Lock, Mail } from 'lucide-react';
import AuthLayout from '@/Components/Auth/AuthLayout';
import AuthInput from '@/Components/Auth/AuthInput';
import useTranslation from '@/hooks/useTranslation';

export default function Login() {
    const { flash, redirect: redirectTo, errors: pageErrors } = usePage().props;
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
        redirect: redirectTo || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login', {
            onError: (errors) => {
                console.log('Login errors:', errors);
            },
        });
    };

    return (
        <>
            <Head title={t('auth.sign_in')} />
            <AuthLayout
                title={t('auth.sign_in_title')}
                subtitle={t('auth.sign_in_subtitle')}
                headline={t('auth.sign_in_headline')}
                benefits={[
                    t('auth.sign_in_benefit_1'),
                    t('auth.sign_in_benefit_2'),
                    t('auth.sign_in_benefit_3'),
                ]}
                footer={
                    <p className="text-sm text-gray-500">
                        {t('auth.no_account')}{' '}
                        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                            {t('auth.create_one')}
                        </Link>
                    </p>
                }
            >
                {(flash?.error || pageErrors?.email) && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200/80 text-red-800 rounded-xl text-sm font-medium">
                        {flash?.error || pageErrors?.email || 'Une erreur est survenue'}
                    </div>
                )}

                {flash?.status && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200/80 text-emerald-800 rounded-xl text-sm font-medium">
                        {flash.status}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <AuthInput
                        id="email"
                        label={t('auth.email')}
                        type="email"
                        icon={Mail}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        placeholder={t('auth.email_placeholder')}
                        required
                    />

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-semibold text-gray-900">{t('auth.password')}</span>
                            <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                {t('auth.forgot_password')}
                            </Link>
                        </div>
                        <AuthInput
                            id="password"
                            label=""
                            type="password"
                            icon={Lock}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            placeholder={t('auth.password_placeholder')}
                            required
                        />
                    </div>

                    <div className="flex items-center pt-1">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="remember" className="ml-2.5 block text-sm text-gray-600">
                            {t('auth.remember_me')}
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-70 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 mt-2"
                    >
                        {processing ? t('auth.signing_in') : t('auth.sign_in')}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-gray-400">
                    {t('auth.secure_note')}
                </p>
            </AuthLayout>
        </>
    );
}
