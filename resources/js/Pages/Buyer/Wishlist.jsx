import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import ProductCard from '@/Components/Product/ProductCard';
import Pagination from '@/Components/UI/Pagination';
import { Heart } from 'lucide-react';

export default function Wishlist({ favorites }) {
    return (
        <>
            <Head title="My Wishlist" />
            <BuyerLayout title="My Wishlist">
                {favorites.data.length > 0 ? (
                    <>
                        <p className="text-gray-500 mb-6">{favorites.total} saved item{favorites.total !== 1 ? 's' : ''}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {favorites.data.map(fav => (
                                <div key={fav.id} className="relative group">
                                    <ProductCard product={fav.product} />
                                    <Link
                                        href={`/buyer/wishlist/${fav.id}`}
                                        method="delete"
                                        as="button"
                                        className="absolute top-2 left-2 bg-white shadow-md text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                        title="Remove from wishlist"
                                    >
                                        <Heart size={16} fill="currentColor" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <Pagination links={favorites.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <Heart size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-500 mb-6">Save products you love and come back to them anytime.</p>
                        <Link href="/products" className="inline-block bg-primary-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors">
                            Explore Products
                        </Link>
                    </div>
                )}
            </BuyerLayout>
        </>
    );
}
