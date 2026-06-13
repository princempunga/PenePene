import React, { useState } from 'react';

export default function ImageGallery({ images, productName }) {
    const [activeIndex, setActiveIndex] = useState(0);

    // If no images provided, use a placeholder array
    const displayImages = images && images.length > 0 
        ? images 
        : [{ id: 'placeholder', image_path: 'images/placeholder.svg' }];

    const activeImage = displayImages[activeIndex]?.image_path;
    const activeUrl = activeImage?.startsWith('images/')
        ? `/${activeImage}`
        : activeImage?.startsWith('/images/')
            ? activeImage
            : `/storage/${activeImage}`;

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="aspect-square bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <img 
                    src={activeUrl} 
                    alt={productName} 
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                />
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
                    {displayImages.map((img, index) => {
                        const imgUrl = img.image_path?.startsWith('images/')
                            ? `/${img.image_path}`
                            : img.image_path?.startsWith('/images/')
                                ? img.image_path
                                : `/storage/${img.image_path}`;
                        return (
                            <button 
                                key={img.id || index}
                                onClick={() => setActiveIndex(index)}
                                className={`aspect-square bg-white border rounded-lg overflow-hidden transition-all ${
                                    index === activeIndex 
                                        ? 'border-primary-500 ring-2 ring-primary-200' 
                                        : 'border-gray-200 hover:border-primary-300'
                                }`}
                            >
                                <img 
                                    src={imgUrl} 
                                    alt={`${productName} thumbnail ${index + 1}`} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
