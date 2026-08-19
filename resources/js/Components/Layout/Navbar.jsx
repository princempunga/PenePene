import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, ShoppingCart, User, Bell, Heart, MapPin, ChevronDown, Package, MessageSquare, LogOut, Settings } from 'lucide-react';
import Logo from '@/Components/Brand/Logo';
import LanguageSwitcher from '@/Components/Layout/LanguageSwitcher';
import useTranslation from '@/hooks/useTranslation';

// Returns the correct dashboard URL based on user role
function getDashboardUrl(role) {
    if (role === 'super_admin' || role === 'admin') return '/admin/dashboard';
    if (role === 'seller') return '/seller/dashboard';
    return '/';
}

export default function Navbar({ onMenuClick }) {
    const { auth, cart_count, wishlist_count: sharedWishlistCount, categories: topCategories = [] } = usePage().props;
    const { t } = useTranslation();
    const [wishlistCount, setWishlistCount] = useState(sharedWishlistCount || 0);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setWishlistCount(sharedWishlistCount || 0);
    }, [sharedWishlistCount]);

    useEffect(() => {
        const handler = (e) => {
            if (typeof e.detail?.wishlist_count === 'number') {
                setWishlistCount(e.detail.wishlist_count);
            }
        };
        window.addEventListener('wishlist-updated', handler);
        return () => window.removeEventListener('wishlist-updated', handler);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/search', { q: searchQuery });
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const isBuyer = auth?.user?.role === 'buyer';
    const isSeller = auth?.user?.role === 'seller';
    const isAdmin = auth?.user?.role === 'admin' || auth?.user?.role === 'super_admin';

    const dynamicCategories = useMemo(() => {
        if (Array.isArray(topCategories) && topCategories.length > 0) {
            return topCategories;
        }

        return [
            { id: 1, name: 'Electronics', slug: 'electronics', children: [] },
            { id: 2, name: 'Fashion', slug: 'fashion', children: [] },
            { id: 3, name: 'Home & Living', slug: 'home-living', children: [] },
            { id: 4, name: 'Vehicles', slug: 'vehicles', children: [] },
            { id: 5, name: 'Health & Beauty', slug: 'health-beauty', children: [] },
        ];
    }, [topCategories]);

    return (
        <motion.header
            initial={false}
            animate={{
                boxShadow: scrolled ? '0 4px 24px -4px rgba(0, 46, 93, 0.12)' : '0 0 0 0 transparent',
                borderBottomColor: scrolled ? 'transparent' : 'rgb(243 244 246)',
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`hidden md:block fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100`}
        >
            {/* Top Bar */}
            <div className="hidden lg:block bg-gray-900 text-gray-300 text-xs py-1.5">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <div className="flex gap-4">
                        <Link href="/about" className="hover:text-white transition-colors">{t('nav.about')}</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link>
                        <Link href="/help-center" className="hover:text-white transition-colors">{t('nav.help_center')}</Link>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="flex items-center gap-1"><MapPin size={12}/> {t('nav.deliver_to')} <strong>Kinshasa</strong></span>
                        <LanguageSwitcher variant="compact" />
                        <Link href="/seller/register" className="text-amber-400 font-bold hover:text-amber-300 transition-colors">{t('nav.sell_on')}</Link>
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
                    
                    <Logo className="h-11 md:h-12 w-auto max-w-[160px]" />
                </div>

                {/* Search Bar (Desktop) */}
                <div className="hidden lg:flex flex-1 max-w-3xl relative group">
                    <form onSubmit={handleSearch} className="w-full flex relative shadow-sm group-hover:shadow-md transition-shadow rounded-xl overflow-hidden border border-gray-200 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('nav.search_placeholder')}
                            className="w-full pl-5 pr-12 py-3.5 bg-gray-50 focus:bg-white border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-medium transition-colors"
                        />
                        <button type="submit" className="web-btn premium-cta px-8 bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors flex items-center gap-2">
                            <Search size={20} /> {t('nav.search')}
                        </button>
                    </form>
                </div>

                {/* Icons & Account */}
                <div className="flex items-center gap-2 md:gap-5 flex-shrink-0">
                    <Link href="/become-a-seller" className="hidden xl:flex items-center justify-center px-4 py-2 bg-amber-50 text-amber-700 font-bold rounded-lg hover:bg-amber-100 transition-colors text-sm premium-cta">
                        {t('nav.start_selling')}
                    </Link>

                    <div className="flex items-center gap-1 sm:gap-3 text-gray-600">
                        <LanguageSwitcher />
                        {auth?.user ? (
                            <>
                                {/* Seller/Admin: show dashboard link */}
                                {(isSeller || isAdmin) && (
                                    <Link href={getDashboardUrl(auth.user.role)} className="hidden md:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                                            {auth.user.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="font-medium text-sm group-hover:text-primary-600">{t('nav.my_account')}</span>
                                    </Link>
                                )}

                                {/* Buyer: show profile dropdown */}
                                {isBuyer && (
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                {auth.user.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <span className="hidden md:block font-medium text-sm text-gray-700 group-hover:text-primary-600 max-w-[100px] truncate">
                                                {auth.user.name?.split(' ')[0]}
                                            </span>
                                            <ChevronDown size={14} className={`hidden md:block text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[200]"
                                            >
                                                {/* User info header */}
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="font-semibold text-gray-900 truncate">{auth.user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{auth.user.email}</p>
                                                </div>

                                                <div className="py-1">
                                                    <Link
                                                        href="/buyer/profile"
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                                    >
                                                        <User size={16} className="text-gray-400" />
                                                        {t('nav.my_profile')}
                                                    </Link>
                                                    <Link
                                                        href="/buyer/orders"
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                                    >
                                                        <Package size={16} className="text-gray-400" />
                                                        {t('nav.my_orders')}
                                                    </Link>
                                                    <Link
                                                        href="/buyer/messages"
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                                    >
                                                        <MessageSquare size={16} className="text-gray-400" />
                                                        {t('nav.my_messages')}
                                                    </Link>
                                                </div>

                                                <div className="border-t border-gray-100 pt-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LogOut size={16} />
                                                        {t('nav.logout')}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                                <User size={24} className="group-hover:text-primary-600" />
                                <span className="hidden md:block font-bold text-sm group-hover:text-primary-600">{t('nav.sign_in')}</span>
                            </Link>
                        )}
                        
                        <div className="w-px h-8 bg-gray-200 hidden md:block mx-1"></div>

                        <Link href="/favorites" className="hidden md:flex p-2 hover:bg-gray-100 rounded-full transition-colors group relative" title={t('nav.wishlist')}>
                            <Heart size={24} className={`group-hover:text-red-500 ${wishlistCount > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold border-2 border-white px-1">
                                    {wishlistCount > 99 ? '99+' : wishlistCount}
                                </span>
                            )}
                        </Link>
                        
                        <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group flex items-center gap-2">
                            <div className="relative">
                                <ShoppingCart size={24} className="group-hover:text-primary-600" />
                                {(cart_count || 0) > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-primary-600 text-white text-[10px] min-w-[20px] h-5 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm px-1">
                                        {cart_count > 99 ? '99+' : cart_count}
                                    </span>
                                )}
                                {(cart_count || 0) === 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-gray-300 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm">
                                        0
                                    </span>
                                )}
                            </div>
                            <span className="hidden md:block font-bold text-sm group-hover:text-primary-600">{t('nav.cart')}</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Links Bar (Categories) */}
            <div className="hidden lg:block border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <ul className="flex items-center gap-2 py-2.5 text-sm font-medium text-gray-600 overflow-x-auto hide-scrollbar">
                        <li>
                            <Link href="/categories" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold whitespace-nowrap px-2 py-1.5">
                                <Menu size={16} /> {t('nav.all_categories')}
                            </Link>
                        </li>

                        {dynamicCategories.map((category) => {
                            const hasChildren = Array.isArray(category.children) && category.children.length > 0;

                            return (
                                <li key={category.id} className="relative group">
                                    <Link
                                        href={category.slug ? `/categories/${category.slug}` : '/categories'}
                                        className="block px-2 py-1.5 rounded-md hover:text-primary-600 hover:bg-gray-50 whitespace-nowrap transition-colors"
                                    >
                                        {category.name}
                                    </Link>

                                    {hasChildren && (
                                        <div className="absolute left-0 top-full z-30 hidden min-w-[220px] group-hover:block rounded-xl border border-gray-200 bg-white shadow-lg py-2">
                                            {category.children.map((child) => (
                                                <Link
                                                    key={child.id}
                                                    href={child.slug ? `/categories/${child.slug}` : '/categories'}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            );
                        })}

                        <li><Link href="/products?filter=sale" className="text-red-600 font-bold hover:text-red-700 whitespace-nowrap flex items-center gap-1 px-2 py-1.5">{t('nav.flash_deals')}</Link></li>
                    </ul>
                </div>
            </div>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </motion.header>
    );
}
