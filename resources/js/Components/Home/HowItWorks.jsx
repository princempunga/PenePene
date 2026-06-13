import React, { useState } from 'react';
import { Search, MessageCircle, Truck, Store, Package, HandCoins } from 'lucide-react';
import { motion } from 'framer-motion';
import useTranslation from '@/hooks/useTranslation';

export default function HowItWorks() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('buyers');

    const buyerSteps = [
        { icon: <Search size={32} />, title: t('home.buyer_step_1_title'), desc: t('home.buyer_step_1_desc') },
        { icon: <MessageCircle size={32} />, title: t('home.buyer_step_2_title'), desc: t('home.buyer_step_2_desc') },
        { icon: <Truck size={32} />, title: t('home.buyer_step_3_title'), desc: t('home.buyer_step_3_desc') },
    ];

    const sellerSteps = [
        { icon: <Store size={32} />, title: t('home.seller_step_1_title'), desc: t('home.seller_step_1_desc') },
        { icon: <Package size={32} />, title: t('home.seller_step_2_title'), desc: t('home.seller_step_2_desc') },
        { icon: <HandCoins size={32} />, title: t('home.seller_step_3_title'), desc: t('home.seller_step_3_desc') },
    ];

    const currentSteps = activeTab === 'buyers' ? buyerSteps : sellerSteps;

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{t('home.how_it_works_title')}</h2>
                <p className="text-gray-500 mb-10 max-w-2xl mx-auto">
                    {t('home.how_it_works_desc')}
                </p>

                <div className="flex justify-center mb-12">
                    <div className="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner">
                        <button 
                            onClick={() => setActiveTab('buyers')}
                            className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'buyers' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t('home.for_buyers')}
                        </button>
                        <button 
                            onClick={() => setActiveTab('sellers')}
                            className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'sellers' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t('home.for_sellers')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
                    <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gray-200 z-0"></div>

                    {currentSteps.map((step, index) => (
                        <motion.div 
                            key={`${activeTab}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
                            className="relative z-10 flex flex-col items-center group"
                        >
                            <div className="w-24 h-24 rounded-full bg-white shadow-lg border-4 border-gray-50 flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 group-hover:border-primary-100 group-hover:bg-primary-50 transition-all duration-300">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-gray-500 leading-relaxed px-4">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
