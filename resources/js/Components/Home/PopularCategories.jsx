import React from 'react';
import { Link } from '@inertiajs/react';
import { Package, Smartphone, Shirt, Car, Home, Heart, Dumbbell, Briefcase, UserPlus, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeader from '../UI/SectionHeader';

export default function PopularCategories({ categories }) {
    // If we have less than 10 categories, we pad with premium demo data to maintain structural integrity
    const demoCategories = [
        { id: 'd1', name: 'Electronics', slug: 'electronics', icon: <Smartphone size={28} />, products_count: 1450 },
        { id: 'd2', name: 'Fashion', slug: 'fashion', icon: <Shirt size={28} />, products_count: 2300 },
        { id: 'd3', name: 'Vehicles', slug: 'vehicles', icon: <Car size={28} />, products_count: 850 },
        { id: 'd4', name: 'Home & Living', slug: 'home-living', icon: <Home size={28} />, products_count: 1200 },
        { id: 'd5', name: 'Health & Beauty', slug: 'health-beauty', icon: <Heart size={28} />, products_count: 3100 },
        { id: 'd6', name: 'Sports', slug: 'sports', icon: <Dumbbell size={28} />, products_count: 640 },
        { id: 'd7', name: 'Agriculture', slug: 'agriculture', icon: <Map size={28} />, products_count: 420 },
        { id: 'd8', name: 'Services', slug: 'services', icon: <Briefcase size={28} />, products_count: 980 },
        { id: 'd9', name: 'Jobs', slug: 'jobs', icon: <UserPlus size={28} />, products_count: 310 },
        { id: 'd10', name: 'Real Estate', slug: 'real-estate', icon: <Home size={28} />, products_count: 560 },
    ];

    const displayCategories = categories && categories.length > 5 ? categories : demoCategories;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader 
                    title="Popular Categories" 
                    subtitle="Explore thousands of products across our top categories."
                    actionText="View all categories"
                    actionLink="/categories"
                />
                
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
                >
                    {displayCategories.map(category => (
                        <motion.div key={category.id} variants={itemVariants}>
                            <Link 
                                href={`/categories/${category.slug}`}
                                className="bg-gray-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group border border-transparent hover:border-gray-100 h-full"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                    {category.icon && typeof category.icon !== 'string' ? (
                                        category.icon
                                    ) : category.icon ? (
                                        <img src={`/storage/${category.icon}`} alt={category.name} className="w-8 h-8" />
                                    ) : (
                                        <Package size={28} />
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {category.name}
                                </h3>
                                {(category.products_count !== undefined || category.products_count !== null) && (
                                    <p className="text-sm text-gray-500 mt-1 font-medium">
                                        {category.products_count}+ items
                                    </p>
                                )}
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
