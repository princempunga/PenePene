import React from 'react';
import useTranslation from '@/hooks/useTranslation';
import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';
import { TrendingUp, Store, Users, ShieldCheck } from 'lucide-react';

export default function BecomeSeller() {
    const { t } = useTranslation();
    return (
        <AppLayout>
            {/* Hero Section */}
            <div className="bg-primary-900 pt-20 pb-24 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                        Turn Your Business Into A Success Story
                    </h1>
                    <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
                        Reach thousands of active buyers daily, manage your shop easily from anywhere, and watch your sales grow on PenePene.
                    </p>
                    <Link href="/register" className="inline-block bg-white text-primary-700 font-bold text-lg py-4 px-10 rounded-md shadow-lg hover:bg-gray-50 transition-colors">
                        Register Your Business Now
                    </Link>
                </div>
            </div>

            {/* Benefits */}
            <div className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Sell on PenePene?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">We provide all the tools you need to build, manage, and grow a successful online business.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Huge Audience</h3>
                            <p className="text-gray-600">Access thousands of daily visitors actively looking for products like yours.</p>
                        </div>
                        
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Store size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Digital Storefront</h3>
                            <p className="text-gray-600">Get a professional, customizable storefront to showcase your brand and products.</p>
                        </div>
                        
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <TrendingUp size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Powerful Analytics</h3>
                            <p className="text-gray-600">Track your sales, analyze market trends, and make data-driven decisions.</p>
                        </div>
                        
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Platform</h3>
                            <p className="text-gray-600">Benefit from our secure infrastructure and seller protection policies.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Start selling in four simple steps.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting line for desktop */}
                        <div className="hidden md:block absolute top-8 left-12 right-12 h-0.5 bg-gray-200 z-0"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary-600 text-white font-bold text-2xl rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-white">1</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Register</h3>
                            <p className="text-gray-600 text-sm">Create an account and provide your business details for verification.</p>
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary-600 text-white font-bold text-2xl rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-white">2</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Setup Store</h3>
                            <p className="text-gray-600 text-sm">Customize your store profile, add a logo, banner, and description.</p>
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary-600 text-white font-bold text-2xl rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-white">3</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">List Products</h3>
                            <p className="text-gray-600 text-sm">Upload clear photos, write compelling descriptions, and set your prices.</p>
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary-600 text-white font-bold text-2xl rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-white">4</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('nav.start_selling')}</h3>
                            <p className="text-gray-600 text-sm">Receive orders, manage communications, and ship your products.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="py-20 bg-gray-900 text-center px-4">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to grow your business?</h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-md transition-colors">
                        Register Now
                    </Link>
                    <Link href="/pricing" className="bg-transparent border border-gray-600 hover:border-gray-400 hover:text-white text-gray-300 font-bold py-3 px-8 rounded-md transition-colors">
                        View Pricing Plans
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
