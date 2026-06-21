import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { MapPin, Star, ShieldCheck, Store } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function FeaturedSellersSection({ promotions = [] }) {
    const { t } = useTranslation();

    if (!promotions || promotions.length === 0) return null;

    const p1 = promotions[0];
    const p2 = promotions.length > 1 ? promotions[1] : promotions[0];
    const p3 = promotions.length > 2 ? promotions[2] : (promotions.length > 1 ? promotions[0] : promotions[0]);

    const formatPrice = (promo) => {
        return `${promo.product_currency || 'CDF'} ${parseFloat(promo.product_price).toLocaleString()}`;
    };

    const renderCard = (promo, positionClasses, animationClasses, delay, zIndex) => {
        if (!promo) return null;

        return (
            <motion.div
                initial={{ y: 50, opacity: 0, rotateY: -5 }}
                animate={{ y: 0, opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.9, delay, ease: 'easeOut' }}
                className={`absolute group ${positionClasses} ${animationClasses} ${zIndex}`}
            >
                <div className="bg-white rounded-2xl shadow-xl shadow-black/25 overflow-hidden border border-white/80 transition-all duration-500 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-2 cursor-pointer">

                    {/* ── Shop Name Banner (top, always visible) ── */}
                    {promo.seller_name && (
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-2.5 py-1.5 flex items-center gap-1.5">
                            <Store size={11} className="text-white/80 shrink-0" />
                            <span className="text-white font-bold text-[10px] sm:text-[11px] truncate tracking-wide uppercase">
                                {promo.seller_name}
                            </span>
                            {promo.seller_verified && (
                                <ShieldCheck size={11} className="text-green-300 shrink-0 ml-auto" />
                            )}
                        </div>
                    )}

                    {/* ── Product Image ── */}
                    <div className="h-28 sm:h-36 lg:h-40 relative overflow-hidden bg-gray-900/5">
                        <img
                            src={promo.product_image || '/images/demo-products/default.jpg'}
                            alt={promo.product_name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                        />
                        {/* Hot deal badge */}
                        <div className="absolute top-2 left-2">
                            <span className="bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                {t('home.hot_deal', 'Offre Chaude')}
                            </span>
                        </div>
                        {/* Category */}
                        {promo.category_name && (
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded">
                                {promo.category_name}
                            </div>
                        )}
                    </div>

                    {/* ── Product Info ── */}
                    <Link href={`/products/${promo.product_slug}`} className="block p-2.5 sm:p-3.5 hover:bg-gray-50 transition-colors">
                        <h4 className="font-bold text-gray-900 leading-tight mb-1.5 line-clamp-2 text-[11px] sm:text-sm">
                            {promo.product_name}
                        </h4>
                        <div className="flex justify-between items-center">
                            <span className="font-extrabold text-sm sm:text-base text-primary-600">
                                {formatPrice(promo)}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <MapPin size={9} />
                                <span className="truncate max-w-[55px] sm:max-w-[75px]">{promo.seller_city || 'Local'}</span>
                            </span>
                        </div>
                        {promo.seller_rating > 0 && (
                            <div className="flex items-center gap-0.5 mt-1.5">
                                {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={9} className={s <= Math.round(promo.seller_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                                ))}
                                <span className="text-[9px] text-gray-500 ml-1 font-medium">{Number(promo.seller_rating).toFixed(1)}</span>
                            </div>
                        )}
                    </Link>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="relative w-full h-full max-w-[340px] sm:max-w-[420px] mx-auto lg:max-w-none">
            {/* Card 1 (Back left) */}
            {renderCard(
                p1,
                "top-0 left-0 w-[160px] sm:w-[200px] lg:w-[232px]",
                "hero-float-slow opacity-95",
                0.3,
                "z-10"
            )}

            {/* Card 2 (Bottom left/center) */}
            {renderCard(
                p2,
                "bottom-0 sm:bottom-6 left-6 sm:left-12 lg:left-4 w-[180px] sm:w-[220px] lg:w-[250px]",
                "hero-float",
                0.5,
                "z-20"
            )}

            {/* Card 3 (Front right) */}
            {renderCard(
                p3,
                "top-12 sm:top-16 right-0 lg:right-6 w-[200px] sm:w-[240px] lg:w-[272px]",
                "hero-float-slow",
                0.7,
                "z-30"
            )}

            {/* ── Floating "Vendeurs Vérifiés" badge ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="hero-float-slow absolute top-[210px] left-[-10px] sm:left-0 z-40 hidden sm:block"
            >
                <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                            <ShieldCheck size={16} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-white text-[10px] sm:text-xs font-bold">{t('home.verified_sellers_badge', 'Vendeurs Vérifiés')}</p>
                            <p className="text-blue-200 text-[9px] sm:text-[10px]">{t('home.trusted_100', '100% de confiance')}</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
