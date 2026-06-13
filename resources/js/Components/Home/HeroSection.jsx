import React, { useState, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { Search, MapPin, TrendingUp, Users, ShoppingBag, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import useTranslation from '@/hooks/useTranslation';

const DEFAULT_HERO_IMAGE = '/images/demo-products/default.jpg';

const CATEGORY_HERO_IMAGES = {
    electronics: '/images/demo-products/iphone.jpg',
    fashion: '/images/demo-products/default.jpg',
    'home-living': '/images/demo-products/default.jpg',
    vehicles: '/images/demo-products/default.jpg',
    'health-beauty': '/images/demo-products/default.jpg',
};

function getCategoryFallback(product) {
    const slug = product?.category?.slug;
    return CATEGORY_HERO_IMAGES[slug] || DEFAULT_HERO_IMAGE;
}

function getProductImage(product) {
    if (!product) {
        return DEFAULT_HERO_IMAGE;
    }

    if (product.image_url) {
        return product.image_url;
    }

    if (product.demo_image) {
        return product.demo_image;
    }

    const primary = product.images?.find((img) => img.is_primary) || product.images?.[0];

    if (primary?.image_path) {
        const path = primary.image_path;

        if (path.startsWith('/images/') || path.startsWith('images/')) {
            return path.startsWith('/') ? path : `/${path}`;
        }

        return `/storage/${path}`;
    }

    return getCategoryFallback(product);
}

function handleHeroImageError(event, product) {
    const fallbacks = [
        product?.demo_image,
        getCategoryFallback(product),
        '/images/demo-products/iphone.jpg',
        '/images/demo-products/samsung.jpg',
        DEFAULT_HERO_IMAGE,
    ].filter(Boolean);

    const currentSrc = event.currentTarget.getAttribute('src') || '';

    const next = fallbacks.find((url) => !currentSrc.includes(url));

    if (next) {
        event.currentTarget.src = next;
        return;
    }

    event.currentTarget.onerror = null;
    event.currentTarget.src = DEFAULT_HERO_IMAGE;
}

export default function HeroSection({ heroProducts = [] }) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const heroRef = useRef(null);

    // Parallax scroll effect
    const { scrollY } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const bgY = useTransform(scrollY, [0, 600], [0, 120]);
    const contentY = useTransform(scrollY, [0, 600], [0, 60]);
    const contentOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/search', { q: searchQuery, location: location });
    };

    // Helper: format price
    const formatPrice = (product) => {
        if (!product) return '';
        const price = product.sale_price || product.price;
        return `${product.currency || 'USD'} ${parseFloat(price).toLocaleString()}`;
    };

    // Stats strip
    const stats = [
        { label: t('home.active_products'), value: "25,000+", icon: <ShoppingBag size={18} className="text-amber-300" /> },
        { label: t('home.verified_sellers'), value: "2,500+", icon: <Users size={18} className="text-amber-300" /> },
        { label: t('home.cities_covered'), value: "20+", icon: <MapPin size={18} className="text-amber-300" /> },
    ];

    // Prepare hero card data
    const card1 = heroProducts[0] || null;
    const card2 = heroProducts[1] || null;

    return (
        <div ref={heroRef} className="relative overflow-hidden">
            {/* ── Background Image Layer (with parallax) ── */}
            <motion.div
                style={{ y: bgY }}
                className="absolute inset-0 z-0"
            >
                <img
                    src="/images/hero-marketplace.jpg"
                    alt=""
                    className="w-full h-full object-cover hero-zoom-bg"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            </motion.div>

            {/* ── Dark Blue Gradient Overlay ── */}
            <div
                className="absolute inset-0 z-[1]"
                style={{
                    background: 'linear-gradient(135deg, rgba(15,30,90,0.92) 0%, rgba(20,52,160,0.88) 40%, rgba(30,58,138,0.85) 70%, rgba(15,30,90,0.90) 100%)',
                }}
            />

            {/* ── Decorative Elements ── */}
            <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-400/8 blur-[80px]" />
                <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-300/5 blur-[60px]" />
            </div>

            {/* ── Main Content ── */}
            <motion.div
                style={{ y: contentY, opacity: contentOpacity }}
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 lg:pt-24 lg:pb-36"
            >
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                    {/* ── Left Content ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="lg:col-span-7 text-left"
                    >
                        {/* Trust badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6"
                        >
                            <ShieldCheck size={16} className="text-amber-400" />
                            <span>{t('home.trusted_by')}</span>
                        </motion.div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                            {t('home.hero_title_1')}{' '}
                            <span className="relative inline-block">
                                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                                    {t('home.hero_title_highlight')}
                                </span>
                                <span className="absolute bottom-1 left-0 w-full h-3 bg-amber-400/20 rounded-full -z-0" />
                            </span>{' '}
                            {t('home.hero_title_2')}
                        </h1>

                        <p className="text-lg md:text-xl text-blue-100/80 mb-8 max-w-2xl leading-relaxed">
                            {t('home.hero_subtitle')}
                        </p>

                        {/* ── Search Box (Glassmorphism) ── */}
                        <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl shadow-black/20 flex flex-col md:flex-row gap-2 max-w-3xl mb-8 border border-white/50">
                            <div className="relative flex-grow flex items-center">
                                <Search className="absolute left-4 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder={t('home.search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 font-medium"
                                />
                            </div>
                            <div className="hidden md:block w-px bg-gray-200 my-2" />
                            <div className="relative flex-grow md:max-w-[200px] flex items-center border-t border-gray-100 md:border-t-0">
                                <MapPin className="absolute left-4 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder={t('home.location_placeholder')}
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 font-medium"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary-600/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <Search size={18} />
                                {t('nav.search')}
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                href="/products"
                                className="group bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 hover:border-white/40 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5"
                            >
                                <TrendingUp size={18} />
                                {t('home.browse_categories')}
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/seller/register"
                                className="text-blue-200 hover:text-white font-medium underline underline-offset-4 decoration-blue-300/40 hover:decoration-white/60 transition-colors"
                            >
                                {t('home.want_to_sell')}
                            </Link>
                        </div>
                    </motion.div>

                    {/* ── Right Side: Dynamic Product Cards ── */}
                    <div className="hidden lg:block lg:col-span-5 relative h-[460px]">
                        {/* Card 1 — Main featured card */}
                        <motion.div
                            initial={{ y: 60, opacity: 0, rotateY: -5 }}
                            animate={{ y: 0, opacity: 1, rotateY: 0 }}
                            transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                            className="hero-float absolute top-0 right-6 w-[272px] group"
                        >
                            <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden border border-white/80 transition-all duration-500 group-hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.4)] group-hover:-translate-y-2">
                                {/* Image */}
                                <div className="h-44 relative overflow-hidden rounded-t-2xl bg-gray-900/5">
                                    <img
                                        src={getProductImage(card1)}
                                        alt={card1?.name || t('home.featured_product')}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => handleHeroImageError(e, card1)}
                                    />
                                    {/* Badge overlay */}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                                            {t('home.hot_deal')}
                                        </span>
                                    </div>
                                    {card1?.category && (
                                        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-md">
                                            {card1.category.name}
                                        </div>
                                    )}
                                </div>
                                {/* Info */}
                                <div className="p-4">
                                    {card1?.category && (
                                        <div className="text-[11px] text-primary-600 font-bold uppercase tracking-wider mb-1">
                                            {card1.category.name}
                                        </div>
                                    )}
                                    <h4 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2 text-sm">
                                        {card1?.name || t('home.featured_product')}
                                    </h4>
                                    <div className="flex justify-between items-end">
                                        <span className="font-extrabold text-lg text-gray-900">
                                            {card1 ? formatPrice(card1) : '$0'}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <MapPin size={11} />
                                            {card1?.city || card1?.seller?.city || 'Local'}
                                        </span>
                                    </div>
                                    {card1?.seller && (
                                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
                                            {card1.seller.is_verified && <ShieldCheck size={12} className="text-green-500" />}
                                            <span className="truncate">{card1.seller.business_name || t('home.verified_sellers_badge')}</span>
                                            {card1.average_rating > 0 && (
                                                <span className="flex items-center gap-0.5 ml-auto text-amber-500">
                                                    <Star size={11} fill="currentColor" />
                                                    {card1.average_rating.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 2 — Secondary floating card */}
                        <motion.div
                            initial={{ y: 100, opacity: 0, rotateY: 5 }}
                            animate={{ y: 0, opacity: 1, rotateY: 0 }}
                            transition={{ duration: 0.9, delay: 0.6, ease: 'easeOut' }}
                            className="hero-float-slow absolute bottom-8 left-0 w-[232px] group"
                        >
                            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/20 overflow-hidden border border-white/60 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                                {/* Image */}
                                <div className="h-36 relative overflow-hidden rounded-t-2xl bg-gray-900/5">
                                    <img
                                        src={getProductImage(card2)}
                                        alt={card2?.name || t('home.popular_product')}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => handleHeroImageError(e, card2)}
                                    />
                                    {card2?.sale_price && (
                                        <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                            {t('home.sale')}
                                        </div>
                                    )}
                                </div>
                                {/* Info */}
                                <div className="p-3">
                                    <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                                        {card2?.name || t('home.popular_product')}
                                    </h4>
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-primary-600">
                                            {card2 ? formatPrice(card2) : '$0'}
                                        </span>
                                        {card2?.city && (
                                            <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                                <MapPin size={10} />
                                                {card2.city}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* ── Floating glassmorphism badge ── */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.0, duration: 0.5 }}
                            className="hero-float-slow absolute top-[210px] left-4 z-30"
                        >
                            <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl px-4 py-3 shadow-lg">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <ShieldCheck size={18} className="text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white text-xs font-bold">{t('home.verified_sellers_badge')}</p>
                                        <p className="text-blue-200 text-[10px]">{t('home.trusted_100')}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* ── Stats Strip ── */}
            <div className="absolute bottom-0 left-0 w-full z-20">
                <div className="bg-black/20 backdrop-blur-md border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-wrap justify-center lg:justify-start gap-8 lg:gap-16">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + (i * 0.1) }}
                                    className="flex items-center gap-3"
                                >
                                    {stat.icon}
                                    <div>
                                        <div className="text-white font-bold text-lg">{stat.value}</div>
                                        <div className="text-blue-200/70 text-[11px] uppercase tracking-wider font-medium">{stat.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
