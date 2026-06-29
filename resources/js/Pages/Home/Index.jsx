import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import HeroSection from '@/Components/Home/HeroSection';
import TrustIndicators from '@/Components/Home/TrustIndicators';
import PopularCategories from '@/Components/Home/PopularCategories';
import ProductSlider from '@/Components/Home/ProductSlider';
import HowItWorks from '@/Components/Home/HowItWorks';
import SellerBanner from '@/Components/Home/SellerBanner';
import Testimonials from '@/Components/Home/Testimonials';

export default function Index({
    heroProducts,
    popularCategories,
    productSliders = [],
    featuredPromotions,
}) {
    return (
        <AppLayout>
            <HeroSection heroProducts={heroProducts} featuredPromotions={featuredPromotions} />
            <TrustIndicators />
            <PopularCategories categories={popularCategories} />

            {productSliders.map((products, index) => (
                <ProductSlider
                    key={index}
                    products={products}
                    index={index}
                />
            ))}

            <HowItWorks />
            <SellerBanner />
            <Testimonials />
        </AppLayout>
    );
}
