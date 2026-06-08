import React, { useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Search, HelpCircle, ShoppingBag, Store, Package, User,
    Shield, CreditCard, List, MessageCircle, ChevronDown,
    ChevronUp, ArrowRight, BookOpen, Play, Star, Zap,
    CheckCircle, ExternalLink
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────────────────── */
const categories = [
    {
        icon: Play,         color: 'bg-green-500',    bg: 'bg-green-50',   border: 'border-green-100',
        title: 'Getting Started',
        description: 'New here? Learn the basics of PenePene in minutes.',
        articles: ['Creating your account', 'Setting up your profile', 'Browsing products', 'Using the search bar'],
    },
    {
        icon: ShoppingBag,  color: 'bg-blue-500',     bg: 'bg-blue-50',    border: 'border-blue-100',
        title: 'Buyer Guide',
        description: 'Everything you need to shop safely and easily.',
        articles: ['How to place an order', 'Contacting a seller', 'Managing your wishlist', 'Leaving a review'],
    },
    {
        icon: Store,        color: 'bg-amber-500',    bg: 'bg-amber-50',   border: 'border-amber-100',
        title: 'Seller Guide',
        description: 'Grow your business with PenePene tools.',
        articles: ['Creating a seller account', 'Adding your first product', 'Managing orders', 'Seller subscriptions'],
    },
    {
        icon: Package,      color: 'bg-orange-500',   bg: 'bg-orange-50',  border: 'border-orange-100',
        title: 'Orders & Delivery',
        description: 'Track and manage orders from purchase to delivery.',
        articles: ['Order status explained', 'Cancelling an order', 'Delivery options', 'Order disputes'],
    },
    {
        icon: Shield,       color: 'bg-purple-500',   bg: 'bg-purple-50',  border: 'border-purple-100',
        title: 'Account & Security',
        description: 'Keep your account safe and up to date.',
        articles: ['Resetting your password', 'Updating account details', 'Two-factor security', 'Reporting fraud'],
    },
    {
        icon: CreditCard,   color: 'bg-indigo-500',   bg: 'bg-indigo-50',  border: 'border-indigo-100',
        title: 'Payments & Delivery',
        description: 'Understand payment methods and delivery logistics.',
        articles: ['Accepted payment methods', 'Delivery costs', 'Failed payments', 'Refund policy'],
    },
    {
        icon: List,         color: 'bg-red-500',      bg: 'bg-red-50',     border: 'border-red-100',
        title: 'Product Listings',
        description: 'Create and manage effective product listings.',
        articles: ['Writing a good title', 'Uploading product photos', 'Setting the right price', 'Listing rules'],
    },
    {
        icon: MessageCircle,color: 'bg-teal-500',     bg: 'bg-teal-50',    border: 'border-teal-100',
        title: 'Contact Support',
        description: 'Reach our support team directly.',
        articles: ['Opening a support ticket', 'Live chat hours', 'Email support', 'Escalating an issue'],
    },
];

const faqData = [
    { q: 'How do I create an account on PenePene?', a: 'Click "Sign In" in the top navigation, then choose "Create Account". Fill in your name, email and password. You\'ll receive a verification email — click the link to activate your account.' },
    { q: 'How do I contact a seller?', a: 'Go to any product page and click the "Message Seller" button. This opens a private chat where you can discuss price, availability, and delivery directly with the seller.' },
    { q: 'How do I become a seller on PenePene?', a: 'Visit /become-a-seller or click "Sell on PenePene" in the top bar. Complete the seller registration form with your business details. Our team will review and verify your account within 24–48 hours.' },
    { q: 'Does PenePene handle payments?', a: 'Currently, PenePene facilitates discovery and communication between buyers and sellers. Payment arrangements are made directly between buyer and seller. We are working on integrated payment solutions.' },
    { q: 'How do I publish a product listing?', a: 'Log into your Seller Dashboard, go to "Products" and click "Add Product". Fill in the title, description, price, category and upload photos. Your listing goes live after our moderation review (usually under 12 hours).' },
    { q: 'How do I reset my password?', a: 'On the login page, click "Forgot Password". Enter your registered email address and we\'ll send you a secure reset link. The link expires after 60 minutes.' },
    { q: 'How can I report a seller or product?', a: 'On any seller\'s store page or product page, click the "Report" button. Select the reason (fake product, scam, inappropriate content, etc.) and submit. Our moderation team will review within 24 hours.' },
    { q: 'Can I cancel an order after placing it?', a: 'Yes, you can cancel an order while it is still in "Pending" status. Go to your Buyer Dashboard > Orders, open the order, and click "Cancel Order". Once the seller confirms the order, cancellation requires seller approval.' },
];

const popularArticles = [
    { icon: User,         title: 'How to create a PenePene account',       tag: 'Getting Started',  views: '12.4k' },
    { icon: Store,        title: 'Setting up your seller store',            tag: 'Seller Guide',     views: '9.8k' },
    { icon: Search,       title: 'How to search and filter products',       tag: 'Buyer Guide',      views: '8.1k' },
    { icon: Package,      title: 'Understanding order statuses',            tag: 'Orders',           views: '7.3k' },
    { icon: Shield,       title: 'Resetting your password',                 tag: 'Account',          views: '6.9k' },
    { icon: MessageCircle,title: 'How to message a seller',                 tag: 'Buyer Guide',      views: '6.2k' },
];

/* ─── Sub-components ────────────────────────────────────────────────────── */
const FaqItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`border rounded-xl overflow-hidden transition-all ${open ? 'border-primary-300 shadow-md' : 'border-gray-200'}`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-50 transition-colors"
            >
                <span className={`font-semibold pr-4 ${open ? 'text-primary-700' : 'text-gray-900'}`}>{q}</span>
                {open
                    ? <ChevronUp size={18} className="text-primary-600 flex-shrink-0" />
                    : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                }
            </button>
            {open && (
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4 bg-primary-50/30">
                    {a}
                </div>
            )}
        </div>
    );
};

