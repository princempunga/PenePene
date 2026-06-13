import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import FlashDealCard from './FlashDealCard';

function CountdownUnit({ value, label }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="min-w-[52px] sm:min-w-[56px] bg-white text-[#EF4444] font-bold text-base sm:text-xl px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-md text-center tabular-nums">
                {value}
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80">{label}</span>
        </div>
    );
}

export default function FlashDeals({ products }) {
    const { t } = useTranslation();

    const [timeLeft, setTimeLeft] = useState({
        hours: 12,
        minutes: 45,
        seconds: 11,
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                }
                if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                }
                if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return { hours: 24, minutes: 0, seconds: 0 };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!products || products.length === 0) {
        return null;
    }

    const pad = (num) => String(num).padStart(2, '0');

    return (
        <section
            className="py-10 sm:py-14 lg:py-20 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0F2D7A 0%, #1E4ED8 100%)' }}
        >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2563EB]/30 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#F59E0B]/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                                <Flame size={22} className="sm:w-[26px] sm:h-[26px] text-[#F59E0B]" fill="currentColor" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                                    {t('home.flash_deals')}
                                </h2>
                                <p className="text-blue-100/90 text-xs sm:text-sm mt-0.5 sm:mt-1 max-w-md">
                                    {t('home.flash_deals_subtitle')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-end gap-1.5 sm:gap-3 pl-0 sm:pl-2">
                            <CountdownUnit value={pad(timeLeft.hours)} label={t('home.countdown_hours')} />
                            <span className="text-white/60 font-bold text-xl pb-6 hidden sm:inline">:</span>
                            <CountdownUnit value={pad(timeLeft.minutes)} label={t('home.countdown_minutes')} />
                            <span className="text-white/60 font-bold text-xl pb-6 hidden sm:inline">:</span>
                            <CountdownUnit value={pad(timeLeft.seconds)} label={t('home.countdown_seconds')} />
                        </div>
                    </div>

                    <Link
                        href="/products?filter=sale"
                        className="inline-flex items-center justify-center gap-2 self-start lg:self-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 group"
                    >
                        {t('home.view_all_deals')}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-5 max-md:flex max-md:overflow-x-auto max-md:pb-4 max-md:-mx-4 max-md:px-4 max-md:snap-x max-md:snap-mandatory hide-scrollbar">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
                            className="max-md:w-[72vw] max-md:max-w-[240px] max-md:flex-shrink-0 max-md:snap-start md:w-full h-full min-w-0"
                        >
                            <FlashDealCard product={product} />
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .flash-deal-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .flash-deal-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }
            `}</style>
        </section>
    );
}
