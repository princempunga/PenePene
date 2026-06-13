import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Logo from '@/Components/Brand/Logo';
import useTranslation from '@/hooks/useTranslation';

export default function ForgotPassword() {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title={t('auth.forgot_password_title')} />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex justify-center">
                            <Logo className="h-16 w-auto max-w-[220px]" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">{t('auth_ext.forgot_title')}</h2>
                        <p className="mt-2 text-gray-500">{t('auth_ext.forgot_desc')}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                        {flash?.status && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
                                {flash.status}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">{t('auth.email')}</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                    placeholder="you@example.com"
                                    required
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <button type="submit" disabled={processing} className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors">
                                {processing ? t('auth_ext.sending') : t('auth.send_reset_link')}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                {t('auth_ext.back_to_sign_in')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
