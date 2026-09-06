import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Store, Package, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

function ImageLightbox({ images, initialIndex = 0, alt, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const prevImage = (e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = (e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose, images.length]);

    const currentImg = images[currentIndex];

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/90 backdrop-blur-md p-4 sm:p-6"
            onClick={onClose}
            style={{ animation: 'fadeIn 0.15s ease' }}
        >
            <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } } @keyframes scaleIn { from { transform:scale(0.92); opacity:0 } to { transform:scale(1); opacity:1 } }`}</style>
            
            {/* Top Bar / Header */}
            <div className="w-full flex items-center justify-between text-white z-10 py-2 px-4" onClick={(e) => e.stopPropagation()}>
                <div className="text-sm font-medium text-white/80">
                    {alt} {images.length > 1 && <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">{currentIndex + 1} / {images.length}</span>}
                </div>
                <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition flex items-center justify-center"
                    title="Fermer (Échap)"
                >
                    <X size={22} />
                </button>
            </div>

            {/* Main Image Area with Navigation Arrows */}
            <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-2 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {images.length > 1 && (
                    <button
                        onClick={prevImage}
                        className="absolute left-2 sm:left-4 z-20 text-white bg-black/50 hover:bg-black/80 hover:scale-110 p-3 rounded-full transition-all shadow-lg backdrop-blur-sm"
                        title="Image précédente (Flèche gauche)"
                    >
                        <ChevronLeft size={28} />
                    </button>
                )}

                <img
                    key={currentImg}
                    src={currentImg}
                    alt={alt}
                    className="max-w-full max-h-[70vh] rounded-xl shadow-2xl object-contain transition-all duration-200"
                    style={{ animation: 'scaleIn 0.18s ease' }}
                />

                {images.length > 1 && (
                    <button
                        onClick={nextImage}
                        className="absolute right-2 sm:right-4 z-20 text-white bg-black/50 hover:bg-black/80 hover:scale-110 p-3 rounded-full transition-all shadow-lg backdrop-blur-sm"
                        title="Image suivante (Flèche droite)"
                    >
                        <ChevronRight size={28} />
                    </button>
                )}
            </div>

            {/* Bottom Gallery Navigation Bar (Thumbnails) */}
            <div className="w-full z-10 flex flex-col items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                {images.length > 1 && (
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-2xl max-w-full overflow-x-auto border border-white/10">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 transition-all ${
                                    idx === currentIndex
                                        ? 'ring-2 ring-white scale-105 opacity-100 shadow-lg'
                                        : 'opacity-50 hover:opacity-90 hover:scale-95'
                                }`}
                            >
                                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
                <p className="text-white/50 text-xs">Utilisez les flèches du clavier ou cliquez pour naviguer • Échap pour fermer</p>
            </div>
        </div>
    );
}

export default function OrdersShow({ order }) {
    const [lightbox, setLightbox] = useState(null); // { images: [], index: 0, alt: '' }

    const statusColors = {
        pending:   'bg-amber-100 text-amber-800',
        confirmed: 'bg-blue-100 text-blue-800',
        shipped:   'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <AdminLayout>
            <Head title={`Admin Oversight: Order #${order.order_number}`} />

            {lightbox && (
                <ImageLightbox
                    images={lightbox.images}
                    initialIndex={lightbox.initialIndex || 0}
                    alt={lightbox.alt}
                    onClose={() => setLightbox(null)}
                />
            )}

            <div className="mb-6">
                <Link href="/admin/orders" className="text-primary-600 hover:underline flex items-center gap-1 text-sm font-medium mb-3">
                    <ArrowLeft size={16} /> Back to Orders List
                </Link>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColors[order.status]}`}>
                        {order.status}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-900">Order Items</h2>
                        </div>
                        <div className="divide-y divide-gray-100 p-5">
                            {order.items.map(item => {
                                const productImages = (item.product?.images || []).map(img => `/storage/${img.image_path}`);
                                const mainImgSrc = productImages[0] || null;
                                return (
                                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                                        <div
                                            className={`w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${mainImgSrc ? 'cursor-zoom-in group relative' : ''}`}
                                            onClick={() => mainImgSrc && setLightbox({ images: productImages, initialIndex: 0, alt: item.product_name })}
                                            title={mainImgSrc ? 'Voir la galerie' : ''}
                                        >
                                            {mainImgSrc ? (
                                                <>
                                                    <img
                                                        src={mainImgSrc}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                                                    </div>
                                                </>
                                            ) : (
                                                <Package size={24} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900">{item.product_name}</p>
                                            <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">TZS {parseFloat(item.price * item.quantity).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 mt-1">TZS {parseFloat(item.price).toLocaleString()} each</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Buyer Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Store size={18} className="text-gray-400"/> Buyer Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <p><strong>Name:</strong> {order.buyer?.user?.name}</p>
                            <p><strong>Email:</strong> {order.buyer?.user?.email}</p>
                        </div>
                    </div>

                    {/* Seller Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Store size={18} className="text-gray-400"/> Seller Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <p><strong>Business:</strong> {order.seller?.business_name}</p>
                            <p><strong>Status:</strong> {order.seller?.status}</p>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 mb-4">Financial Overview</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>TZS {parseFloat(order.subtotal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping Fee</span>
                                <span>TZS {parseFloat(order.shipping_cost).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-bold text-gray-900 text-lg">
                                <span>Total Amount</span>
                                <span>TZS {parseFloat(order.total_amount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

