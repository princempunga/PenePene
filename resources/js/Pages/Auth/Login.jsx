import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Login() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Sign In" />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="text-3xl font-extrabold text-primary-600">PenePene</Link>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">Welcome back</h2>
                        <p className="mt-2 text-gray-500">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-primary-600 font-medium hover:text-primary-700">Create one free</Link>
                        </p>
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
                                    autoComplete="email"
                                    required
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                                    <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">Forgot password?</Link>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                    placeholder="Your password"
                                    required
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="text-sm text-gray-700">Remember me</label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                            >
                                {processing ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center mt-6 text-sm text-gray-500">
                        Want to sell on PenePene?{' '}
                        <Link href="/become-a-seller" className="text-primary-600 font-medium">Become a Seller</Link>
                    </p>
                </div>
            </div>
        </>
    );
}
