import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Search, ShoppingCart, User, Bell } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
    const { auth } = usePage().props;

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onMenuClick}
                        className="lg:hidden p-2 text-gray-600 hover:text-primary-600"
                    >
                        <Menu size={24} />
                    </button>
                    
                    <Link href="/" className="text-2xl font-bold text-primary-600">
                        PenePene
                    </Link>
                </div>

                <div className="hidden lg:flex flex-1 max-w-2xl px-8">
                    <form action="/search" method="GET" className="w-full flex relative">
                        <input 
                            type="text" 
                            name="q"
                            placeholder="Search products, brands and categories..." 
                            className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button type="submit" className="px-6 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors">
                            <Search size={20} />
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/become-a-seller" className="hidden md:block text-sm font-medium text-gray-600 hover:text-primary-600">
                        Sell on PenePene
                    </Link>

                    <div className="flex items-center gap-4 text-gray-600">
                        {auth?.user ? (
                            <>
                                <Link href="/dashboard/notifications" className="hover:text-primary-600 relative">
                                    <Bell size={24} />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                        3
                                    </span>
                                </Link>
                                <Link href="/dashboard" className="hover:text-primary-600">
                                    <User size={24} />
                                </Link>
                            </>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 hover:text-primary-600">
                                <User size={24} />
                                <span className="hidden md:block text-sm font-medium">Sign In</span>
                            </Link>
                        )}
                        
                        <Link href="/cart" className="hover:text-primary-600 relative">
                            <ShoppingCart size={24} />
                            <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                0
                            </span>
                        </Link>
                    </div>
                </div>

            </div>
        </header>
    );
}
