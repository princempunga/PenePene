import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
    return (
        <div className="relative bg-primary-900 overflow-hidden">
            <div className="absolute inset-0">
                <img 
                    src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                    alt="Marketplace background" 
                    className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-900/80 to-transparent"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl"
                >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
                        Find Everything You Need, <span className="text-primary-400">Locally.</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-primary-100 mb-8 max-w-xl">
                        PenePene is your trusted local marketplace to buy and sell products. Connect directly with sellers in your area.
                    </p>

                    <div className="bg-white p-2 rounded-lg shadow-lg flex flex-col sm:flex-row gap-2 max-w-2xl">
                        <div className="flex-1 flex items-center bg-gray-50 rounded-md px-3 border border-gray-200">
                            <Search className="text-gray-400 shrink-0" size={20} />
                            <input 
                                type="text" 
                                placeholder="What are you looking for?" 
                                className="w-full bg-transparent border-none focus:ring-0 px-3 py-3 outline-none text-gray-700"
                            />
                        </div>
                        <div className="sm:w-1/3 flex items-center bg-gray-50 rounded-md px-3 border border-gray-200 hidden md:flex">
                            <MapPin className="text-gray-400 shrink-0" size={20} />
                            <input 
                                type="text" 
                                placeholder="City or Region" 
                                className="w-full bg-transparent border-none focus:ring-0 px-3 py-3 outline-none text-gray-700"
                            />
                        </div>
                        <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-md transition-colors flex items-center justify-center gap-2">
                            Search
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    <div className="mt-8 flex items-center gap-4 text-sm text-primary-200">
                        <span className="font-semibold text-white">Popular:</span>
                        <Link href="/search?q=smartphones" className="hover:text-white underline decoration-primary-400/30 underline-offset-4">Smartphones</Link>
                        <Link href="/search?q=laptops" className="hover:text-white underline decoration-primary-400/30 underline-offset-4">Laptops</Link>
                        <Link href="/search?q=fashion" className="hover:text-white underline decoration-primary-400/30 underline-offset-4">Fashion</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
