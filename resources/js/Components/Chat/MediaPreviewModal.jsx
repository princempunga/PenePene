import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function MediaPreviewModal({ media, onClose }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    if (!media) return null;

    const timeLabel = media.created_at
        ? format(new Date(media.created_at), 'MMM d, yyyy · HH:mm')
        : '';

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative max-w-5xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between text-white mb-3 px-1">
                    <div className="min-w-0">
                        <p className="font-semibold truncate">{media.senderName || 'Unknown'}</p>
                        {timeLabel && <p className="text-sm text-white/70">{timeLabel}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={media.src}
                            download
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            title="Download"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Download size={20} />
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center min-h-0 rounded-xl overflow-hidden bg-black/40">
                    {media.type === 'video' ? (
                        <video
                            src={media.src}
                            controls
                            autoPlay
                            className="max-w-full max-h-[75vh] object-contain"
                        />
                    ) : (
                        <img
                            src={media.src}
                            alt={media.alt || 'Preview'}
                            className="max-w-full max-h-[75vh] object-contain"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
