import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import HeroSection from '@/Components/Home/HeroSection';
import TrustIndicators from '@/Components/Home/TrustIndicators';
import PopularCategories from '@/Components/Home/PopularCategories';
import FlashDeals from '@/Components/Home/FlashDeals';
import TrendingProducts from '@/Components/Home/TrendingProducts';
import FeaturedProducts from '@/Components/Home/FeaturedProducts';
import SponsoredProducts from '@/Components/Home/SponsoredProducts';
import NearbyProducts from '@/Components/Home/NearbyProducts';
import TopSellers from '@/Components/Home/TopSellers';
import HowItWorks from '@/Components/Home/HowItWorks';
import SellerBanner from '@/Components/Home/SellerBanner';
import Testimonials from '@/Components/Home/Testimonials';

export default function Index({ 
    featuredProducts, 
    popularCategories, 
    topSellers, 
    sponsoredProducts, 
    nearbyProducts, 
    trendingProducts, 
    flashDeals 
}) {
    return (
        <AppLayout>
            <HeroSection />
            <TrustIndicators />
            <PopularCategories categories={popularCategories} />
            <FlashDeals products={flashDeals} />
            <TrendingProducts products={trendingProducts} />
            <FeaturedProducts products={featuredProducts} />
            <SponsoredProducts products={sponsoredProducts} />
            <NearbyProducts products={nearbyProducts} />
            <HowItWorks />
            <TopSellers sellers={topSellers} />
            <SellerBanner />
            <Testimonials />
        </AppLayout>
    );
}
