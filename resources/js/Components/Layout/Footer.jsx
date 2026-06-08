import React from 'react';
import { Link } from '@inertiajs/react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">PenePene</h2>
                    <p className="text-gray-400 mb-6">
                        Your trusted local marketplace to buy and sell products securely. Join thousands of buyers and sellers today.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors font-bold text-sm">
                            FB
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors font-bold text-sm">
                            TW
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors font-bold text-sm">
                            IG
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors font-bold text-sm">
                            IN
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
                    <ul className="space-y-4">
                        <li><Link href="/about" className="hover:text-primary-500 transition-colors">About Us</Link></li>
                        <li><Link href="/contact" className="hover:text-primary-500 transition-colors">Contact Us</Link></li>
                        <li><Link href="/faq" className="hover:text-primary-500 transition-colors">FAQ</Link></li>
                        <li><Link href="/become-a-seller" className="hover:text-primary-500 transition-colors">Sell on PenePene</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-6">Legal</h3>
                    <ul className="space-y-4">
                        <li><Link href="/terms" className="hover:text-primary-500 transition-colors">Terms & Conditions</Link></li>
                        <li><Link href="/privacy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-primary-500 transition-colors">Return Policy</Link></li>
                        <li><Link href="#" className="hover:text-primary-500 transition-colors">Cookie Policy</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-6">Contact Info</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <MapPin size={20} className="text-primary-500 shrink-0 mt-1" />
                            <span>123 Market Street, Dar es Salaam, Tanzania</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={20} className="text-primary-500 shrink-0" />
                            <span>+255 123 456 789</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={20} className="text-primary-500 shrink-0" />
                            <span>support@penepene.com</span>
                        </li>
                    </ul>
                </div>

            </div>
            
            <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} PenePene Marketplace. All rights reserved.</p>
            </div>
        </footer>
    );
}
