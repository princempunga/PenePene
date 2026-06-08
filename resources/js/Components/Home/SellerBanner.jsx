import React from 'react';
import { Link } from '@inertiajs/react';

export default function SellerBanner() {
    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-primary-900 rounded-2xl overflow-hidden relative shadow-xl">
                    <div className="absolute inset-0">
                        <img 
                            src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                            alt="Seller background" 
                            className="w-full h-full object-cover opacity-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-900/90 to-primary-900/40"></div>
                    </div>
                    
                    <div className="relative p-8 md:p-12 lg:p-16 max-w-2xl">
                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                            Grow Your Business
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Start Selling on PenePene Today
                        </h2>
                        <p className="text-primary-100 text-lg mb-8">
                            Reach thousands of local buyers, manage your inventory easily, and grow your sales. Join our community of successful sellers.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/become-a-seller" className="bg-white text-primary-700 font-bold py-3 px-8 rounded-md hover:bg-gray-50 transition-colors text-center shadow-sm">
                                Register as a Seller
                            </Link>
                            <Link href="/pricing" className="bg-primary-800 text-white border border-primary-700 font-medium py-3 px-8 rounded-md hover:bg-primary-700 transition-colors text-center">
                                View Pricing Plans
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
