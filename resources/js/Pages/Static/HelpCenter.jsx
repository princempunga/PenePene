import React, { useState, useMemo } from 'react';
import useTranslation from '@/hooks/useTranslation';
import { Link, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Search, HelpCircle, ShoppingBag, Store, Package, User,
    Shield, CreditCard, List, MessageCircle, ChevronDown,
    ChevronUp, ArrowRight, BookOpen, Play, Star, Zap,
    CheckCircle, ExternalLink
} from 'lucide-react';

const CATEGORY_ICONS = [Play, ShoppingBag, Store, Package, Shield, CreditCard, List, MessageCircle];
const CATEGORY_COLORS = [
    { color: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-100' },
    { color: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { color: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { color: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    { color: 'bg-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
    { color: 'bg-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { color: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    { color: 'bg-teal-500', bg: 'bg-teal-50', border: 'border-teal-100' },
];

const POPULAR_ICONS = [User, Store, Search, Package, Shield, MessageCircle];
const CTA_ICONS = [Zap, Shield, CheckCircle];

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

    const Icon = cat.icon;

    return (
        <div className={`${cat.bg} rounded-2xl p-6 border ${cat.border} hover:shadow-lg transition-all hover:-translate-y-1 group`}>
            <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white" />
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

export default function HelpCenter() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [faqSearch, setFaqSearch] = useState('');

    const categories = useMemo(() => {
        const raw = t('help.categories') || [];
        if (!Array.isArray(raw)) return [];
        return raw.map((cat, i) => ({
            ...cat,
            icon: CATEGORY_ICONS[i] || HelpCircle,
            ...CATEGORY_COLORS[i],
        }));
    }, [t]);

    const faqData = t('help.faq') || [];
    const quickLinks = t('help.quick_links') || [];
    const popularArticles = t('help.popular_articles') || [];
    const ctaFeatures = t('help.cta_features') || [];

    const filteredFaqs = Array.isArray(faqData) ? faqData.filter(f =>
        !faqSearch || f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())
    ) : [];

    return (
        <AppLayout>
            <Head title={t('help.page_title')} />

            <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <HelpCircle size={16} /> {t('help.hero_badge')}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
                        {t('help.hero_title')}
                    </h1>
                    <p className="text-gray-300 mb-10 text-lg">
                        {t('help.hero_subtitle')}
                    </p>

                    <div className="relative max-w-2xl mx-auto">
                        <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('help.search_placeholder')}
                            className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white text-gray-900 text-lg placeholder-gray-400 shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/40 border-0"
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        {Array.isArray(quickLinks) && quickLinks.map(term => (
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

            <section className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    {!searchQuery && (
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{t('help.topics_title')}</h2>
                            <p className="text-gray-500 mt-2">{t('help.topics_subtitle')}</p>
                        </div>
                    )}
                    {searchQuery && (
                        <div className="mb-8">
                            <p className="text-gray-600">
                                {t('help.search_results')} <strong className="text-gray-900">"{searchQuery}"</strong>
                                <button onClick={() => setSearchQuery('')} className="ml-3 text-primary-600 hover:underline text-sm">{t('help.search_clear')}</button>
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

            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">{t('help.popular_title')}</h2>
                            <p className="text-gray-500 mt-1">{t('help.popular_subtitle')}</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.isArray(popularArticles) && popularArticles.map((article, i) => {
                            const Icon = POPULAR_ICONS[i] || HelpCircle;
                            return (
                                <div key={article.title} className="flex items-start gap-4 p-5 border border-gray-100 rounded-xl hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                                        <Icon size={18} className="text-primary-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors leading-snug">{article.title}</h4>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{article.tag}</span>
                                            <span className="text-xs text-gray-400">{article.views} {t('help.popular_views')}</span>
                                        </div>
                                    </div>
                                    <ExternalLink size={14} className="text-gray-300 group-hover:text-primary-400 flex-shrink-0 mt-1" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <BookOpen size={16} /> {t('help.faq_badge')}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{t('help.faq_title')}</h2>
                        <p className="text-gray-500 mt-2">{t('help.faq_subtitle')}</p>
                    </div>

                    <div className="relative mb-6">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text" value={faqSearch} onChange={e => setFaqSearch(e.target.value)}
                            placeholder={t('help.faq_search_placeholder')}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 placeholder-gray-400"
                        />
                    </div>

                    <div className="space-y-3">
                        {filteredFaqs.length > 0
                            ? filteredFaqs.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)
                            : (
                                <div className="text-center py-10 text-gray-400">
                                    <HelpCircle size={40} className="mx-auto mb-3 opacity-30" />
                                    <p>{t('help.faq_no_results')}</p>
                                </div>
                            )
                        }
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-br from-gray-900 to-primary-900 py-20 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <MessageCircle size={32} className="text-amber-400" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                        {t('help.cta_title')}
                    </h2>
                    <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
                        {t('help.cta_subtitle')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/contact" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 text-lg">
                            <MessageCircle size={20} /> {t('help.cta_contact')}
                        </Link>
                        <Link href="/faq" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border border-white/20 transition-all text-lg">
                            <BookOpen size={20} /> {t('help.cta_full_faq')}
                        </Link>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
                        {Array.isArray(ctaFeatures) && ctaFeatures.map((item, i) => {
                            const Icon = CTA_ICONS[i] || CheckCircle;
                            return (
                                <div key={item.label} className="bg-white/5 rounded-xl p-5 border border-white/10">
                                    <Icon size={24} className="text-amber-400 mx-auto mb-2" />
                                    <div className="font-bold text-sm">{item.label}</div>
                                    <div className="text-gray-400 text-xs mt-0.5">{item.sub}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
