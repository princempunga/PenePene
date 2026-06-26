import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Search, ShoppingCart } from 'lucide-react';
import Logo from '@/Components/Brand/Logo';
import useTranslation from '@/hooks/useTranslation';

export default function MobileNavbar() {
    const { cart_count } = usePage().props;
    const { t } = useTranslation();

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white text-gray-900 flex items-center justify-between px-4 py-2 shadow-sm border-b border-gray-100 h-[60px]">
            {/* Logo on the left */}
            <div className="flex items-center">
                <Logo className="h-8 w-auto" asLink={true} />
            </div>

            {/* Icons on the right */}
            <div className="flex items-center gap-4">
                <Link href="/search" className="text-gray-600 hover:text-primary-600 transition-colors">
                    <Search size={22} />
                </Link>

                <Link href="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors">
                    <ShoppingCart size={22} />
                    {(cart_count || 0) > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-primary-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold shadow-sm">
                            {cart_count > 99 ? '99+' : cart_count}
                        </span>
                    )}
                </Link>
            </div>
        </div>
    );
}
