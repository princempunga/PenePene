import React, { useRef } from 'react';
import ProductCard from '../Product/ProductCard';
import SectionHeader from '../UI/SectionHeader';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDER_TITLES = [
    'Produits recommandés',
    'Meilleures offres',
    'Nouveautés',
    'Sélection du moment',
];

export default function ProductSlider({ products, title, index = 0 }) {
    const scrollRef = useRef(null);

    if (!products || products.length === 0) return null;

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.8;
        el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    const sliderTitle = title || SLIDER_TITLES[index] || `Sélection ${index + 1}`;

    return (
        <section className="py-8 sm:py-10 bg-white even:bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-5">
                    <SectionHeader
                        title={sliderTitle}
                        subtitle={`${products.length} produits mis en avant`}
                    />
                    <div className="hidden sm:flex items-center gap-2 shrink-0 ml-4">
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                            aria-label="Précédent"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                            aria-label="Suivant"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
                >
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="w-[45vw] sm:w-[28vw] md:w-[22vw] lg:w-[calc(20%-0.8rem)] max-w-[220px] flex-shrink-0 snap-start"
                        >
                            <ProductCard
                                product={product}
                                badge={product.promotion_status === 'active' ? 'sponsored' : null}
                                compact
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
