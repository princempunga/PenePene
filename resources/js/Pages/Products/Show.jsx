import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { MapPin, ShieldCheck, Truck, ArrowRight, MessageCircle, Heart, Phone } from 'lucide-react';
import ImageGallery from '@/Components/Product/ImageGallery';
import RatingStars from '@/Components/UI/RatingStars';
import ProductCard from '@/Components/Product/ProductCard';

export default function Show({ product, relatedProducts }) {
    const { auth } = usePage().props;
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const seller = product.seller;

    const availableStock = product.initial_stock - product.confirmed_sales;

    const addToCart = (redirect = false) => {
        setAdding(true);
        router.post('/cart/add', {
            product_id: product.id,
            quantity: quantity,
        }, {
            preserveScroll: true,
            onFinish: () => setAdding(false),
            onSuccess: () => {
                if (redirect) {
                    router.visit('/cart');
                }
            }
        });
    };

    return (
        <AppLayout>
            {/* Breadcrumbs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
                    <Link href="/" className="hover:text-primary-600">Home</Link>
                    <span className="mx-2">&gt;</span>
                    {product.category && (
                        <>
                            <Link href={`/categories/${product.category.slug}`} className="hover:text-primary-600">
                                {product.category.name}
                            </Link>
                            <span className="mx-2">&gt;</span>
                        </>
                    )}
                    <span className="text-gray-900 truncate">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    
                    {/* Left: Image Gallery */}
                    <div className="w-full lg:w-[45%] shrink-0">
                        <ImageGallery images={product.images} productName={product.name} />
                    </div>

                    {/* Middle: Product Details */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 text-sm mb-4">
                                {product.average_rating > 0 ? (
                                    <RatingStars rating={product.average_rating} count={product.total_reviews} />
                                ) : (
                                    <span className="text-gray-500">No reviews yet</span>
                                )}
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-500">
                                    <span className="font-semibold text-gray-900">{product.confirmed_sales}</span> Sold
                                </span>
                            </div>
                            
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-6">
                                <div className="flex items-end gap-3 mb-1">
                                    <span className="text-3xl font-extrabold text-primary-600">
                                        {product.currency} {parseFloat(product.sale_price || product.price).toLocaleString()}
                                    </span>
                                    {product.sale_price && (
                                        <span className="text-lg text-gray-400 line-through mb-1">
                                            {parseFloat(product.price).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Form (Static for now) */}
                        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <span className="font-medium text-gray-900">Quantity</span>
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                    >-</button>
                                    <input 
                                        type="number" 
                                        value={quantity} 
                                        readOnly
                                        className="w-16 h-10 text-center border-x border-y-0 border-gray-300 font-medium text-gray-900 focus:ring-0"
                                    />
                                    <button 
                                        onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                    >+</button>
                                </div>
                            </div>
                            <div className="text-right text-sm text-gray-500 mb-6">
                                {availableStock > 0 ? (
                                    <span className="text-green-600 font-medium">{availableStock} items available</span>
                                ) : (
                                    <span className="text-red-600 font-medium">Out of stock</span>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={() => addToCart(true)}
                                    disabled={adding || availableStock < 1}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    Buy Now
                                </button>
                                <button 
                                    onClick={() => addToCart(false)}
                                    disabled={adding || availableStock < 1}
                                    className="flex-1 bg-white hover:bg-gray-50 disabled:opacity-50 text-primary-600 border border-primary-600 font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    Add to Cart
                                </button>
                                <button className="p-3.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-lg transition-colors flex items-center justify-center">
                                    <Heart size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Product Description</h3>
                            <div className="prose max-w-none text-gray-600">
                                <p className="whitespace-pre-wrap">{product.description}</p>
                            </div>
                        </div>

                    </div>

                    {/* Right: Seller Info */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <Link href={`/sellers/${seller.slug}`} className="w-16 h-16 bg-gray-100 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
                                    {seller.logo ? (
                                        <img src={`/storage/${seller.logo}`} alt={seller.business_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary-300">
                                            <span className="text-2xl font-bold">{seller.business_name.charAt(0)}</span>
                                        </div>
                                    )}
                                </Link>
                                <div>
                                    <h3 className="font-bold text-gray-900 hover:text-primary-600 transition-colors">
                                        <Link href={`/sellers/${seller.slug}`}>{seller.business_name}</Link>
                                    </h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                        <MapPin size={14} />
                                        <span>{seller.city}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between py-3 border-y border-gray-100 mb-4">
                                <div className="text-center">
                                    <span className="block text-sm text-gray-500">Rating</span>
                                    <span className="font-bold text-gray-900">{seller.average_rating > 0 ? parseFloat(seller.average_rating).toFixed(1) : 'New'}</span>
                                </div>
                                <div className="w-px h-8 bg-gray-200"></div>
                                <div className="text-center">
                                    <span className="block text-sm text-gray-500">Joined</span>
                                    <span className="font-bold text-gray-900">{new Date(seller.created_at).getFullYear()}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <a href={`https://wa.me/${seller.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg font-medium transition-colors">
                                    <MessageCircle size={18} />
                                    WhatsApp
                                </a>
                                <a href={`tel:${seller.phone}`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">
                                    <Phone size={18} />
                                    Show Number
                                </a>
                                <Link href={`/sellers/${seller.slug}`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg font-medium transition-colors mt-2">
                                    View Store
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                            
                            <div className="mt-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900">Secure Payments</h4>
                                        <p className="text-xs text-gray-500 mt-1">100% secure payments using mobile money or cards.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg shrink-0">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900">Local Delivery</h4>
                                        <p className="text-xs text-gray-500 mt-1">Delivery arranged directly with the seller.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {relatedProducts.map(rel => (
                                <ProductCard key={rel.id} product={rel} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
