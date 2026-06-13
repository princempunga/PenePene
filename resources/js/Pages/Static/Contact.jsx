import React, { useState, useMemo } from 'react';
import useTranslation from '@/hooks/useTranslation';
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
    const { t } = useTranslation();
    const [form, setForm] = useState({ name: '', email: '', subject: '', category: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const faqItems = t('contact.faq') || [];

    const categories = useMemo(() => [
        { icon: ShoppingBag, title: t('contact.cat_buyer_title'), description: t('contact.cat_buyer_desc'), color: 'bg-blue-500', bg: 'bg-blue-50' },
        { icon: Store, title: t('contact.cat_seller_title'), description: t('contact.cat_seller_desc'), color: 'bg-amber-500', bg: 'bg-amber-50' },
        { icon: Package, title: t('contact.cat_orders_title'), description: t('contact.cat_orders_desc'), color: 'bg-green-500', bg: 'bg-green-50' },
        { icon: User, title: t('contact.cat_account_title'), description: t('contact.cat_account_desc'), color: 'bg-purple-500', bg: 'bg-purple-50' },
        { icon: Wrench, title: t('contact.cat_technical_title'), description: t('contact.cat_technical_desc'), color: 'bg-red-500', bg: 'bg-red-50' },
    ], [t]);

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = e => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { setLoading(false); setSent(true); }, 1500);
    };

    return (
        <AppLayout>
            <Head title={t('contact.page_title')} />

            <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <MessageCircle size={16} />
                        <span>{t('contact.hero_badge')}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
                        {t('contact.hero_title')}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                        {t('contact.hero_subtitle')}
                    </p>
                </div>
            </section>

            <section className="bg-gray-50 py-14">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-extrabold text-gray-900">{t('contact.categories_title')}</h2>
                        <p className="text-gray-500 mt-2">{t('contact.categories_subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {categories.map(cat => (
                            <CategoryCard key={cat.title} icon={cat.icon} title={cat.title} description={cat.description} color={cat.color} bg={cat.bg} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-5 gap-12">
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{t('contact.form_title')}</h2>
                                <p className="text-gray-500 mb-8">{t('contact.form_subtitle')}</p>

                                {sent ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                                            <CheckCircle size={40} className="text-green-500" />
                                        </div>
                                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{t('contact.form_sent_title')}</h3>
                                        <p className="text-gray-500 max-w-sm">{t('contact.form_sent_desc')}</p>
                                        <button onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', category:'', message:'' }); }} className="mt-6 text-primary-600 font-semibold hover:underline">
                                            {t('contact.form_send_another')}
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.label_name')} <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text" name="name" value={form.name} onChange={handleChange} required
                                                    placeholder={t('contact.placeholder_name')}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.label_email')} <span className="text-red-500">*</span></label>
                                                <input
                                                    type="email" name="email" value={form.email} onChange={handleChange} required
                                                    placeholder={t('contact.placeholder_email')}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.label_subject')} <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text" name="subject" value={form.subject} onChange={handleChange} required
                                                    placeholder={t('contact.placeholder_subject')}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.label_category')}</label>
                                                <select
                                                    name="category" value={form.category} onChange={handleChange}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-700 bg-white"
                                                >
                                                    <option value="">{t('contact.category_select')}</option>
                                                    <option value="buyer">{t('contact.category_buyer')}</option>
                                                    <option value="seller">{t('contact.category_seller')}</option>
                                                    <option value="orders">{t('contact.category_orders')}</option>
                                                    <option value="account">{t('contact.category_account')}</option>
                                                    <option value="technical">{t('contact.category_technical')}</option>
                                                    <option value="other">{t('contact.category_other')}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.label_message')} <span className="text-red-500">*</span></label>
                                            <textarea
                                                name="message" value={form.message} onChange={handleChange} required
                                                rows={5} placeholder={t('contact.placeholder_message')}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-900 resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit" disabled={loading}
                                            className="w-full flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg text-lg"
                                        >
                                            {loading ? (
                                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('contact.sending')}</>
                                            ) : (
                                                <><Send size={20} /> {t('contact.send_message')}</>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-5">
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-5">{t('contact.info_title')}</h3>
                                <div className="space-y-4">
                                    <InfoCard icon={Mail} color="bg-primary-600" title={t('contact.info_email_title')} value={t('contact.info_email_value')} sub={t('contact.info_email_sub')} />
                                    <InfoCard icon={Phone} color="bg-green-500" title={t('contact.info_phone_title')} value={t('contact.info_phone_value')} sub={t('contact.info_phone_sub')} />
                                    <InfoCard icon={MapPin} color="bg-red-500" title={t('contact.info_hq_title')} value={t('contact.info_hq_value')} sub={t('contact.info_hq_sub')} />
                                    <InfoCard icon={Clock} color="bg-amber-500" title={t('contact.info_hours_title')} value={t('contact.info_hours_value')} sub={t('contact.info_hours_sub')} />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                    <HelpCircle size={20} className="text-white" />
                                </div>
                                <h4 className="text-lg font-extrabold mb-2">{t('contact.help_cta_title')}</h4>
                                <p className="text-white/80 text-sm mb-4 leading-relaxed">{t('contact.help_cta_desc')}</p>
                                <Link href="/help-center" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                                    {t('contact.help_cta_button')} <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-extrabold text-gray-900">{t('contact.faq_title')}</h2>
                        <p className="text-gray-500 mt-2">{t('contact.faq_subtitle')}</p>
                    </div>
                    <div className="space-y-3">
                        {Array.isArray(faqItems) && faqItems.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)}
                    </div>
                    <div className="text-center mt-8">
                        <Link href="/help-center" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:underline">
                            {t('contact.faq_see_all')} <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
