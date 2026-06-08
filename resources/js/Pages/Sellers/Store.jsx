import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/Product/ProductCard';
import Pagination from '@/Components/UI/Pagination';
import RatingStars from '@/Components/UI/RatingStars';
import { MapPin, Phone, MessageCircle, Calendar, ShieldCheck, Mail } from 'lucide-react';

export default function Store({ seller, products, reviews }) {
    return (
        <AppLayout>
            {/* Store Header/Banner */}
            <div className="relative bg-white border-b">
                <div className="h-48 md:h-64 bg-gray-900 relative">
                    {seller.banner ? (
                        <img src={`/storage/${seller.banner}`} alt={`${seller.business_name} banner`} className="w-full h-full object-cover opacity-80" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700 opacity-90"></div>
                    )}
                </div>
                
                <div className="max-w-7xl mx-auto px-4 relative pb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden shrink-0 flex items-center justify-center relative z-10">
                            {seller.logo ? (
                                <img src={`/storage/${seller.logo}`} alt={seller.business_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-5xl font-bold text-primary-300">{seller.business_name.charAt(0)}</span>
                            )}
                        </div>
                        
                        <div className="flex-1 pb-2">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{seller.business_name}</h1>
                                {seller.status === 'verified' && (
                                    <ShieldCheck className="text-blue-500" size={24} title="Verified Seller" />
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span>{seller.city}, {seller.country}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>Joined {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                </div>
                                {seller.average_rating > 0 && (
                                    <div className="flex items-center gap-2">
                                        <RatingStars rating={seller.average_rating} count={seller.total_reviews} />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto pb-2 shrink-0">
                            <a href={`https://wa.me/${seller.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2 px-6 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-md font-medium transition-colors shadow-sm">
                                <MessageCircle size={18} />
                                WhatsApp
                            </a>
                            <a href={`tel:${seller.phone}`} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2 px-6 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-md font-medium transition-colors shadow-sm">
                                <Phone size={18} />
                                Call Seller
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 prose max-w-3xl text-gray-600">
                        <p>{seller.description}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Main Content: Products */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Store Products</h2>
                            <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                                {products.total} items
                            </span>
                        </div>

                        {products.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                    {products.data.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                                <Pagination links={products.links} />
                            </>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-500">This seller currently has no active products listed.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Reviews */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                                Recent Reviews
                                <span className="text-sm font-normal text-gray-500">{seller.total_reviews} total</span>
                            </h3>

                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map(review => (
                                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-gray-900">{review.buyer?.user?.name || 'Customer'}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="mb-2">
                                                <RatingStars rating={review.rating} size={14} />
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-gray-600 line-clamp-3">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-4">No reviews yet.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
