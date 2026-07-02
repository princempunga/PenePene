import React from 'react';
import SectionHeader from '../UI/SectionHeader';
import SectionReveal from '../UI/SectionReveal';
import StaggerChildren, { StaggerItem } from '../UI/StaggerChildren';
import { Quote, Star } from 'lucide-react';

export default function Testimonials() {
    const testimonials = [
        {
            id: 1,
            name: "Sarah M.",
            role: "Frequent Buyer",
            content: "PenePene changed how I shop locally. The direct contact with sellers and the fast discovery makes it so much better than traditional e-commerce.",
            rating: 5,
            image: "https://i.pravatar.cc/150?img=47"
        },
        {
            id: 2,
            name: "David K.",
            role: "Electronics Seller",
            content: "Since moving my store to PenePene, my sales have tripled. The platform is incredibly easy to use and the local reach is phenomenal.",
            rating: 5,
            image: "https://i.pravatar.cc/150?img=11"
        },
        {
            id: 3,
            name: "Grace A.",
            role: "Fashion Retailer",
            content: "The best marketplace for local businesses. The support team is great and the premium tools really help me stand out from the competition.",
            rating: 4,
            image: "https://i.pravatar.cc/150?img=5"
        }
    ];

    return (
        <SectionReveal className="py-20 bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Loved by Buyers & Sellers</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">Don't just take our word for it. Here is what our community has to say about their experience on PenePene.</p>
                </div>

                <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8" stagger={0.12}>
                    {testimonials.map((testimonial) => (
                        <StaggerItem key={testimonial.id}>
                            <div className="web-card bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl relative h-full">
                                <Quote className="absolute top-6 right-6 text-gray-100 w-16 h-16" />

                                <div className="flex gap-1 mb-6 relative z-10">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} className={i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                                    ))}
                                </div>

                                <p className="text-gray-700 leading-relaxed mb-8 relative z-10 italic">
                                    "{testimonial.content}"
                                </p>

                                <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-100" />
                                    <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <span className="text-sm text-primary-600 font-medium">{testimonial.role}</span>
                                    </div>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerChildren>
            </div>
        </SectionReveal>
    );
}
