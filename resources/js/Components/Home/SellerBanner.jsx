import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, BarChart3, Megaphone } from 'lucide-react';

export default function SellerBanner() {
    const benefits = [
        { icon: <Users size={20} />, text: "Direct buyers" },
        { icon: <TrendingUp size={20} />, text: "More visibility" },
        { icon: <BarChart3 size={20} />, text: "Business analytics" },
        { icon: <Megaphone size={20} />, text: "Sponsored promotions" }
    ];

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-gray-900 to-gray-900 opacity-90 z-10"></div>
                <img 
                    src="/images/demo/seller-bg.jpg" 
                    onError={(e) => { e.target.style.display = 'none'; }}
                    alt="Seller background" 
                    className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                />
            </div>
            
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 bg-amber-400/20 text-amber-400 text-sm font-extrabold uppercase tracking-widest rounded-lg mb-6 border border-amber-400/30">
                            Sell on PenePene
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                            Join 2,500+ sellers growing their business.
                        </h2>
                        <p className="text-gray-300 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
                            Reach thousands of local buyers, manage your inventory easily, and multiply your sales with our premium merchant tools.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/seller/register" className="bg-primary-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-primary-500 transition-all text-center shadow-lg hover:shadow-primary-600/50 hover:-translate-y-1">
                                Register as a Seller
                            </Link>
                            <Link href="/pricing" className="bg-transparent text-white border-2 border-white/20 hover:border-white/50 hover:bg-white/5 font-bold py-4 px-8 rounded-xl transition-all text-center">
                                View Pricing Plans
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl"
                    >
                        <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Merchant Benefits</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-4 text-white group">
                                    <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                        {benefit.icon}
                                    </div>
                                    <span className="font-semibold text-lg">{benefit.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
