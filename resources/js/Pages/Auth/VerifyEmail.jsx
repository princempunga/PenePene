import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';

export default function VerifyEmail() {
    const { auth, flash } = usePage().props;
    const { post, processing } = useForm({});

    const resend = (e) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <>
            <Head title="Verify Email" />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md text-center">
                    <Link href="/" className="inline-block">
                        <img src="/images/logo.png" alt="PenePene" className="h-12 w-auto object-contain mx-auto" />
                    </Link>

                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mt-8">
                        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <MailCheck size={32} className="text-primary-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Verify your email</h2>
                        <p className="text-gray-500 mb-6">
                            We sent a verification link to <strong className="text-gray-800">{auth.user?.email}</strong>.
                            Please check your inbox and click the link to verify your account.
                        </p>

                        {flash?.status === 'verification-link-sent' && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                                A new verification link has been sent to your email!
                            </div>
                        )}

                        <form onSubmit={resend}>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                            >
                                {processing ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                        </form>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="mt-4 text-sm text-gray-500 hover:text-gray-700 block"
                        >
                            Sign out of this account
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
