import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowRight, Newspaper } from 'lucide-react';

export default function Blog() {
    return (
        <AppLayout>
            <Head title="Marketplace Blog" />

            <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
                <div className="max-w-2xl w-full text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-wider">
                        Coming Soon
                    </div>

                    <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Newspaper size={36} className="text-amber-600" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        PenePene Marketplace Blog
                    </h1>

                    <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-xl mx-auto">
                        Stories, seller spotlights, marketplace updates, and shopping guides are on the way.
                        Check back soon for the latest from the PenePene team.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg"
                    >
                        Explore Marketplace
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
