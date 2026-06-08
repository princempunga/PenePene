import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Search, MapPin, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/search', { q: searchQuery, location: location });
    };

    // Demo stats strip
    const stats = [
        { label: "Active Products", value: "25,000+", icon: <ShoppingBag size={18} className="text-primary-200" /> },
        { label: "Verified Sellers", value: "2,500+", icon: <Users size={18} className="text-primary-200" /> },
        { label: "Cities Covered", value: "20+", icon: <MapPin size={18} className="text-primary-200" /> },
    ];

    return (
        <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl"></div>
                <div className="absolute bottom-12 right-12 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-7 text-left"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                            Find trusted local sellers <span className="text-amber-400">near you.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl leading-relaxed">
                            Compare products, contact sellers directly, and buy with confidence on the fastest growing local marketplace.
                        </p>

                        {/* Search Box */}
                        <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 max-w-3xl mb-8">
                            <div className="relative flex-grow flex items-center">
                                <Search className="absolute left-4 text-gray-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="What are you looking for?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-medium"
                                />
                            </div>
                            <div className="hidden md:block w-px bg-gray-200 my-2"></div>
                            <div className="relative flex-grow md:max-w-[200px] flex items-center border-t border-gray-100 md:border-t-0">
                                <MapPin className="absolute left-4 text-gray-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Location (City)"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-medium"
                                />
                            </div>
                            <button 
                                onClick={handleSearch}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md w-full md:w-auto"
                            >
                                Search
                            </button>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-4">
                            <Link href="/products" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
                                <TrendingUp size={18} />
                                Browse Categories
                            </Link>
                            <Link href="/seller/register" className="text-primary-100 hover:text-white font-medium underline underline-offset-4 transition-colors">
                                Want to sell instead?
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Visuals (Product Cards floating) */}
                    <div className="hidden lg:block lg:col-span-5 relative h-[400px]">
                        {/* Card 1 */}
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="absolute top-0 right-10 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden z-20 border border-gray-100/50"
                        >
                            <div className="h-40 bg-gray-200 relative overflow-hidden">
                                <img src="/images/demo/phone.jpg" onError={(e) => { e.target.src = '/images/placeholder.jpg'; }} alt="Product" className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">HOT DEAL</div>
                            </div>
                            <div className="p-4">
                                <div className="text-xs text-primary-600 font-bold mb-1">ELECTRONICS</div>
                                <h4 className="font-bold text-gray-900 leading-tight mb-2">iPhone 14 Pro Max - 256GB</h4>
                                <div className="flex justify-between items-end">
                                    <span className="font-extrabold text-lg">$999</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10}/> New York</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div 
                            initial={{ y: 80, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="absolute bottom-10 left-0 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden z-10 border border-white/20"
                        >
                            <div className="h-32 bg-gray-200 relative">
                                <img src="/images/demo/watch.jpg" onError={(e) => { e.target.src = '/images/placeholder.jpg'; }} alt="Product" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3">
                                <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">Smart Watch Series 8</h4>
                                <span className="font-extrabold text-primary-600">$299</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Stats Strip */}
            <div className="absolute bottom-0 left-0 w-full border-t border-white/10 bg-black/10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-wrap justify-center lg:justify-start gap-8 lg:gap-16">
                        {stats.map((stat, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + (i * 0.1) }}
                                className="flex items-center gap-3"
                            >
                                {stat.icon}
                                <div>
                                    <div className="text-white font-bold">{stat.value}</div>
                                    <div className="text-primary-200 text-xs uppercase tracking-wider">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
