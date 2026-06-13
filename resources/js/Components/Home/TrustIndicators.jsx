import React from 'react';
import { ShieldCheck, MapPin, MessageCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import useTranslation from '@/hooks/useTranslation';

export default function TrustIndicators() {
    const { t } = useTranslation();

    const indicators = [
        {
            icon: <ShieldCheck className="w-8 h-8 text-primary-600" />,
            title: t('home.trust_verified_sellers'),
            description: t('home.trust_verified_sellers_desc'),
        },
        {
            icon: <MapPin className="w-8 h-8 text-primary-600" />,
            title: t('home.trust_local_marketplace'),
            description: t('home.trust_local_marketplace_desc'),
        },
        {
            icon: <MessageCircle className="w-8 h-8 text-primary-600" />,
            title: t('home.trust_direct_contact'),
            description: t('home.trust_direct_contact_desc'),
        },
        {
            icon: <Zap className="w-8 h-8 text-primary-600" />,
            title: t('home.trust_fast_discovery'),
            description: t('home.trust_fast_discovery_desc'),
        },
    ];

    return (
        <section className="py-10 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {indicators.map((item, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
