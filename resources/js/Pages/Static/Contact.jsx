import React from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function Contact() {
    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input type="text" className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500" placeholder="Your name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500" placeholder="Your email address" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea className="w-full border border-gray-300 rounded-md p-2 h-32 focus:ring-primary-500" placeholder="How can we help you?"></textarea>
                        </div>
                        <button type="button" className="bg-primary-600 text-white font-bold py-2 px-6 rounded-md hover:bg-primary-700 transition-colors">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
