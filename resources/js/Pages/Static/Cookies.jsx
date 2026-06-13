import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Cookies() {
    return (
        <AppLayout>
            <Head title="Cookie Policy" />

            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
                <div className="prose max-w-none text-gray-600 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">1. What Are Cookies</h2>
                    <p>
                        Cookies are small text files stored on your device when you visit PenePene.
                        They help us remember your preferences, keep you signed in, and improve your experience.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">2. Cookies We Use</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Essential cookies</strong> — required for login, cart, and security.</li>
                        <li><strong>Preference cookies</strong> — remember language and display settings.</li>
                        <li><strong>Analytics cookies</strong> — help us understand how the marketplace is used.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">3. Managing Cookies</h2>
                    <p>
                        You can control or delete cookies through your browser settings. Disabling essential cookies
                        may affect account login and checkout functionality.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">4. Contact</h2>
                    <p>
                        Questions about this policy? Email us at support@penepene.com.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
