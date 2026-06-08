import React from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function FAQ() {
    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
                
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">How do I buy a product?</h3>
                        <p className="text-gray-600">You can browse our categories or search for a specific product. Once you find what you need, contact the seller directly or add the item to your cart to proceed with the purchase.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">How do I become a seller?</h3>
                        <p className="text-gray-600">Click on "Sell on PenePene" in the navigation menu, choose a pricing plan that fits your business, and fill out the registration form. Our team will verify your account shortly.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Is it safe to buy on PenePene?</h3>
                        <p className="text-gray-600">We verify all our sellers and monitor transactions to ensure a safe shopping experience. We recommend reading seller reviews before making a purchase.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
