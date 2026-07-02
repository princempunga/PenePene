import React, { useState, useRef, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { Search, MapPin, TrendingUp, Users, ShoppingBag, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import useTranslation from '@/hooks/useTranslation';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { DURATION } from '@/lib/premiumMotion';
import { RevealAfterSplash } from '@/Components/UI/RevealAfterSplash';

const HERO_AUTOPLAY_MS = 4500;

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

function HeroCarouselSlide({ promo, isActive, t }) {
    return (
        <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                <div className="h-3/5 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    <img
                        src={promo?.custom_image_url || promo?.product_image || '/images/demo-products/default.jpg'}
                        alt={promo?.product_name || 'Promotion'}
                        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isActive ? 'scale-105' : 'scale-100'}`}
                        loading={isActive ? 'eager' : 'lazy'}
                        decoding="async"
                        onError={(e) => { e.target.src = '/images/demo-products/default.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {promo?.headline && (
                        <motion.div
                            initial={false}
                            animate={{ opacity: isActive ? 1 : 0.7, y: isActive ? 0 : 6 }}
                            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                            className="absolute top-4 left-4 right-4"
                        >
                            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg shadow-lg">
                                <p className="text-sm font-bold">{promo.headline}</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/70 rounded-lg px-3 py-2 flex items-center gap-2">
                            <Store size={14} className="text-amber-400 shrink-0" />
                            <span className="text-white text-xs font-semibold truncate">
                                {promo?.seller_name || 'Vendeur'}
                            </span>
                            {promo?.seller_verified && (
                                <ShieldCheck size={14} className="text-green-400 shrink-0 ml-auto" />
                            )}
                        </div>
                    </div>

                    <div className="absolute top-4 right-4">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                            {t('home.hot_deal', 'Offre Chaude')}
                        </span>
                    </div>
                </div>

                <div className="h-2/5 p-5 flex flex-col justify-between">
                    <div>
                        <Link href={`/products/${promo?.product_slug}`} className="block hover:opacity-80 transition-opacity duration-300">
                            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 line-clamp-2">
                                {promo?.product_name}
                            </h3>
                        </Link>
                        {promo?.category_name && (
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                {promo.category_name}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-2xl font-extrabold text-primary-600">
                            {promo?.product_currency || 'CDF'} {parseFloat(promo?.product_price || 0).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <MapPin size={12} />
                            <span>{promo?.seller_city || 'Local'}</span>
                        </div>
                    </div>
                </div>
        </div>
    );
}

export default function HeroSection({ heroProducts = [], featuredPromotions = [] }) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const heroRef = useRef(null);
    const carouselViewportRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideWidth, setSlideWidth] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const prefersReducedMotion = useReducedMotion();

    const slides = featuredPromotions.slice(0, 4);

    useEffect(() => {
        const node = carouselViewportRef.current;
        if (!node) return undefined;

        const measure = () => {
            const width = node.getBoundingClientRect().width;
            if (width > 0) setSlideWidth(width);
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        window.addEventListener('resize', measure);

        const afterSplash = setTimeout(measure, 900);
        const raf = requestAnimationFrame(measure);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
            clearTimeout(afterSplash);
            cancelAnimationFrame(raf);
        };
    }, []);

    useEffect(() => {
        setCurrentIndex((prev) => (slides.length === 0 ? 0 : Math.min(prev, slides.length - 1)));
    }, [slides.length]);

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlaying || slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, HERO_AUTOPLAY_MS);

        return () => clearInterval(interval);
    }, [isAutoPlaying, slides.length]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 10 seconds of inactivity
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goToPrevious = () => {
        const newIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
        goToSlide(newIndex);
    };

    const goToNext = () => {
        const newIndex = (currentIndex + 1) % slides.length;
        goToSlide(newIndex);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/search', { q: searchQuery, location: location });
    };

    const translateX = slideWidth > 0 ? -currentIndex * slideWidth : 0;
    const carouselTransition = prefersReducedMotion
        ? { duration: 0.25, ease: EASE_OUT_EXPO }
        : { duration: DURATION.normal, ease: EASE_OUT_EXPO };

    // Stats strip
    const stats = [
        { label: t('home.active_products'), value: "25,000+", icon: <ShoppingBag size={18} className="text-amber-300" /> },
        { label: t('home.verified_sellers'), value: "2,500+", icon: <Users size={18} className="text-amber-300" /> },
        { label: t('home.cities_covered'), value: "20+", icon: <MapPin size={18} className="text-amber-300" /> },
    ];



    return (
        <div ref={heroRef} className="relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/hero-marketplace.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            </div>

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
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 lg:pt-24 lg:pb-36">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                    {/* ── Left Content ── */}
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
                                className="web-btn web-shine premium-cta bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary-600/40 flex items-center justify-center gap-2"
                            >
                                <Search size={18} />
                                {t('nav.search')}
                            </button>
                            </div>
                        </RevealAfterSplash>

                        <RevealAfterSplash delay={0.85} direction="up">
                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                href="/products"
                                className="group bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5"
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
                        </RevealAfterSplash>
                    </div>

                    {/* ── Right Side: Hero Carousel ── */}
                    <RevealAfterSplash
                        delay={0.45}
                        direction="right"
                        className="w-full lg:col-span-5 relative h-[380px] sm:h-[460px] mt-12 lg:mt-0"
                    >
                        {slides.length > 0 ? (
                            <div className="relative w-full h-full hero-carousel">
                                <div
                                    ref={carouselViewportRef}
                                    className="w-full h-full overflow-hidden rounded-2xl"
                                >
                                    <motion.div
                                        className="flex h-full hero-carousel-track"
                                        initial={false}
                                        animate={{ x: translateX }}
                                        transition={carouselTransition}
                                    >
                                        {slides.map((promo, index) => (
                                            <div
                                                key={promo.id ?? promo.product_id ?? index}
                                                className="h-full flex-shrink-0"
                                                style={{ width: slideWidth > 0 ? slideWidth : '100%' }}
                                            >
                                                <HeroCarouselSlide
                                                    promo={promo}
                                                    isActive={index === currentIndex}
                                                    t={t}
                                                />
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>

                                {slides.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={goToPrevious}
                                            className="web-slider-btn absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-transform hover:scale-105"
                                            aria-label="Précédent"
                                        >
                                            <ChevronLeft size={20} className="text-gray-700" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={goToNext}
                                            className="web-slider-btn absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-transform hover:scale-105"
                                            aria-label="Suivant"
                                        >
                                            <ChevronRight size={20} className="text-gray-700" />
                                        </button>
                                    </>
                                )}

                                {slides.length > 1 && (
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                                        {slides.map((_, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => goToSlide(index)}
                                                className="p-1"
                                                aria-label={`Slide ${index + 1}`}
                                            >
                                                <span
                                                    className="block h-1.5 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: index === currentIndex ? 28 : 8,
                                                        backgroundColor: index === currentIndex
                                                            ? 'rgb(0 86 179)'
                                                            : 'rgba(255,255,255,0.45)',
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Fallback: No promotions */
                            <div className="flex items-center justify-center h-full bg-white/10 rounded-2xl border border-white/20">
                                <p className="text-white/80 text-center">{t('home.no_promotions', 'Aucune promotion disponible')}</p>
                            </div>
                        )}
                    </RevealAfterSplash>
                </div>
            </div>

            {/* ── Stats Strip ── */}
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
