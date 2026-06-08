import React from 'react';
import { ShieldCheck, MapPin, MessageCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrustIndicators() {
    const indicators = [
        {
            icon: <ShieldCheck className="w-8 h-8 text-primary-600" />,
            title: "Verified Sellers",
            description: "Shop with confidence from approved local businesses."
        },
        {
            icon: <MapPin className="w-8 h-8 text-primary-600" />,
            title: "Local Marketplace",
            description: "Find products and services right in your neighborhood."
        },
        {
            icon: <MessageCircle className="w-8 h-8 text-primary-600" />,
            title: "Direct Contact",
            description: "Chat directly with sellers with zero hidden fees."
        },
        {
            icon: <Zap className="w-8 h-8 text-primary-600" />,
            title: "Fast Discovery",
            description: "Smart search to find exactly what you need, instantly."
        }
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
