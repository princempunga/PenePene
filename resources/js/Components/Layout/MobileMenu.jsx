import React from 'react';
import { Link } from '@inertiajs/react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileMenu({ isOpen, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-40 lg:hidden"
                        onClick={onClose}
                    />
                    <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-xl z-50 lg:hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <span className="text-xl font-bold text-primary-600">PenePene</span>
                            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-4 border-b">
                            <form action="/search" method="GET" className="relative">
                                <input 
                                    type="text" 
                                    name="q"
                                    placeholder="Search products..." 
                                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary-500"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Search size={20} />
                                </button>
                            </form>
                        </div>

                        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Browse</h3>
                                <ul className="space-y-3">
                                    <li><Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">Home</Link></li>
                                    <li><Link href="/products" className="text-gray-700 hover:text-primary-600 font-medium">All Products</Link></li>
                                    <li><Link href="/categories" className="text-gray-700 hover:text-primary-600 font-medium">Categories</Link></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Help & Settings</h3>
                                <ul className="space-y-3">
                                    <li><Link href="/become-a-seller" className="text-gray-700 hover:text-primary-600 font-medium">Sell on PenePene</Link></li>
                                    <li><Link href="/faq" className="text-gray-700 hover:text-primary-600 font-medium">FAQ</Link></li>
                                    <li><Link href="/contact" className="text-gray-700 hover:text-primary-600 font-medium">Contact Us</Link></li>
                                </ul>
                            </div>
                        </nav>
                        
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex gap-4">
                                <Link href="/login" className="flex-1 text-center py-2 px-4 border border-primary-600 text-primary-600 rounded-md font-medium">
                                    Sign In
                                </Link>
                                <Link href="/register" className="flex-1 text-center py-2 px-4 bg-primary-600 text-white rounded-md font-medium">
                                    Register
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
