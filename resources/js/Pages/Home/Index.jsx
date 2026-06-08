import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import HeroSection from '@/Components/Home/HeroSection';
import PopularCategories from '@/Components/Home/PopularCategories';
import FeaturedProducts from '@/Components/Home/FeaturedProducts';
import TopSellers from '@/Components/Home/TopSellers';
import SellerBanner from '@/Components/Home/SellerBanner';

export default function Index({ featuredProducts, popularCategories, topSellers }) {
    return (
        <AppLayout>
            <HeroSection />
            <PopularCategories categories={popularCategories} />
            <FeaturedProducts products={featuredProducts} title="Featured Products" />
            <TopSellers sellers={topSellers} />
            <SellerBanner />
        </AppLayout>
    );
}
