import React from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function About() {
    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">About PenePene</h1>
                <div className="prose max-w-none text-gray-600">
                    <p>
                        PenePene is a trusted local marketplace connecting buyers and sellers in Tanzania. 
                        Our platform empowers local businesses to reach a wider audience while providing 
                        customers with a convenient way to shop for products they love.
                    </p>
                    <p className="mt-4">
                        Founded with a mission to digitalize local commerce, we strive to offer the best 
                        tools for sellers to manage their inventory and interact with buyers seamlessly.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
