import React from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function Privacy() {
    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                <div className="prose max-w-none text-gray-600 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">1. Data Collection</h2>
                    <p>We collect information you provide directly to us when you create an account, make a purchase, or communicate with us.</p>
                    
                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">2. Use of Information</h2>
                    <p>We use the information we collect to operate, maintain, and improve our services, process transactions, and communicate with you.</p>
                    
                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">3. Data Sharing</h2>
                    <p>We share necessary information with sellers to facilitate transactions. We do not sell your personal data to third parties.</p>
                </div>
            </div>
        </AppLayout>
    );
}
