import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import HeroSection from '@/Components/Home/HeroSection';
import TrustIndicators from '@/Components/Home/TrustIndicators';
import PopularCategories from '@/Components/Home/PopularCategories';
import ProductSlider from '@/Components/Home/ProductSlider';
import HowItWorks from '@/Components/Home/HowItWorks';
import SellerBanner from '@/Components/Home/SellerBanner';
import Testimonials from '@/Components/Home/Testimonials';
import { absoluteUrl, toAbsoluteImageUrl } from '@/utils/seo';

export default function Index({
    heroProducts,
    popularCategories,
    productSliders = [],
    featuredPromotions,
}) {
    return (
        <AppLayout>
            <Head title="PenePene — Marketplace connectant artisans, vendeurs et acheteurs en RDC">
                <meta name="description" content="PenePene est la marketplace congolaise qui connecte artisans, vendeurs et acheteurs. Découvrez des produits uniques, locaux et pas cher en RDC." />
                <meta property="og:title" content="PenePene — Marketplace connectant artisans, vendeurs et acheteurs en RDC" />
                <meta property="og:description" content="PenePene est la marketplace congolaise qui connecte artisans, vendeurs et acheteurs. Découvrez des produits uniques, locaux et pas cher en RDC." />
                <meta property="og:image" content={toAbsoluteImageUrl('/images/og-image-home.jpg')} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={absoluteUrl('/')} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="PenePene — Marketplace connectant artisans, vendeurs et acheteurs en RDC" />
                <meta name="twitter:description" content="PenePene est la marketplace congolaise qui connecte artisans, vendeurs et acheteurs. Découvrez des produits uniques, locaux et pas cher en RDC." />
                <meta name="twitter:image" content={toAbsoluteImageUrl('/images/og-image-home.jpg')} />
                <link rel="canonical" href={absoluteUrl('/')} />
            </Head>

            <HeroSection heroProducts={heroProducts} featuredPromotions={featuredPromotions} />
            <TrustIndicators />
            <PopularCategories categories={popularCategories} />

            {productSliders.map((products, index) => (
                <div key={index} className="perf-section">
                    <ProductSlider
                        products={products}
                        index={index}
                    />
                </div>
            ))}

            <div className="perf-section">
                <HowItWorks />
            </div>
            <div className="perf-section">
                <SellerBanner />
            </div>
            <div className="perf-section">
                <Testimonials />
            </div>
        </AppLayout>
    );
}