const CategoryCard = ({ cat, searchQuery }) => {
    const isMatch = !searchQuery || cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.articles.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));

    if (searchQuery && !isMatch) return null;

    return (
        <div className={`${cat.bg} rounded-2xl p-6 border ${cat.border} hover:shadow-lg transition-all hover:-translate-y-1 group`}>
            <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <cat.icon size={22} className="text-white" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg mb-2">{cat.title}</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">{cat.description}</p>
            <ul className="space-y-1.5">
                {cat.articles.map(article => (
                    <li key={article} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 cursor-pointer group/item">
                        <CheckCircle size={13} className="text-gray-300 group-hover/item:text-primary-500 flex-shrink-0" />
                        {article}
                    </li>
                ))}
            </ul>
        </div>
    );
};

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [faqSearch, setFaqSearch] = useState('');

    const filteredFaqs = faqData.filter(f =>
        !faqSearch || f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Help Center - PenePene" />

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <HelpCircle size={16} /> Help Center
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
                        How can we{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                            help you?
                        </span>
                    </h1>
                    <p className="text-gray-300 mb-10 text-lg">
                        Search for answers or browse help topics below
                    </p>

                    {/* Search bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search help topics, e.g. 'cancel order', 'reset password'..."
                            className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white text-gray-900 text-lg placeholder-gray-400 shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/40 border-0"
                        />
                    </div>

                    {/* Quick links */}
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        {['Create account', 'Reset password', 'Track order', 'Become a seller', 'Contact support'].map(term => (
                            <button
                                key={term}
                                onClick={() => setSearchQuery(term)}
                                className="text-sm text-white/70 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 rounded-full transition-colors"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Help Category Cards ──────────────────────────────────────── */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    {!searchQuery && (
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Browse Help Topics</h2>
                            <p className="text-gray-500 mt-2">Choose a category to find the help you need</p>
                        </div>
                    )}
                    {searchQuery && (
                        <div className="mb-8">
                            <p className="text-gray-600">
                                Showing results for: <strong className="text-gray-900">"{searchQuery}"</strong>
                                <button onClick={() => setSearchQuery('')} className="ml-3 text-primary-600 hover:underline text-sm">Clear</button>
                            </p>
                        </div>
                    )}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {categories.map(cat => (
                            <CategoryCard key={cat.title} cat={cat} searchQuery={searchQuery} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Popular Articles ─────────────────────────────────────────── */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">Popular Help Articles</h2>
                            <p className="text-gray-500 mt-1">Most-viewed guides this week</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {popularArticles.map(article => (
                            <div key={article.title} className="flex items-start gap-4 p-5 border border-gray-100 rounded-xl hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group">
                                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                                    <article.icon size={18} className="text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors leading-snug">{article.title}</h4>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{article.tag}</span>
                                        <span className="text-xs text-gray-400">{article.views} views</span>
                                    </div>
                                </div>
                                <ExternalLink size={14} className="text-gray-300 group-hover:text-primary-400 flex-shrink-0 mt-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ Accordion ────────────────────────────────────────────── */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <BookOpen size={16} /> FAQ
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
                        <p className="text-gray-500 mt-2">Can't find what you're looking for? Try searching below.</p>
                    </div>

                    {/* FAQ search */}
                    <div className="relative mb-6">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text" value={faqSearch} onChange={e => setFaqSearch(e.target.value)}
                            placeholder="Search FAQs..."
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 placeholder-gray-400"
                        />
                    </div>

                    <div className="space-y-3">
                        {filteredFaqs.length > 0
                            ? filteredFaqs.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)
                            : (
                                <div className="text-center py-10 text-gray-400">
                                    <HelpCircle size={40} className="mx-auto mb-3 opacity-30" />
                                    <p>No FAQs match your search. Try a different keyword.</p>
                                </div>
                            )
                        }
                    </div>
                </div>
            </section>

            {/* ── Support CTA ──────────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-gray-900 to-primary-900 py-20 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <MessageCircle size={32} className="text-amber-400" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                        Still need help?
                    </h2>
                    <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
                        Our support team is available Monday to Saturday, 8:00 AM – 8:00 PM. We'll get back to you within 24 hours.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/contact" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 text-lg">
                            <MessageCircle size={20} /> Contact Support
                        </Link>
                        <Link href="/faq" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border border-white/20 transition-all text-lg">
                            <BookOpen size={20} /> Full FAQ
                        </Link>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
                        {[
                            { icon: Zap,           label: 'Fast Response',   sub: 'Under 24 hours' },
                            { icon: Shield,        label: 'Safe & Secure',   sub: 'Your data is protected' },
                            { icon: CheckCircle,   label: 'Expert Team',     sub: 'Trained support agents' },
                        ].map(item => (
                            <div key={item.label} className="bg-white/5 rounded-xl p-5 border border-white/10">
                                <item.icon size={24} className="text-amber-400 mx-auto mb-2" />
                                <div className="font-bold text-sm">{item.label}</div>
                                <div className="text-gray-400 text-xs mt-0.5">{item.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
