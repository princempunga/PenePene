import React from 'react';
import { Link } from '@inertiajs/react';
import { Store, MapPin } from 'lucide-react';
import RatingStars from '../UI/RatingStars';

export default function TopSellers({ sellers }) {
    if (!sellers || sellers.length === 0) return null;

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Top Rated Sellers</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sellers.map(seller => (
                        <Link 
                            key={seller.id} 
                            href={`/sellers/${seller.slug}`}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                        >
                            <div className="h-24 bg-gradient-to-r from-primary-100 to-primary-50 relative">
                                {seller.banner && (
                                    <img src={`/storage/${seller.banner}`} alt="Banner" className="w-full h-full object-cover" />
                                )}
                            </div>
                            
                            <div className="p-5 pt-0 relative">
                                <div className="w-16 h-16 rounded-full border-4 border-white bg-white shadow-sm absolute -top-8 left-5 overflow-hidden flex items-center justify-center">
                                    {seller.logo ? (
                                        <img src={`/storage/${seller.logo}`} alt={seller.business_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Store className="text-primary-300" size={32} />
                                    )}
                                </div>
                                
                                <div className="mt-10">
                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
                                        {seller.business_name}
                                    </h3>
                                    
                                    <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                                        <MapPin size={14} />
                                        <span className="truncate">{seller.city || 'Location not specified'}</span>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <RatingStars rating={seller.average_rating} count={seller.total_reviews} size={14} />
                                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
                                            Visit Store
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
