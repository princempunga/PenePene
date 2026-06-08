import React, { useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Mail, Phone, MapPin, Clock, Send, MessageCircle,
    ShoppingBag, Store, Package, User, Wrench, ChevronDown,
    ChevronUp, ArrowRight, CheckCircle, HelpCircle
} from 'lucide-react';

const InfoCard = ({ icon: Icon, title, value, sub, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-start gap-4 hover:shadow-lg transition-all group">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
            <p className="font-bold text-gray-900">{value}</p>
            {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const CategoryCard = ({ icon: Icon, title, description, color, bg }) => (
    <div className={`${bg} rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer`}>
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            <Icon size={18} className="text-white" />
        </div>
        <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
        <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
    </div>
);

const faqItems = [
    { q: 'How do I track my order?', a: 'You can track your order status from your Buyer Dashboard under "My Orders". Each order shows its current status in real time.' },
    { q: 'How do I contact a seller?', a: 'On any product page, click the "Message Seller" button. This opens a direct chat with the seller where you can discuss price, availability and delivery.' },
    { q: 'What do I do if I have a problem with my order?', a: 'Open a support ticket from your dashboard or use the contact form on this page. Our team responds within 24 hours.' },
    { q: 'How do I become a seller on PenePene?', a: 'Click "Become a Seller" in the navigation or visit /become-a-seller. Fill in your business details and our team will review and verify your account.' },
];

const FaqItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-50 transition-colors"
            >
                <span className="font-semibold text-gray-900 pr-4">{q}</span>
                {open ? <ChevronUp size={18} className="text-primary-600 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
            </button>
            {open && (
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {a}
                </div>
            )}
        </div>
    );
};

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', category: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = e => {
        e.preventDefault();
        setLoading(true);
        // Simulate send
        setTimeout(() => { setLoading(false); setSent(true); }, 1500);
    };

    return (
        <AppLayout>
            <Head title="Contact PenePene Support" />

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <MessageCircle size={16} />
                        <span>We're here to help</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
                        Contact{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                            PenePene Support
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                        Have a question about an order, seller issue, account problem, or technical error? Our support team is ready to help — fast.
                    </p>
                </div>
            </section>

            {/* ── Support Categories ───────────────────────────────────────── */}
            <section className="bg-gray-50 py-14">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-extrabold text-gray-900">What do you need help with?</h2>
                        <p className="text-gray-500 mt-2">Select a category and we'll route you to the right team</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <CategoryCard icon={ShoppingBag} title="Buyer Support"    description="Orders, returns, and shopping help"       color="bg-blue-500"    bg="bg-blue-50" />
                        <CategoryCard icon={Store}       title="Seller Support"   description="Listings, store management, payouts"     color="bg-amber-500"   bg="bg-amber-50" />
                        <CategoryCard icon={Package}     title="Orders"           description="Tracking, status updates, delivery"      color="bg-green-500"   bg="bg-green-50" />
                        <CategoryCard icon={User}        title="Account Help"     description="Login, profile, password reset"          color="bg-purple-500"  bg="bg-purple-50" />
                        <CategoryCard icon={Wrench}      title="Technical Issues" description="Bugs, errors, app problems"              color="bg-red-500"     bg="bg-red-50" />
                    </div>
                </div>
            </section>

            {/* ── Form + Info ──────────────────────────────────────────────── */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-5 gap-12">

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Send Us a Message</h2>
                                <p className="text-gray-500 mb-8">We typically respond within 24 hours on business days.</p>

                                {sent ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                                            <CheckCircle size={40} className="text-green-500" />
                                        </div>
                                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Message Sent!</h3>
                                        <p className="text-gray-500 max-w-sm">Thank you for contacting us. Our support team will get back to you within 24 hours.</p>
                                        <button onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', category:'', message:'' }); }} className="mt-6 text-primary-600 font-semibold hover:underline">
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text" name="name" value={form.name} onChange={handleChange} required
                                                    placeholder="Your full name"
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                                                <input
                                                    type="email" name="email" value={form.email} onChange={handleChange} required
                                                    placeholder="you@example.com"
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text" name="subject" value={form.subject} onChange={handleChange} required
                                                    placeholder="Brief description of your issue"
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Support Category</label>
                                                <select
                                                    name="category" value={form.category} onChange={handleChange}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-700 bg-white"
                                                >
                                                    <option value="">Select a category</option>
                                                    <option value="buyer">Buyer Support</option>
                                                    <option value="seller">Seller Support</option>
                                                    <option value="orders">Orders & Delivery</option>
                                                    <option value="account">Account & Security</option>
                                                    <option value="technical">Technical Issues</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Message <span className="text-red-500">*</span></label>
                                            <textarea
                                                name="message" value={form.message} onChange={handleChange} required
                                                rows={5} placeholder="Describe your issue in detail. Include order numbers, product names or any relevant information..."
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900 resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit" disabled={loading}
                                            className="w-full flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg text-lg"
                                        >
                                            {loading ? (
                                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                                            ) : (
                                                <><Send size={20} /> Send Message</>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="lg:col-span-2 space-y-5">
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-5">Contact Information</h3>
                                <div className="space-y-4">
                                    <InfoCard icon={Mail}  color="bg-primary-600"  title="Email"          value="support@penepene.com"    sub="Response within 24 hours" />
                                    <InfoCard icon={Phone} color="bg-green-500"    title="Phone / WhatsApp" value="+243 000 000 000"       sub="Available Mon–Sat" />
                                    <InfoCard icon={MapPin} color="bg-red-500"     title="Headquarters"   value="Kinshasa, DRC"           sub="Democratic Republic of Congo" />
                                    <InfoCard icon={Clock} color="bg-amber-500"    title="Working Hours"  value="Mon – Sat: 8:00 – 20:00" sub="Sunday: Closed" />
                                </div>
                            </div>

                            {/* Help Center CTA */}
                            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                    <HelpCircle size={20} className="text-white" />
                                </div>
                                <h4 className="text-lg font-extrabold mb-2">Need Faster Help?</h4>
                                <p className="text-white/80 text-sm mb-4 leading-relaxed">
                                    Browse our Help Center for instant answers to the most common questions.
                                </p>
                                <Link href="/help-center" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                                    Visit Help Center <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ Preview ──────────────────────────────────────────────── */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
                        <p className="text-gray-500 mt-2">Quick answers before you reach out</p>
                    </div>
                    <div className="space-y-3">
                        {faqItems.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)}
                    </div>
                    <div className="text-center mt-8">
                        <Link href="/help-center" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:underline">
                            See all FAQs in the Help Center <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
