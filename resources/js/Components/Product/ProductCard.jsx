import React from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, Heart, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import RatingStars from '../UI/RatingStars';

export default function ProductCard({ product, badge }) {
    const primaryImage = product.images?.find(img => img.is_primary)?.image_path 
        || product.images?.[0]?.image_path;
        
    const imageUrl = primaryImage ? `/storage/${primaryImage}` : '/images/placeholder.jpg';
    
    // Determine the badge to show (can be passed via props or derived from product)
    const displayBadge = badge || (product.is_sponsored ? 'Sponsored' : (product.sale_price ? 'Sale' : null));

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col h-full group relative"
        >
            {/* Wishlist Button (Visual only for now) */}
            <button className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm">
                <Heart size={18} />
            </button>

            {/* Badges */}
            {displayBadge && (
                <div className={`absolute top-3 left-3 z-10 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm ${
                    displayBadge === 'Sponsored' ? 'bg-amber-400 text-amber-900' : 
                    displayBadge === 'Sale' ? 'bg-red-500 text-white' : 
                    'bg-primary-600 text-white'
                }`}>
                    {displayBadge}
                </div>
            )}

            <Link href={`/products/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-50">
                <img 
                    src={imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                />
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                {product.category && (
                    <span className="text-xs text-primary-600 font-semibold mb-1 uppercase tracking-wider">
                        {product.category.name}
                    </span>
                )}
                
                <Link href={`/products/${product.slug}`} className="block mb-2 flex-grow">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto pt-3 border-t border-gray-50">
                    <div className="flex items-end gap-2 mb-3">
                        <span className="text-xl font-extrabold text-gray-900">
                            {product.currency || 'USD'} {parseFloat(product.sale_price || product.price).toLocaleString()}
                        </span>
                        {product.sale_price && (
                            <span className="text-sm text-gray-400 line-through mb-0.5 font-medium">
                                {parseFloat(product.price).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 text-xs text-gray-500">
                        {/* Seller Info */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 truncate">
                                {product.seller?.is_verified && <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />}
                                <span className="truncate font-medium hover:text-gray-700 transition-colors cursor-pointer">
                                    {product.seller?.business_name || 'Verified Seller'}
                                </span>
                            </div>
                            {(product.average_rating > 0 || product.seller?.average_rating > 0) && (
                                <RatingStars rating={product.average_rating || product.seller?.average_rating} size={12} />
                            )}
                        </div>
                        
                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <MapPin size={12} className="flex-shrink-0" />
                            <span className="truncate">{product.city || product.seller?.city || 'Local Delivery'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
