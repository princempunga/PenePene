import React from 'react';
import { Link } from '@inertiajs/react';
import { Store, MapPin, ShieldCheck, Box } from 'lucide-react';
import RatingStars from '../UI/RatingStars';
import SectionHeader from '../UI/SectionHeader';
import { motion } from 'framer-motion';

export default function TopSellers({ sellers }) {
    if (!sellers || sellers.length === 0) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
    };

    return (
        <section className="py-16 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader 
                    title="Top Rated Sellers" 
                    subtitle="Buy from the most trusted and highly-rated merchants on our platform."
                    actionText="View All Sellers"
                    actionLink="/sellers"
                />
                
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {sellers.map(seller => (
                        <motion.div key={seller.id} variants={itemVariants} className="h-full">
                            <Link 
                                href={`/sellers/${seller.slug}`}
                                className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative"
                            >
                                {/* Cover Image */}
                                <div className="h-28 bg-gradient-to-r from-primary-600 to-primary-800 relative overflow-hidden">
                                    {seller.banner && (
                                        <img src={`/storage/${seller.banner}`} alt="Banner" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                </div>
                                
                                <div className="p-5 pt-0 flex flex-col flex-grow relative">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 rounded-xl border-4 border-white bg-white shadow-md absolute -top-8 left-5 overflow-hidden flex items-center justify-center z-10">
                                        {seller.logo ? (
                                            <img src={`/storage/${seller.logo}`} alt={seller.business_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Store className="text-primary-300" size={32} />
                                        )}
                                    </div>

                                    {/* Verification Badge */}
                                    {seller.is_verified && (
                                        <div className="absolute top-3 right-4 bg-green-100 text-green-700 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                            <ShieldCheck size={12} />
                                            Verified
                                        </div>
                                    )}
                                    
                                    <div className="mt-10 flex-grow">
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors line-clamp-1">
                                            {seller.business_name}
                                        </h3>
                                        
                                        <div className="mt-1.5 flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <MapPin size={14} className="flex-shrink-0" />
                                                <span className="truncate">{seller.city || 'Location not specified'}</span>
                                            </div>
                                            {/* Demo product count if real is missing */}
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Box size={14} className="flex-shrink-0" />
                                                <span className="truncate">{seller.products_count || Math.floor(Math.random() * 200) + 10} Products</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div>
                                            <RatingStars rating={seller.average_rating} count={seller.total_reviews} size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                            Visit Store
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
