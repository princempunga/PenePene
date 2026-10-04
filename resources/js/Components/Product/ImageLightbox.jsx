import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductImageUrl, handleImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '@/utils/productImage';

export default function ImageLightbox({ images, productName, triggerImageUrl }) {
    const [isOpen, setIsOpen] = useState(false);

    const hasImages = Array.isArray(images) && images.length > 0;
    const displayImages = hasImages ? images : [];

    const allUrls = displayImages.map(img => getProductImageUrl(img.image_path || img));
    const initialIndex = triggerImageUrl
        ? Math.max(0, allUrls.findIndex(url => url === triggerImageUrl))
        : 0;
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
            if (e.key === 'ArrowLeft') setCurrentIndex(i => (i > 0 ? i - 1 : allUrls.length - 1));
            if (e.key === 'ArrowRight') setCurrentIndex(i => (i < allUrls.length - 1 ? i + 1 : 0));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, allUrls.length]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Trigger image (non-open state)
    const trigger = (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (hasImages) setIsOpen(true);
            }}
            className="block w-full h-full cursor-zoom-in"
            aria-label="Zoom image"
        >
            <img
                src={triggerImageUrl || getProductImageUrl(displayImages[0]?.image_path || displayImages[0])}
                alt={productName}
                className="w-full h-full object-cover object-center"
                loading="lazy"
                onError={handleImageError}
            />
        </button>
    );

    if (!isOpen) {
        return trigger;
    }

    // Fullscreen overlay rendered via portal directly on document.body
    // This escapes any parent overflow:hidden / CSS stacking context that would clip position:fixed
    const overlay = (
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
            onClick={() => setIsOpen(false)}
        >
            {/* Close */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 100001 }}
                className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close"
            >
                <X size={32} />
            </button>

            {/* Counter */}
            {allUrls.length > 0 && (
                <div
                    style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', zIndex: 100001 }}
                    className="text-white font-medium text-lg select-none"
                >
                    {currentIndex + 1} / {allUrls.length}
                </div>
            )}

            {/* Prev */}
            {allUrls.length > 1 && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(i => (i > 0 ? i - 1 : allUrls.length - 1));
                    }}
                    style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 100001 }}
                    className="text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Previous"
                >
                    <ChevronLeft size={48} />
                </button>
            )}

            {/* Next */}
            {allUrls.length > 1 && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(i => (i < allUrls.length - 1 ? i + 1 : 0));
                    }}
                    style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 100001 }}
                    className="text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Next"
                >
                    <ChevronRight size={48} />
                </button>
            )}

            {/* Image container — stops click-to-close propagation */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100vw',
                    height: '100vh',
                    padding: allUrls.length > 1 ? '4.5rem 5.5rem' : '4.5rem 4.5rem',
                    boxSizing: 'border-box',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={allUrls.length > 0 ? allUrls[currentIndex] : (triggerImageUrl || DEFAULT_PRODUCT_PLACEHOLDER)}
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
        </div>
    );

    return (
        <>
            {trigger}
            {createPortal(overlay, document.body)}
        </>
    );
}
