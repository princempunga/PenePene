import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import BuyerAccountEmptyState from '@/Components/Buyer/BuyerAccountEmptyState';
import ProductCard from '@/Components/Product/ProductCard';
import Pagination from '@/Components/UI/Pagination';
import { Heart } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function Wishlist({ favorites }) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('buyer.wishlist')} />
            <BuyerLayout
                title={t('buyer.wishlist')}
                subtitle={t('buyer.wishlist_subtitle_full')}
            >
                {favorites.data.length > 0 ? (
                    <>
                        <p className="text-sm text-gray-500 mb-5">{t('buyer.saved_items_count', { count: favorites.total })}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {favorites.data.map(fav => (
                                <div key={fav.id} className="relative group">
                                    <ProductCard product={fav.product} />
                                    <Link
                                        href={`/buyer/wishlist/${fav.id}`}
                                        method="delete"
                                        as="button"
                                        className="absolute top-2 left-2 bg-white shadow-md text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                        title={t('buyer.remove_from_wishlist')}
                                    >
                                        <Heart size={16} fill="currentColor" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <Pagination links={favorites.links} />
                    </>
                ) : (
                    <BuyerAccountEmptyState
                        icon={Heart}
                        title={t('buyer.wishlist_empty_title')}
                        description={t('buyer.wishlist_empty_desc')}
                        actionLabel={t('buyer.explore_products')}
                        actionHref="/products"
                        accent="amber"
                    />
                )}
            </BuyerLayout>
        </>
    );
}
