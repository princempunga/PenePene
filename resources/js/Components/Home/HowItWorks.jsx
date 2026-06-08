import React, { useState } from 'react';
import { Search, MessageCircle, Truck, Store, Package, HandCoins } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
    const [activeTab, setActiveTab] = useState('buyers');

    const buyerSteps = [
        { icon: <Search size={32} />, title: '1. Search Products', desc: 'Find thousands of products across multiple categories.' },
        { icon: <MessageCircle size={32} />, title: '2. Contact Seller', desc: 'Chat directly with the seller to negotiate or confirm details.' },
        { icon: <Truck size={32} />, title: '3. Order & Receive', desc: 'Arrange delivery and pay securely.' }
    ];

    const sellerSteps = [
        { icon: <Store size={32} />, title: '1. Register Store', desc: 'Create your business profile in minutes.' },
        { icon: <Package size={32} />, title: '2. Publish Products', desc: 'Upload your catalog and reach thousands of buyers.' },
        { icon: <HandCoins size={32} />, title: '3. Receive Orders', desc: 'Grow your sales and manage everything from your dashboard.' }
    ];

    const currentSteps = activeTab === 'buyers' ? buyerSteps : sellerSteps;

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">How PenePene Works</h2>
                <p className="text-gray-500 mb-10 max-w-2xl mx-auto">
                    Whether you want to buy local products or grow your business, PenePene makes it easy, fast, and secure.
                </p>

                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner">
                        <button 
                            onClick={() => setActiveTab('buyers')}
                            className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'buyers' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            For Buyers
                        </button>
                        <button 
                            onClick={() => setActiveTab('sellers')}
                            className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'sellers' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            For Sellers
                        </button>
                    </div>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
                    {/* Connecting Line (desktop only) */}
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
