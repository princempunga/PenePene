import React from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function Terms() {
    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
                <div className="prose max-w-none text-gray-600 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">1. Introduction</h2>
                    <p>Welcome to PenePene Marketplace. By accessing our platform, you agree to these terms.</p>
                    
                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">2. Seller Responsibilities</h2>
                    <p>Sellers are responsible for the accuracy of their product listings and must fulfill orders in a timely manner.</p>
                    
                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">3. Buyer Responsibilities</h2>
                    <p>Buyers must provide accurate shipping information and complete payments for ordered items.</p>
                </div>
            </div>
        </AppLayout>
    );
}
