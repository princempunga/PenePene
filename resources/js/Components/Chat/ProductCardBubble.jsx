import React from 'react';
import { Link } from '@inertiajs/react';
import { Tag, ExternalLink } from 'lucide-react';

export default function ProductCardBubble({ product, isOwnMessage }) {
    if (!product) return null;

    return (
        <div className={`mt-1 mb-2 w-full max-w-[280px] sm:max-w-[320px] rounded-xl overflow-hidden border ${isOwnMessage ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-200'}`}>
            {/* Image */}
            <div className="h-40 w-full relative bg-white overflow-hidden">
                <img 
                    src={product.image_url || '/images/demo-products/default.jpg'} 
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                />
                {product.category && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded">
                        {product.category}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3">
                <h4 className={`font-bold text-sm line-clamp-2 leading-tight mb-1 ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
                    {product.name}
                </h4>
                
                <p className={`font-extrabold text-lg mb-2 ${isOwnMessage ? 'text-white' : 'text-primary-600'}`}>
                    {product.currency || 'CDF'} {parseFloat(product.price).toLocaleString()}
                </p>

                {product.seller_name && (
                    <p className={`text-xs mb-3 flex items-center gap-1 ${isOwnMessage ? 'text-white/80' : 'text-gray-500'}`}>
                        <span className="font-medium">Vendeur:</span> {product.seller_name}
                    </p>
                )}

                <Link 
                    href={product.product_url || `/products/${product.slug}`}
                    className={`w-full py-2 flex justify-center items-center gap-1.5 text-xs font-bold rounded-lg transition-colors ${
                        isOwnMessage 
                            ? 'bg-white text-primary-600 hover:bg-gray-50' 
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                >
                    <ExternalLink size={14} />
                    Voir le produit
                </Link>
            </div>
        </div>
    );
}
