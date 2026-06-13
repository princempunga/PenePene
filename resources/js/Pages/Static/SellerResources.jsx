import React, { useState } from 'react';
import useTranslation from '@/hooks/useTranslation';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowRight, BookOpen, ChevronDown, ChevronUp, Eye, Megaphone,
    Package, ShoppingBag, Store, TrendingUp,
} from 'lucide-react';

const guides = [
    {
        icon: Store,
        color: 'bg-amber-500',
        title: 'Seller Guide',
        description: 'Everything you need to launch and run a successful store on PenePene.',
        steps: [
            'Create your seller account and complete business verification.',
            'Set up your store profile with logo, cover image, and contact details.',
            'Choose a subscription plan that matches your business size.',
            'Publish your first products and start receiving buyer messages.',
        ],
    },
    {
        icon: Package,
        color: 'bg-blue-500',
        title: 'How to Publish Products',
        description: 'Create listings that attract buyers and convert into sales.',
        steps: [
            'Go to Seller Dashboard → Products → Add Product.',
            'Write a clear title, detailed description, and accurate pricing.',
            'Upload high-quality photos from multiple angles.',
            'Select the right category and set stock quantity before publishing.',
        ],
    },
    {
        icon: ShoppingBag,
        color: 'bg-green-500',
        title: 'How to Manage Orders',
        description: 'Stay on top of every order from confirmation to delivery.',
        steps: [
            'Check new orders daily in Seller Dashboard → Orders.',
            'Confirm orders promptly and update status as they progress.',
            'Message buyers directly for delivery coordination.',
            'Mark orders as completed once the buyer receives their item.',
        ],
    },
    {
        icon: TrendingUp,
        color: 'bg-purple-500',
        title: 'How to Improve Visibility',
        description: 'Get more eyes on your products and grow your customer base.',
        steps: [
            'Use clear product titles with keywords buyers search for.',
            'Keep your store profile complete and professional.',
            'Respond quickly to buyer messages to build trust.',
            'Upgrade your plan or use sponsored products for premium placement.',
        ],
    },
    {
        icon: Megaphone,
        color: 'bg-orange-500',
        title: 'How Sponsored Products Work',
        description: 'Boost specific listings to appear in premium marketplace positions.',
        steps: [
            'Available on Standard and Premium seller plans.',
            'Select a product in Seller Dashboard → Sponsored Products.',
            'Choose your campaign duration and budget.',
            'Sponsored items appear in homepage and category featured sections.',
        ],
    },
];

const faqs = [
    {
        q: 'How long does seller verification take?',
        a: 'Most seller accounts are reviewed within 24–48 hours. You will receive an email once your store is approved.',
    },
    {
        q: 'Can I sell in multiple categories?',
        a: 'Yes. You can list products across any category that matches your inventory. Choose the most relevant category per product for better discoverability.',
    },
    {
        q: 'What fees does PenePene charge?',
        a: 'Subscription plans vary by tier. Visit our Pricing page for current plan details. Commission rates are shown in your seller dashboard.',
    },
    {
        q: 'How do I upgrade my seller plan?',
        a: 'Go to Seller Dashboard → Subscriptions, compare plans, and subscribe to the tier that fits your growth goals.',
    },
    {
        q: 'What happens if a buyer reports my listing?',
        a: 'Our moderation team reviews reports within 24 hours. Listings that violate platform rules may be paused until the issue is resolved.',
    },
    {
        q: 'Can I edit a product after it is published?',
        a: 'Yes. Open the product in your dashboard, update details or images, and save. Major changes may require a quick moderation review.',
    },
];

function FaqItem({ item, isOpen, onToggle }) {
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors"
            >
                <span className="font-semibold text-gray-900">{item.q}</span>
                {isOpen ? <ChevronUp size={20} className="text-gray-400 shrink-0" /> : <ChevronDown size={20} className="text-gray-400 shrink-0" />}
            </button>
            {isOpen && (
                <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {item.a}
                </div>
            )}
        </div>
    );
}

export default function SellerResources() {
    const { t } = useTranslation();
    const [openFaq, setOpenFaq] = useState(0);

    return (
        <AppLayout>
            <Head title="Seller Resources" />

            <div className="bg-gray-900 py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                        <BookOpen size={16} />
                        Seller Resources
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                        Grow Your Business on PenePene
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Guides, best practices, and answers to help you sell smarter — from your first listing to scaling your store.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {guides.map((guide) => (
                        <div key={guide.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 ${guide.color} rounded-xl flex items-center justify-center mb-5`}>
                                <guide.icon size={22} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{guide.title}</h2>
                            <p className="text-gray-500 mb-6">{guide.description}</p>
                            <ol className="space-y-3">
                                {guide.steps.map((step, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-gray-600">
                                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="leading-relaxed">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Eye size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">FAQ for Sellers</h2>
                            <p className="text-gray-500">Common questions from new and experienced sellers.</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((item, i) => (
                            <FaqItem
                                key={item.q}
                                item={item}
                                isOpen={openFaq === i}
                                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 md:p-12 text-center text-white">
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Ready to start selling?</h2>
                    <p className="text-amber-100 mb-8 max-w-xl mx-auto">
                        Join thousands of verified sellers on PenePene. Create your store in minutes — it&apos;s free to get started.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/seller/register"
                            className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-8 py-4 rounded-xl hover:bg-amber-50 transition-colors shadow-lg"
                        >
                            {t('nav.start_selling')}
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border border-white/30 transition-colors"
                        >
                            View Pricing Plans
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
