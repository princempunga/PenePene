import React, { useState, useRef, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { Search, MapPin, TrendingUp, Users, ShoppingBag, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import useTranslation from '@/hooks/useTranslation';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { RevealAfterSplash } from '@/Components/UI/RevealAfterSplash';

const HERO_AUTOPLAY_MS = 7000;
const DEFAULT_HERO_IMAGE = '/images/demo-products/default.jpg';

// ── Animation configs per card slot ──────────────────────────────────────────
const CARD_ANIMATIONS = [
    {
        // Card 1 — gauche → droite
        label: 'slide-lr',
        initial: { x: '-100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit:    { x: '100%', opacity: 0 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
    {
        // Card 2 — circulaire (rotation + scale)
        label: 'circular',
        initial: { rotate: -90, scale: 0.5, opacity: 0 },
        animate: { rotate: 0,   scale: 1,   opacity: 1 },
        exit:    { rotate:  90, scale: 0.5, opacity: 0 },
        transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
    },
    {
        // Card 3 — droite → gauche
        label: 'slide-rl',
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit:    { x: '-100%', opacity: 0 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
    {
        // Card 4 — haut → bas
        label: 'slide-tb',
        initial: { y: '-100%', opacity: 0 },
        animate: { y: 0,       opacity: 1 },
        exit:    { y: '100%',  opacity: 0 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const CATEGORY_HERO_IMAGES = {
    electronics: '/images/demo-products/iphone.jpg',
    fashion: '/images/demo-products/default.jpg',
    'home-living': '/images/demo-products/default.jpg',
    vehicles: '/images/demo-products/default.jpg',
    'health-beauty': '/images/demo-products/default.jpg',
};

function getCategoryFallback(product) {
    return CATEGORY_HERO_IMAGES[product?.category?.slug] || DEFAULT_HERO_IMAGE;
}

// ── Promo Slide content ───────────────────────────────────────────────────────
function PromoContent({ promo, t }) {
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const products      = promo?.products || [];
    const currentProduct = products[currentProductIndex] || null;
    const imageSrc      = currentProduct?.image_url || promo?.custom_image_url || promo?.product_image || DEFAULT_HERO_IMAGE;
    const productName   = currentProduct?.name    || promo?.product_name    || 'Promotion';
    const productSlug   = currentProduct?.slug    || promo?.product_slug;
    const productCurrency = currentProduct?.currency || promo?.product_currency || 'CDF';
    const productPrice  = currentProduct?.price   || promo?.product_price   || 0;
    const categoryName  = currentProduct?.category_name || promo?.category_name;
    const shopHref      = productSlug
        ? `/products/${productSlug}`
        : promo?.seller_slug ? `/sellers/${promo.seller_slug}` : '#';

    // Cycle through products within this promo
    useEffect(() => {
        if (products.length <= 1) { setCurrentProductIndex(0); return; }
        setCurrentProductIndex(0);
        const iv = setInterval(() => setCurrentProductIndex(p => (p + 1) % products.length), 2500);
        return () => clearInterval(iv);
    }, [products]);

    return (
        <Link href={shopHref} className="group block w-full h-full" style={{ height: '100%' }}>
            <div className="w-full h-full bg-white flex flex-col overflow-hidden">
                {/* Image (65%) */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800"
                    style={{ height: '65%', flexShrink: 0 }}>
                    <AnimatePresence initial={false} mode="wait">
                        <motion.img
                            key={currentProduct?.id || imageSrc}
                            src={imageSrc}
                            alt={productName}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="eager"
                            decoding="async"
                            onError={e => { e.currentTarget.src = DEFAULT_HERO_IMAGE; }}
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    {promo?.headline && (
                        <div className="absolute top-2 left-2 right-2">
                            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-2.5 py-1 rounded-lg">
                                <p className="text-[11px] font-bold truncate">{promo.headline}</p>
                            </div>
                        </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1">
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 min-w-0">
                            <Store size={10} className="text-amber-400 shrink-0" />
                            <span className="text-white text-[10px] font-semibold truncate">{promo?.seller_name || 'Vendeur'}</span>
                        </div>
                    </div>
                </div>
                {/* Info (35%) */}
                <div className="flex flex-col justify-between p-2.5" style={{ flex: 1, minHeight: 0 }}>
                    <h3 className="font-bold text-xs text-gray-900 leading-snug line-clamp-2">{productName}</h3>
                    <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-extrabold text-primary-600 leading-none">
                            {productCurrency} {parseFloat(productPrice || 0).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-0.5 text-gray-400 text-[9px]">
                            <MapPin size={9} />
                            <span className="truncate max-w-[50px]">{promo?.seller_city || 'Local'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ── One animated card slot ────────────────────────────────────────────────────
function HeroAnimatedCard({ promos, startOffset, animConfig, prefersReducedMotion, glowColor }) {
    const total = promos.length;
    const [idx, setIdx] = useState(startOffset % Math.max(total, 1));

    useEffect(() => {
        if (total <= 1) return;
        // Stagger each card's start time so they don't all cycle at once
        const staggerMs = startOffset * (HERO_AUTOPLAY_MS / 4);
        let iv;
        const timer = setTimeout(() => {
            iv = setInterval(() => setIdx(p => (p + 1) % total), HERO_AUTOPLAY_MS);
        }, staggerMs);
        return () => { clearTimeout(timer); clearInterval(iv); };
    }, [total, startOffset]);

    if (!promos.length) return null;
    const promo = promos[idx];

    return (
        <div
            className="relative overflow-hidden rounded-xl"
            style={{ height: '100%' }}
        >
            {/* Glow border */}
            <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ zIndex: 10,
                boxShadow: `0 0 0 1.5px ${glowColor}80, 0 0 20px 4px ${glowColor}30` }} />

            {/* Animated content */}
            <AnimatePresence initial={false}>
                <motion.div
                    key={idx}
                    className="absolute inset-0"
                    initial={prefersReducedMotion ? {} : animConfig.initial}
                    animate={animConfig.animate}
                    exit={prefersReducedMotion ? {} : animConfig.exit}
                    transition={animConfig.transition}
                    style={{ overflow: 'hidden', borderRadius: '0.75rem' }}
                >
                    <PromoContent promo={promo} />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ── Glow colors per card ──────────────────────────────────────────────────────
const GLOW_COLORS = [
    'rgba(34,211,238,1)',   // cyan   — card 1
    'rgba(168,85,247,1)',   // violet — card 2
    'rgba(251,191,36,1)',   // amber  — card 3
    'rgba(34,197,94,1)',    // green  — card 4
];


// ═══════════════════════════════════════════════════════════════════════════════
// Main HeroSection
// ═══════════════════════════════════════════════════════════════════════════════
export default function HeroSection({ heroProducts = [], featuredPromotions = [] }) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation]       = useState('');
    const heroRef                        = useRef(null);
    const prefersReducedMotion           = useReducedMotion();

    const slides = featuredPromotions.slice(0, 8); // up to 8 promos, spread across 4 cards

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/search', { q: searchQuery, location });
    };

    const stats = [
        { label: t('home.active_products'),  value: '25,000+', icon: <ShoppingBag size={18} className="text-amber-300" /> },
        { label: t('home.verified_sellers'), value: '2,500+',  icon: <Users       size={18} className="text-amber-300" /> },
        { label: t('home.cities_covered'),   value: '20+',     icon: <MapPin      size={18} className="text-amber-300" /> },
    ];

    return (
        <div ref={heroRef} className="relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src="/images/hero-marketplace.jpg" alt="" className="w-full h-full object-cover"
                    loading="eager" decoding="async" onError={e => { e.target.style.display = 'none'; }} />
            </div>

            {/* Dark overlay */}
            <div className="absolute inset-0 z-[1]" style={{
                background: 'linear-gradient(135deg, rgba(15,30,90,0.92) 0%, rgba(20,52,160,0.88) 40%, rgba(30,58,138,0.85) 70%, rgba(15,30,90,0.90) 100%)',
            }} />

            {/* Decorative blobs */}
            <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-400/8 blur-[80px]" />
                <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-300/5 blur-[60px]" />
            </div>

            {/* Main content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 lg:pt-24 lg:pb-36">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                    {/* ── Left column ── */}
                    <div className="lg:col-span-7 text-left">
                        <RevealAfterSplash delay={0.05} direction="up">
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6">
                                <ShieldCheck size={16} className="text-amber-400" />
                                <span>{t('home.trusted_by')}</span>
                            </div>
                        </RevealAfterSplash>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                            <RevealAfterSplash delay={0.08} as="span" className="block">
                                {t('home.hero_title_1')}{' '}
                                <span className="relative inline-block">
                                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                                        {t('home.hero_title_highlight')}
                                    </span>
                                    <span className="absolute bottom-1 left-0 w-full h-3 bg-amber-400/20 rounded-full -z-0" />
                                </span>{' '}
                                {t('home.hero_title_2')}
                            </RevealAfterSplash>
                        </h1>

                        <RevealAfterSplash delay={0.62} as="p" className="text-lg md:text-xl text-blue-100/80 mb-8 max-w-2xl leading-relaxed">
                            {t('home.hero_subtitle')}
                        </RevealAfterSplash>

                        <RevealAfterSplash delay={0.72} direction="up">
                            <div className="web-glass bg-white/95 p-2 rounded-2xl shadow-2xl shadow-black/20 flex flex-col md:flex-row gap-2 max-w-3xl mb-8 border border-white/50">
                                <div className="relative flex-grow flex items-center">
                                    <Search className="absolute left-4 text-gray-400" size={20} />
                                    <input type="text" placeholder={t('home.search_placeholder')}
                                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 font-medium" />
                                </div>
                                <div className="hidden md:block w-px bg-gray-200 my-2" />
                                <div className="relative flex-grow md:max-w-[200px] flex items-center border-t border-gray-100 md:border-t-0">
                                    <MapPin className="absolute left-4 text-gray-400" size={20} />
                                    <input type="text" placeholder={t('home.location_placeholder')}
                                        value={location} onChange={e => setLocation(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 font-medium" />
                                </div>
                                <button onClick={handleSearch}
                                    className="web-btn web-shine premium-cta bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary-600/40 flex items-center justify-center gap-2">
                                    <Search size={18} />
                                    {t('nav.search')}
                                </button>
                            </div>
                        </RevealAfterSplash>

                        <RevealAfterSplash delay={0.85} direction="up">
                            <div className="flex flex-wrap items-center gap-4">
                                <Link href="/products"
                                    className="group bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5">
                                    <TrendingUp size={18} />
                                    {t('home.browse_categories')}
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/seller/register"
                                    className="text-blue-200 hover:text-white font-medium underline underline-offset-4 decoration-blue-300/40 hover:decoration-white/60 transition-colors">
                                    {t('home.want_to_sell')}
                                </Link>
                            </div>
                        </RevealAfterSplash>
                    </div>

                    {/* ── Right column: 4 animated cards ── */}
                    <RevealAfterSplash
                        delay={0.45}
                        direction="right"
                        className="w-full lg:col-span-5 mt-12 lg:mt-0"
                    >
                        {slides.length > 0 ? (
                            <div
                                className="grid grid-cols-2 gap-3"
                                style={{ height: 'clamp(340px, 46vw, 480px)' }}
                            >
                                {CARD_ANIMATIONS.map((animConfig, cardIndex) => {
                                    // Each card cycles through a subset of promos with a stagger offset
                                    const cardPromos = slides.length >= 4
                                        ? slides.filter((_, i) => i % 4 === cardIndex).concat(
                                            slides.filter((_, i) => i % 4 !== cardIndex)
                                          )
                                        : slides;

                                    return (
                                        <div key={cardIndex} className="relative">
                                            <HeroAnimatedCard
                                                promos={cardPromos}
                                                startOffset={cardIndex}
                                                animConfig={animConfig}
                                                prefersReducedMotion={prefersReducedMotion}
                                                glowColor={GLOW_COLORS[cardIndex]}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div
                                className="flex items-center justify-center bg-white/10 rounded-2xl border border-white/20"
                                style={{ height: 'clamp(340px, 46vw, 480px)' }}
                            >
                                <p className="text-white/80 text-center">{t('home.no_promotions', 'Aucune promotion disponible')}</p>
                            </div>
                        )}
                    </RevealAfterSplash>
                </div>
            </div>

            {/* Stats strip */}
            <div className="absolute bottom-0 left-0 w-full z-20">
                <div className="bg-black/30 border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-wrap justify-center lg:justify-start gap-8 lg:gap-16">
                            {stats.map((stat, i) => (
                                <RevealAfterSplash key={i} delay={0.95 + i * 0.1} direction="up">
                                    <div className="flex items-center gap-3">
                                        {stat.icon}
                                        <div>
                                            <div className="text-white font-bold text-lg">{stat.value}</div>
                                            <div className="text-blue-200/70 text-[11px] uppercase tracking-wider font-medium">{stat.label}</div>
                                        </div>
                                    </div>
                                </RevealAfterSplash>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
