import React, { useState, useEffect, useMemo } from 'react';
import useTranslation from '@/hooks/useTranslation';
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
    const { t } = useTranslation();

    const storyFeatures = useMemo(() => [
        { icon: Shield, color: 'bg-blue-500', title: t('about.feature_verified_title'), desc: t('about.feature_verified_desc') },
        { icon: Zap, color: 'bg-amber-500', title: t('about.feature_fast_title'), desc: t('about.feature_fast_desc') },
        { icon: Heart, color: 'bg-red-500', title: t('about.feature_community_title'), desc: t('about.feature_community_desc') },
        { icon: Globe, color: 'bg-green-500', title: t('about.feature_nationwide_title'), desc: t('about.feature_nationwide_desc') },
    ], [t]);

    const values = useMemo(() => [
        { icon: Shield, color: 'bg-blue-500', title: t('about.value_trust_title'), desc: t('about.value_trust_desc') },
        { icon: Heart, color: 'bg-red-500', title: t('about.value_community_title'), desc: t('about.value_community_desc') },
        { icon: TrendingUp, color: 'bg-green-500', title: t('about.value_growth_title'), desc: t('about.value_growth_desc') },
        { icon: Zap, color: 'bg-amber-500', title: t('about.value_simplicity_title'), desc: t('about.value_simplicity_desc') },
        { icon: Star, color: 'bg-purple-500', title: t('about.value_quality_title'), desc: t('about.value_quality_desc') },
        { icon: Users, color: 'bg-indigo-500', title: t('about.value_inclusion_title'), desc: t('about.value_inclusion_desc') },
    ], [t]);

    const sellerBenefits = t('about.seller_benefits') || [];
    const sellerStats = t('about.seller_stats') || [];
    const buyerFeatures = t('about.buyer_features') || [];

    const buyerFeatureIcons = [Shield, Search, Heart, Star, MessageCircle, Package];
    const buyerFeatureColors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-amber-500', 'bg-purple-500', 'bg-indigo-500'];
    const sellerStatColors = ['text-amber-600 bg-amber-50', 'text-green-600 bg-green-50', 'text-blue-600 bg-blue-50', 'text-purple-600 bg-purple-50'];

    return (
        <AppLayout>
            <Head title={t('about.page_title')} />

            <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <Store size={16} />
                        <span>{t('about.hero_badge')}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                        {t('about.hero_title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
                        {t('about.hero_subtitle')}
                        {t('about.hero_subtitle_emphasis') && t('about.hero_subtitle_emphasis') !== 'about.hero_subtitle_emphasis' && (
                            <> <em className="text-amber-400 not-italic font-bold">{t('about.hero_subtitle_emphasis')}</em>.</>
                        )}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/products" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5">
                            {t('about.start_shopping')} <ArrowRight size={18} />
                        </Link>
                        <Link href="/become-a-seller" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border border-white/20 transition-all">
                            {t('about.become_seller')}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t('about.stats_title')}</h2>
                        <p className="text-gray-500 mt-3 text-lg">{t('about.stats_subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard number="5000+" label={t('about.stat_products')} icon={Package} color="bg-blue-500" />
                        <StatCard number="500+" label={t('about.stat_sellers')} icon={Store} color="bg-amber-500" />
                        <StatCard number="10000+" label={t('about.stat_buyers')} icon={Users} color="bg-green-500" />
                        <StatCard number="15+" label={t('about.stat_cities')} icon={MapPin} color="bg-purple-500" />
                    </div>
                </div>
            </section>

            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-5">
                                <Target size={16} /> {t('about.story_badge')}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                                {t('about.story_title')} <br />
                                <span className="text-primary-600">{t('about.story_title_highlight')}</span>
                            </h2>
                            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                                <p>{t('about.story_p1')}</p>
                                <p>
                                    <strong className="text-gray-900">{t('about.story_p2_brand')}</strong> — {t('about.story_p2_meaning')} {t('about.story_p2_after')}
                                </p>
                                <p>{t('about.story_p3')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {storyFeatures.map(v => (
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

            <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center mb-5">
                                <Target size={24} className="text-amber-300" />
                            </div>
                            <h3 className="text-2xl font-extrabold mb-3">{t('about.mission_title')}</h3>
                            <p className="text-white/80 leading-relaxed text-lg">{t('about.mission_text')}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center mb-5">
                                <Eye size={24} className="text-green-300" />
                            </div>
                            <h3 className="text-2xl font-extrabold mb-3">{t('about.vision_title')}</h3>
                            <p className="text-white/80 leading-relaxed text-lg">{t('about.vision_text')}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <Heart size={16} /> {t('about.values_badge')}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t('about.values_title')}</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {values.map(v => (
                            <ValueCard key={v.title} icon={v.icon} color={v.color} title={v.title} description={v.desc} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <Zap size={16} /> {t('about.how_badge')}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t('about.how_title')}</h2>
                        <p className="text-gray-500 mt-3 max-w-xl mx-auto">{t('about.how_subtitle')}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary-200 to-primary-200 z-0" />
                        <StepCard step={1} icon={Search} color="bg-primary-600" title={t('about.step1_title')} description={t('about.step1_desc')} />
                        <StepCard step={2} icon={MessageCircle} color="bg-amber-500" title={t('about.step2_title')} description={t('about.step2_desc')} />
                        <StepCard step={3} icon={ShoppingCart} color="bg-green-500" title={t('about.step3_title')} description={t('about.step3_desc')} />
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-20 border-y border-amber-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-5">
                                <Store size={16} /> {t('about.seller_badge')}
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">{t('about.seller_title')}</h2>
                            <div className="space-y-4">
                                {Array.isArray(sellerBenefits) && sellerBenefits.map(item => (
                                    <div key={item} className="flex items-start gap-3">
                                        <CheckCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Link href="/become-a-seller" className="inline-flex items-center gap-2 mt-8 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5">
                                {t('about.become_seller')} <ArrowRight size={18} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {Array.isArray(sellerStats) && sellerStats.map((s, i) => (
                                <div key={s.label} className={`rounded-2xl p-6 ${sellerStatColors[i]?.split(' ')[1] || 'bg-gray-50'} border border-gray-100 text-center`}>
                                    <div className={`text-4xl font-extrabold ${sellerStatColors[i]?.split(' ')[0] || 'text-gray-900'} mb-1`}>{s.value}</div>
                                    <div className="text-gray-600 text-sm font-medium">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl p-8 grid grid-cols-2 gap-4">
                            {Array.isArray(buyerFeatures) && buyerFeatures.map((label, i) => {
                                const Icon = buyerFeatureIcons[i] || Package;
                                const color = buyerFeatureColors[i] || 'bg-blue-500';
                                return (
                                    <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                                        <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            <Icon size={16} className="text-white" />
                                        </div>
                                        <span className="text-gray-700 text-sm font-medium">{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-5">
                                <ShoppingBag size={16} /> {t('about.buyer_badge')}
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">{t('about.buyer_title')}</h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">{t('about.buyer_desc')}</p>
                            <Link href="/products" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5">
                                {t('about.start_shopping')} <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-br from-gray-900 to-primary-900 py-20 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-5">
                        {t('about.cta_title')} <span className="text-amber-400">{t('about.cta_title_highlight')}</span>
                    </h2>
                    <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">{t('about.cta_subtitle')}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/products" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 text-lg">
                            <ShoppingBag size={20} /> {t('about.start_shopping')}
                        </Link>
                        <Link href="/become-a-seller" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border border-white/20 transition-all text-lg">
                            <Store size={20} /> {t('about.become_seller')}
                        </Link>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
