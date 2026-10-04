import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductImageUrl, handleImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '@/utils/productImage';

export default function ImageGallery({ images, productName }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const hasImages = Array.isArray(images) && images.length > 0;
    const displayImages = hasImages ? images : [];

    const activeUrl = hasImages
        ? getProductImageUrl(displayImages[activeIndex]?.image_path || displayImages[activeIndex])
        : DEFAULT_PRODUCT_PLACEHOLDER;

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
            <div className="flex flex-col gap-3 md:gap-4 w-full">
                {/* Main Image */}
                <button 
                    type="button"
                    onClick={() => hasImages && setIsLightboxOpen(true)}
                    className={`aspect-square w-full bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs ${hasImages ? 'cursor-zoom-in group' : 'cursor-default'} relative`}
                >
                    <img 
                        src={activeUrl} 
                        alt={productName} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        onError={handleImageError}
                    />
                </button>

                {/* Thumbnails — only when real DB images exist and there are more than one */}
                {hasImages && displayImages.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                        {displayImages.map((img, index) => {
                            const imgUrl = getProductImageUrl(img.image_path || img);
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
                                        onError={handleImageError}
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Lightbox Modal — rendered via portal to document.body to escape parent overflow:hidden */}
            {isLightboxOpen && hasImages && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99999,
                        backgroundColor: 'rgba(0,0,0,0.96)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
                        style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 100001 }}
                        className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Close"
                    >
                        <X size={32} />
                    </button>

                    <div
                        style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', zIndex: 100001 }}
                        className="text-white font-medium text-lg select-none"
                    >
                        {activeIndex + 1} / {displayImages.length}
                    </div>

                    {displayImages.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handlePrevious(e); }}
                            style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 100001 }}
                            className="text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Previous"
                        >
                            <ChevronLeft size={48} />
                        </button>
                    )}

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100vw',
                            height: '100vh',
                            padding: displayImages.length > 1 ? '4.5rem 5.5rem' : '4.5rem 4.5rem',
                            boxSizing: 'border-box',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={activeUrl}
                            alt={productName}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                borderRadius: '0.5rem',
                            }}
                            onError={handleImageError}
                        />
                    </div>

                    {displayImages.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleNext(e); }}
                            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 100001 }}
                            className="text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Next"
                        >
                            <ChevronRight size={48} />
                        </button>
                    )}
                </div>,
                document.body
            )}
        </>
    );
}
