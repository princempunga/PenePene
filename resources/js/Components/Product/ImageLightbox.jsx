import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageLightbox({ images, productName, triggerImageUrl }) {
    const [isOpen, setIsOpen] = useState(false);

    const displayImages = images && images.length > 0
        ? images
        : [{ id: 'placeholder', image_path: 'images/placeholder.svg' }];

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('images/')) return `/${path}`;
        if (path.startsWith('/images/')) return path;
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };

    const allUrls = displayImages.map(img => getImageUrl(img.image_path));
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

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="block w-full h-full cursor-zoom-in"
                aria-label="Zoom image"
            >
                <img
                    src={triggerImageUrl || getImageUrl(displayImages[0]?.image_path)}
                    alt={productName}
                    className="w-full h-full object-contain p-2 md:object-cover md:p-0"
                    loading="lazy"
                />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm">
            <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white p-2 z-50"
                aria-label="Close"
            >
                <X size={32} />
            </button>

            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white font-medium text-lg z-50">
                {currentIndex + 1} / {allUrls.length}
            </div>

            {allUrls.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentIndex(i => (i > 0 ? i - 1 : allUrls.length - 1));
                        }}
                        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50"
                        aria-label="Previous"
                    >
                        <ChevronLeft size={48} />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentIndex(i => (i < allUrls.length - 1 ? i + 1 : 0));
                        }}
                        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50"
                        aria-label="Next"
                    >
                        <ChevronRight size={48} />
                    </button>
                </>
            )}

            <div className="w-full h-full max-w-6xl max-h-screen p-4 sm:p-12 flex items-center justify-center">
                <img
                    src={allUrls[currentIndex]}
                    alt={productName}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => { e.target.src = '/images/placeholder.svg'; }}
                />
            </div>
        </div>
    );
}
