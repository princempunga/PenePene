import React from 'react';
import { Link } from '@inertiajs/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 pt-20 pb-10 border-t-4 border-primary-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Newsletter Section */}
                <div className="bg-gray-800 rounded-3xl p-8 lg:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 max-w-xl text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Subscribe to our Newsletter</h3>
                        <p className="text-gray-400">Get the latest updates on new products, flash deals, and platform features directly to your inbox.</p>
                    </div>
                    
                    <div className="relative z-10 w-full md:w-auto flex-shrink-0">
                        <form className="flex w-full md:w-96 relative">
                            <input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-5 pr-16 py-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                            />
                            <button className="absolute right-2 top-2 bottom-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg px-4 flex items-center justify-center transition-colors">
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Main Footer Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    <div className="lg:col-span-2">
                        <Link href="/" className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 mb-6">
                            PenePene<span className="w-2 h-2 rounded-full bg-amber-400 mb-2"></span>
                        </Link>
                        <p className="text-gray-400 mb-8 leading-relaxed max-w-md">
                            Your premium local marketplace. Connect with verified sellers, discover great deals, and grow your business with our modern e-commerce tools.
                        </p>
                        <div className="flex gap-4">
                            {['FB', 'TW', 'IG', 'IN'].map(social => (
                                <a key={social} href="#" className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all transform hover:-translate-y-1 font-bold text-sm shadow-lg">
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-gray-400 hover:text-amber-400 transition-colors">About Us</Link></li>
                            <li><Link href="/categories" className="text-gray-400 hover:text-amber-400 transition-colors">Categories</Link></li>
                            <li><Link href="/flash-deals" className="text-gray-400 hover:text-amber-400 transition-colors">Flash Deals</Link></li>
                            <li><Link href="/blog" className="text-gray-400 hover:text-amber-400 transition-colors">Marketplace Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">For Sellers</h4>
                        <ul className="space-y-4">
                            <li><Link href="/seller/register" className="text-gray-400 hover:text-amber-400 transition-colors">Start Selling</Link></li>
                            <li><Link href="/pricing" className="text-gray-400 hover:text-amber-400 transition-colors">Pricing Plans</Link></li>
                            <li><Link href="/seller/resources" className="text-gray-400 hover:text-amber-400 transition-colors">Seller Resources</Link></li>
                            <li><Link href="/seller/community" className="text-gray-400 hover:text-amber-400 transition-colors">Community Forum</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={20} className="text-primary-500 shrink-0 mt-0.5" />
                                <span className="text-gray-400">123 Market Street, Business District, Kinshasa</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={20} className="text-primary-500 shrink-0" />
                                <span className="text-gray-400">+243 812 345 678</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={20} className="text-primary-500 shrink-0" />
                                <span className="text-gray-400">support@penepene.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} PenePene Marketplace. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                        <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/cookies" className="text-gray-500 hover:text-white transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
