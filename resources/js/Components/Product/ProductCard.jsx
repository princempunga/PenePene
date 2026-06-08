import React from 'react';
import { Link } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import RatingStars from '../UI/RatingStars';

export default function ProductCard({ product }) {
    const primaryImage = product.images?.find(img => img.is_primary)?.image_path 
        || product.images?.[0]?.image_path;
        
    const imageUrl = primaryImage ? `/storage/${primaryImage}` : '/images/placeholder.jpg';

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group">
            <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                <img 
                    src={imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                />
                {product.sale_price && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                        Sale
                    </span>
                )}
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                {product.category && (
                    <span className="text-xs text-primary-600 font-medium mb-1">
                        {product.category.name}
                    </span>
                )}
                
                <Link href={`/products/${product.slug}`} className="block mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto pt-2">
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-lg font-bold text-gray-900">
                            {product.currency} {parseFloat(product.sale_price || product.price).toLocaleString()}
                        </span>
                        {product.sale_price && (
                            <span className="text-sm text-gray-400 line-through mb-0.5">
                                {parseFloat(product.price).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        {product.average_rating > 0 && (
                            <RatingStars rating={product.average_rating} count={product.total_reviews} size={12} />
                        )}
                        
                        <div className="flex items-center gap-1 ml-auto">
                            <MapPin size={12} />
                            <span className="truncate max-w-[80px]">{product.city || 'Anywhere'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
