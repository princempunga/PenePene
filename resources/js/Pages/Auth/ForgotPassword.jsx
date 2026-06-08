import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function ForgotPassword() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Forgot Password" />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block">
                            <img src="/images/logo.png" alt="PenePene" className="h-12 w-auto object-contain mx-auto" />
                        </Link>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">Forgot your password?</h2>
                        <p className="mt-2 text-gray-500">Enter your email and we'll send you a reset link.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                        {flash?.status && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
                                {flash.status}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email Address</label>
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
                                {processing ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                ← Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
