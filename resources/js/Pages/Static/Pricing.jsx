import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Check, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Pricing({ plans }) {
    return (
        <AppLayout>
            <div className="bg-primary-900 py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-6">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-primary-100">
                        Choose the right plan to grow your business on PenePene Marketplace. No hidden fees.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16 -mt-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <div 
                            key={plan.id} 
                            className={`bg-white rounded-2xl shadow-lg border-2 ${plan.is_featured ? 'border-primary-500 transform md:-translate-y-4' : 'border-gray-100'} overflow-hidden flex flex-col`}
                        >
                            {plan.is_featured && (
                                <div className="bg-primary-500 text-white text-center py-2 text-sm font-bold uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}
                            
                            <div className="p-8 pb-0">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-gray-500 h-12">{plan.description}</p>
                                
                                <div className="my-6">
                                    <span className="text-4xl font-extrabold text-gray-900">
                                        {plan.currency} {parseFloat(plan.price).toLocaleString()}
                                    </span>
                                    <span className="text-gray-500 ml-2">/{plan.billing_cycle}</span>
                                </div>
                                
                                <Link 
                                    href="/register" 
                                    className={`block w-full py-3 px-4 rounded-md text-center font-bold transition-colors ${
                                        plan.is_featured 
                                            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md' 
                                            : 'bg-primary-50 hover:bg-primary-100 text-primary-700'
                                    }`}
                                >
                                    Get Started
                                </Link>
                            </div>
                            
                            <div className="p-8 pt-6 flex-1 bg-gray-50 mt-8 border-t border-gray-100">
                                <h4 className="font-semibold text-gray-900 mb-4 tracking-wide uppercase text-sm">What's included</h4>
                                <ul className="space-y-4">
                                    {plan.features.map((feature, i) => (
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
            
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Have questions?</h2>
                <p className="text-gray-600 mb-6">If you need help choosing the right plan for your business, contact our support team.</p>
                <Link href="/contact" className="inline-flex font-medium text-primary-600 hover:text-primary-700">
                    Contact Support &rarr;
                </Link>
            </div>
        </AppLayout>
    );
}
