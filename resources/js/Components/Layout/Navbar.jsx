import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Menu, Search, ShoppingCart, User, Bell, Heart, MapPin } from 'lucide-react';

// Returns the correct dashboard URL based on user role
function getDashboardUrl(role) {
    if (role === 'super_admin' || role === 'admin') return '/admin/dashboard';
    if (role === 'seller') return '/seller/dashboard';
    return '/buyer/dashboard';
}

export default function Navbar({ onMenuClick }) {
    const { auth } = usePage().props;
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/search', { q: searchQuery });
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white border-b border-gray-100'}`}>
            {/* Top Bar (Very thin, for contact or secondary info) */}
            <div className="hidden lg:block bg-gray-900 text-gray-300 text-xs py-1.5">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <div className="flex gap-4">
                        <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                        <Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link>
                    </div>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><MapPin size={12}/> Deliver to: <strong>Kinshasa</strong></span>
                        <Link href="/seller/register" className="text-amber-400 font-bold hover:text-amber-300 transition-colors">Sell on PenePene</Link>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4 lg:gap-8">
                {/* Logo & Mobile Menu */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button 
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-primary-600 bg-gray-50 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                    
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/images/logo.png" alt="PenePene" className="h-10 md:h-12 w-auto object-contain" />
                    </Link>
                </div>

                {/* Search Bar (Desktop) */}
                <div className="hidden lg:flex flex-1 max-w-3xl relative group">
                    <form onSubmit={handleSearch} className="w-full flex relative shadow-sm group-hover:shadow-md transition-shadow rounded-xl overflow-hidden border border-gray-200 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for products, brands or categories..." 
                            className="w-full pl-5 pr-12 py-3.5 bg-gray-50 focus:bg-white border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-medium transition-colors"
                        />
                        <button type="submit" className="px-8 bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors flex items-center gap-2">
                            <Search size={20} /> Search
                        </button>
                    </form>
                </div>

                {/* Icons & Account */}
                <div className="flex items-center gap-2 md:gap-5 flex-shrink-0">
                    <Link href="/become-a-seller" className="hidden xl:flex items-center justify-center px-4 py-2 bg-amber-50 text-amber-700 font-bold rounded-lg hover:bg-amber-100 transition-colors text-sm">
                        Start Selling
                    </Link>

                    <div className="flex items-center gap-1 sm:gap-3 text-gray-600">
                        {auth?.user ? (
                            <>
                                <Link href={`${getDashboardUrl(auth.user.role)}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group">
                                    <Bell size={24} className="group-hover:text-primary-600" />
                                </Link>
                                <Link href={getDashboardUrl(auth.user.role)} className="p-2 hover:bg-gray-100 rounded-full transition-colors group flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                                        {auth.user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden md:block font-medium text-sm group-hover:text-primary-600">My Account</span>
                                </Link>
                            </>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                                <User size={24} className="group-hover:text-primary-600" />
                                <span className="hidden md:block font-bold text-sm group-hover:text-primary-600">Sign In</span>
                            </Link>
                        )}
                        
                        <div className="w-px h-8 bg-gray-200 hidden md:block mx-1"></div>

                        <Link href="/wishlist" className="hidden md:flex p-2 hover:bg-gray-100 rounded-full transition-colors group relative">
                            <Heart size={24} className="group-hover:text-red-500" />
                        </Link>
                        
                        <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group flex items-center gap-2">
                            <div className="relative">
                                <ShoppingCart size={24} className="group-hover:text-primary-600" />
                                <span className="absolute -top-1.5 -right-2 bg-primary-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm">
                                    0
                                </span>
                            </div>
                            <span className="hidden md:block font-bold text-sm group-hover:text-primary-600">Cart</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Links Bar (Categories) */}
            <div className="hidden lg:block border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <ul className="flex items-center gap-8 py-2.5 text-sm font-medium text-gray-600 overflow-x-auto hide-scrollbar">
                        <li>
                            <Link href="/categories" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold whitespace-nowrap">
                                <Menu size={16} /> All Categories
                            </Link>
                        </li>
                        <li><Link href="/categories/electronics" className="hover:text-primary-600 whitespace-nowrap">Electronics</Link></li>
                        <li><Link href="/categories/fashion" className="hover:text-primary-600 whitespace-nowrap">Fashion</Link></li>
                        <li><Link href="/categories/home-living" className="hover:text-primary-600 whitespace-nowrap">Home & Living</Link></li>
                        <li><Link href="/categories/vehicles" className="hover:text-primary-600 whitespace-nowrap">Vehicles</Link></li>
                        <li><Link href="/categories/health-beauty" className="hover:text-primary-600 whitespace-nowrap">Health & Beauty</Link></li>
                        <li><Link href="/products?filter=sale" className="text-red-600 font-bold hover:text-red-700 whitespace-nowrap flex items-center gap-1">Flash Deals</Link></li>
                    </ul>
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
        </header>
    );
}
