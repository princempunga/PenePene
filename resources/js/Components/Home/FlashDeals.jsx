import React, { useState, useEffect } from 'react';
import ProductCard from '../Product/ProductCard';
import { motion } from 'framer-motion';
import { Timer, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function FlashDeals({ products }) {
    if (!products || products.length === 0) return null;

    // Demo countdown timer
    const [timeLeft, setTimeLeft] = useState({
        hours: 12,
        minutes: 45,
        seconds: 30
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return { hours: 24, minutes: 0, seconds: 0 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const pad = (num) => String(num).padStart(2, '0');

    return (
        <section className="py-16 bg-gradient-to-br from-red-600 to-red-800 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                        <div>
                            <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
                                <Timer size={32} className="text-yellow-400" />
                                Flash Deals
                            </h2>
                            <p className="text-red-100 mt-1">Hurry up! These deals end soon.</p>
                        </div>
                        
                        {/* Timer */}
                        <div className="flex items-center gap-2">
                            <div className="bg-white text-red-700 font-bold text-xl px-3 py-2 rounded-lg shadow-lg">
                                {pad(timeLeft.hours)}
                            </div>
                            <span className="text-white font-bold text-xl">:</span>
                            <div className="bg-white text-red-700 font-bold text-xl px-3 py-2 rounded-lg shadow-lg">
                                {pad(timeLeft.minutes)}
                            </div>
                            <span className="text-white font-bold text-xl">:</span>
                            <div className="bg-white text-red-700 font-bold text-xl px-3 py-2 rounded-lg shadow-lg w-12 text-center">
                                {pad(timeLeft.seconds)}
                            </div>
                        </div>
                    </div>
                    
                    <Link 
                        href="/products?filter=sale" 
                        className="text-white hover:text-yellow-300 font-semibold group transition-colors flex items-center"
                    >
                        View all deals
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                
                <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 snap-x snap-mandatory hide-scrollbar">
                    {products.map((product, index) => (
                        <motion.div 
                            key={product.id} 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: index * 0.1, type: "spring" }}
                            className="min-w-[280px] sm:min-w-0 flex-shrink-0 snap-start h-full"
                        >
                            <ProductCard product={product} badge="Flash Deal" />
                        </motion.div>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}
