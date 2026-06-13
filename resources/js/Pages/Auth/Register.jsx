import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, Phone, User } from 'lucide-react';
import AuthLayout from '@/Components/Auth/AuthLayout';
import AuthInput from '@/Components/Auth/AuthInput';
import useTranslation from '@/hooks/useTranslation';

export default function Register() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/buyer/register');
    };

    return (
        <>
            <Head title={t('auth.create_buyer_account_title')} />
            <AuthLayout
                accent="blue"
                title={t('auth.buyer_register_title')}
                subtitle={t('auth.buyer_register_subtitle')}
                headline={t('auth.buyer_register_headline')}
                benefits={[
                    t('auth.buyer_register_benefit_1'),
                    t('auth.buyer_register_benefit_2'),
                    t('auth.buyer_register_benefit_3'),
                ]}
                footer={
                    <p className="text-center text-sm text-gray-500">
                        {t('auth.already_have_account')}{' '}
                        <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                            {t('auth.sign_in_here')}
                        </Link>
                    </p>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <AuthInput
                        id="name"
                        label={t('auth.full_name')}
                        type="text"
                        icon={User}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder={t('auth.name_placeholder')}
                        autoComplete="name"
                        required
                    />

                    <AuthInput
                        id="email"
                        label={t('auth.email')}
                        type="email"
                        icon={Mail}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />

                    <AuthInput
                        id="phone"
                        label={t('auth.phone_number')}
                        type="tel"
                        icon={Phone}
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        error={errors.phone}
                        placeholder={t('auth.phone_placeholder')}
                        autoComplete="tel"
                    />

                    <AuthInput
                        id="password"
                        label={t('auth.password')}
                        type="password"
                        icon={Lock}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        placeholder={t('auth.min_password_placeholder')}
                        autoComplete="new-password"
                        required
                    />

                    <AuthInput
                        id="password_confirmation"
                        label={t('auth.confirm_password')}
                        type="password"
                        icon={Lock}
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder={t('auth.confirm_password_placeholder')}
                        autoComplete="new-password"
                        required
                    />

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-70 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 mt-4"
                    >
                        {processing ? t('auth.creating_account') : t('auth.create_buyer_account')}
                    </button>

                    <p className="text-xs text-center text-gray-500 leading-relaxed pt-2">
                        {t('auth.agree_terms_prefix')}{' '}
                        <Link href="/terms" className="text-blue-600 hover:underline">{t('auth.terms_of_service')}</Link>
                        {' '}{t('auth.and_conjunction')}{' '}
                        <Link href="/privacy" className="text-blue-600 hover:underline">{t('auth.privacy_policy')}</Link>.
                    </p>
                </form>
            </AuthLayout>
        </>
    );
}
