import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ images, productName }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // If no images provided, use a placeholder array
    const displayImages = images && images.length > 0 
        ? images 
        : [{ id: 'placeholder', image_path: 'images/placeholder.svg' }];

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('images/')) return `/${path}`;
        if (path.startsWith('/images/')) return path;
        return `/storage/${path}`;
    };

    const activeUrl = getImageUrl(displayImages[activeIndex]?.image_path);

    const handlePrevious = useCallback((e) => {
        if (e) e.stopPropagation();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
    }, [displayImages.length]);

    const handleNext = useCallback((e) => {
        if (e) e.stopPropagation();
        setActiveIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
    }, [displayImages.length]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isLightboxOpen) return;
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, handlePrevious, handleNext]);

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Main Image */}
                <button 
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="aspect-square w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm cursor-zoom-in"
                >
                    <img 
                        src={activeUrl} 
                        alt={productName} 
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                    />
                </button>

                {/* Thumbnails */}
                {displayImages.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
                        {displayImages.map((img, index) => {
                            const imgUrl = getImageUrl(img.image_path);
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

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm">
                    <button 
                        type="button"
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white p-2"
                        aria-label="Close"
                    >
                        <X size={32} />
                    </button>

                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white font-medium text-lg">
                        {activeIndex + 1} / {displayImages.length}
                    </div>

                    {displayImages.length > 1 && (
                        <button 
                            type="button"
                            onClick={handlePrevious}
                            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Previous"
                        >
                            <ChevronLeft size={48} />
                        </button>
                    )}

                    <div className="w-full h-full max-w-6xl max-h-screen p-4 sm:p-12 flex items-center justify-center" onClick={() => setIsLightboxOpen(false)}>
                        <img 
                            src={activeUrl} 
                            alt={productName} 
                            className="max-w-full max-h-full object-contain cursor-default"
                            onClick={(e) => e.stopPropagation()}
                            onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                        />
                    </div>

                    {displayImages.length > 1 && (
                        <button 
                            type="button"
                            onClick={handleNext}
                            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Next"
                        >
                            <ChevronRight size={48} />
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
