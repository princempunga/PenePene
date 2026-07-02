import React from 'react';
import { ShieldCheck, MapPin, MessageCircle, Zap } from 'lucide-react';
import SectionReveal from '../UI/SectionReveal';
import StaggerChildren, { StaggerItem } from '../UI/StaggerChildren';
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
        <SectionReveal className="py-10 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.1}>
                    {indicators.map((item, index) => (
                        <StaggerItem key={index}>
                            <div className="web-card flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-primary-100">
                                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center web-pulse">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerChildren>
            </div>
        </SectionReveal>
    );
}
