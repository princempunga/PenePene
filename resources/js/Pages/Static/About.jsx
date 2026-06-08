import React, { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Target, Eye, Heart, Users, ShoppingBag, Store, MapPin,
    Search, MessageCircle, ShoppingCart, CheckCircle, Star,
    TrendingUp, Shield, Zap, Globe, ArrowRight, Package
} from 'lucide-react';

const StatCard = ({ number, label, icon: Icon, color }) => {
    const [count, setCount] = useState(0);
    const target = parseInt(number.replace(/\D/g, ''));

    useEffect(() => {
        let start = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(start);
        }, 25);
        return () => clearInterval(timer);
    }, [target]);

    const formatted = number.includes('+')
        ? count.toLocaleString() + '+'
        : count.toLocaleString();

    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-all hover:-translate-y-1">
            <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={28} className="text-white" />
            </div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">{formatted}</div>
            <div className="text-gray-500 font-medium">{label}</div>
        </div>
    );
};

const ValueCard = ({ icon: Icon, title, description, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={22} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
);

const StepCard = ({ step, icon: Icon, title, description, color }) => (
    <div className="relative flex flex-col items-center text-center">
        <div className={`w-20 h-20 ${color} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
            <Icon size={32} className="text-white" />
        </div>
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-black">
            {step}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{description}</p>
    </div>
);

export default function About() {
    return (
        <AppLayout>
            <Head title="About PenePene - Your Local Marketplace" />

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800 text-white overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <Store size={16} />
                        <span>About Us</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                        About{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                            PenePene
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
                        The premier local marketplace connecting buyers and sellers across the Democratic Republic of Congo — making commerce simple, trusted, and <em className="text-amber-400 not-italic font-bold">tout proche</em>.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/products" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5">
                            Start Shopping <ArrowRight size={18} />
                        </Link>
                        <Link href="/become-a-seller" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border border-white/20 transition-all">
                            Become a Seller
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Stats ──────────────────────────────────────────────────────── */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">PenePene by the Numbers</h2>
                        <p className="text-gray-500 mt-3 text-lg">A growing community of buyers and sellers</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard number="5000+"  label="Products Listed"  icon={Package}      color="bg-blue-500" />
                        <StatCard number="500+"   label="Active Sellers"   icon={Store}        color="bg-amber-500" />
                        <StatCard number="10000+" label="Happy Buyers"     icon={Users}        color="bg-green-500" />
                        <StatCard number="15+"    label="Cities Covered"   icon={MapPin}       color="bg-purple-500" />
                    </div>
                </div>
            </section>

            {/* ── Why PenePene ─────────────────────────────────────────────── */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-5">
                                <Target size={16} /> Our Story
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                                Why PenePene <br />
                                <span className="text-primary-600">Exists</span>
                            </h2>
                            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    In Congo, millions of talented entrepreneurs sell great products — but struggle to reach customers beyond their neighbourhood. At the same time, buyers waste hours searching for items that are available just streets away.
                                </p>
                                <p>
                                    <strong className="text-gray-900">PenePene</strong> — meaning <em>"very close"</em> in Lingala — was born to bridge this gap. We built a platform where any seller can list their products in minutes and any buyer can discover them instantly.
                                </p>
                                <p>
                                    No complicated shipping. No foreign platforms. Just <strong className="text-gray-900">local commerce, done right</strong>.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Shield,    color: 'bg-blue-500',   title: 'Verified Sellers',   desc: 'Every seller is reviewed and verified before going live.' },
                                { icon: Zap,       color: 'bg-amber-500',  title: 'Fast Discovery',     desc: 'Find exactly what you need in seconds with smart search.' },
                                { icon: Heart,     color: 'bg-red-500',    title: 'Community First',    desc: 'We support local businesses and keep money in communities.' },
                                { icon: Globe,     color: 'bg-green-500',  title: 'Nationwide Reach',   desc: 'Sellers in Kinshasa, Lubumbashi, Goma and beyond.' },
                            ].map(v => (
                                <div key={v.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <div className={`w-10 h-10 ${v.color} rounded-lg flex items-center justify-center mb-3`}>
                                        <v.icon size={18} className="text-white" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1 text-sm">{v.title}</h4>
                                    <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Mission / Vision ─────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center mb-5">
                                <Target size={24} className="text-amber-300" />
                            </div>
                            <h3 className="text-2xl font-extrabold mb-3">Our Mission</h3>
                            <p className="text-white/80 leading-relaxed text-lg">
                                To empower every Congolese entrepreneur with a digital storefront and every buyer with instant access to local products — making commerce accessible, trusted, and rewarding for all.
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center mb-5">
                                <Eye size={24} className="text-green-300" />
                            </div>
                            <h3 className="text-2xl font-extrabold mb-3">Our Vision</h3>
                            <p className="text-white/80 leading-relaxed text-lg">
                                To become the #1 trusted marketplace across Central Africa, where millions of people discover, buy, and sell products that are truly <em className="text-amber-300 not-italic">pene pene</em> — right next door.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Core Values ──────────────────────────────────────────────── */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <Heart size={16} /> Our Values
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">What Drives Us Every Day</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ValueCard icon={Shield}      color="bg-blue-500"    title="Trust & Safety"       description="We verify every seller and moderate every product to ensure buyers can shop with total confidence." />
                        <ValueCard icon={Heart}       color="bg-red-500"     title="Community"            description="We put local communities first. Every purchase on PenePene supports a real person with a dream." />
                        <ValueCard icon={TrendingUp}  color="bg-green-500"   title="Growth for Sellers"   description="We give sellers tools to grow: analytics, subscriptions, sponsored listings and more." />
                        <ValueCard icon={Zap}         color="bg-amber-500"   title="Simplicity"           description="Listing a product, placing an order, or contacting a seller should take seconds — not hours." />
                        <ValueCard icon={Star}        color="bg-purple-500"  title="Quality"              description="We set high standards for the products and services listed on our platform." />
                        <ValueCard icon={Users}       color="bg-indigo-500"  title="Inclusion"            description="PenePene is for every seller — from a small roadside artisan to a large wholesaler." />
                    </div>
                </div>
            </section>

            {/* ── How It Works ─────────────────────────────────────────────── */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <Zap size={16} /> Simple Process
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">How PenePene Works</h2>
                        <p className="text-gray-500 mt-3 max-w-xl mx-auto">Three steps to buy anything from a local seller near you</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* connector lines */}
                        <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary-200 to-primary-200 z-0" />
                        <StepCard step={1} icon={Search}        color="bg-primary-600"  title="Search Products"      description="Browse thousands of products by category, keyword, or location. Filter by price, rating and availability." />
                        <StepCard step={2} icon={MessageCircle} color="bg-amber-500"    title="Contact the Seller"   description="Found what you want? Message the seller directly to confirm availability, price, and delivery details." />
                        <StepCard step={3} icon={ShoppingCart}  color="bg-green-500"    title="Order & Receive"      description="Place your order through the platform. Track its status and get your product delivered or pick it up." />
                    </div>
                </div>
            </section>

            {/* ── Seller Benefits ──────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-20 border-y border-amber-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-5">
                                <Store size={16} /> For Sellers
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Grow Your Business <br /> With PenePene</h2>
                            <div className="space-y-4">
                                {[
                                    'Create a professional storefront in minutes',
                                    'Reach buyers across DRC — not just your neighbourhood',
                                    'Manage products, orders and messages in one dashboard',
                                    'Get insights on views, sales and customer behaviour',
                                    'Boost visibility with sponsored product listings',
                                    'Choose a subscription plan that fits your scale',
                                ].map(item => (
                                    <div key={item} className="flex items-start gap-3">
                                        <CheckCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Link href="/become-a-seller" className="inline-flex items-center gap-2 mt-8 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5">
                                Start Selling Today <ArrowRight size={18} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { n: '5 min',  label: 'To go live',          color: 'text-amber-600 bg-amber-50' },
                                { n: 'Free',   label: 'Basic plan',           color: 'text-green-600 bg-green-50' },
                                { n: '24/7',   label: 'Platform uptime',      color: 'text-blue-600 bg-blue-50' },
                                { n: '100%',   label: 'Seller control',       color: 'text-purple-600 bg-purple-50' },
                            ].map(s => (
                                <div key={s.n} className={`rounded-2xl p-6 ${s.color.split(' ')[1]} border border-gray-100 text-center`}>
                                    <div className={`text-4xl font-extrabold ${s.color.split(' ')[0]} mb-1`}>{s.n}</div>
                                    <div className="text-gray-600 text-sm font-medium">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Buyer Benefits ───────────────────────────────────────────── */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl p-8 grid grid-cols-2 gap-4">
                            {[
                                { icon: Shield,     label: 'Verified Sellers Only',    color: 'bg-blue-500' },
                                { icon: Search,     label: 'Smart Search & Filters',   color: 'bg-green-500' },
                                { icon: Heart,      label: 'Save to Wishlist',          color: 'bg-red-500' },
                                { icon: Star,       label: 'Ratings & Reviews',         color: 'bg-amber-500' },
                                { icon: MessageCircle, label: 'Direct Seller Chat',     color: 'bg-purple-500' },
                                { icon: Package,    label: 'Order Tracking',            color: 'bg-indigo-500' },
                            ].map(b => (
                                <div key={b.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                                    <div className={`w-9 h-9 ${b.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <b.icon size={16} className="text-white" />
                                    </div>
                                    <span className="text-gray-700 text-sm font-medium">{b.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-5">
                                <ShoppingBag size={16} /> For Buyers
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Shop Local. <br /> Shop Smart.</h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                Discover thousands of verified local products. Compare prices, read real reviews, and message sellers directly — all from one trusted platform.
                            </p>
                            <Link href="/products" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5">
                                Browse Products <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-gray-900 to-primary-900 py-20 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-5">
                        Ready to Join <span className="text-amber-400">PenePene?</span>
                    </h2>
                    <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
                        Whether you're looking to buy amazing local products or grow your business online — PenePene is the place to be.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/products" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 text-lg">
                            <ShoppingBag size={20} /> Start Shopping
                        </Link>
                        <Link href="/become-a-seller" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border border-white/20 transition-all text-lg">
                            <Store size={20} /> Become a Seller
                        </Link>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
