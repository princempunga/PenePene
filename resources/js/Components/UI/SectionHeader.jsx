import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { defaultViewport, EASE_OUT_EXPO, slideInRight } from '@/lib/motion';
import { DURATION, EASE } from '@/lib/premiumMotion';
import MaskReveal from '@/Components/UI/MaskReveal';

export default function SectionHeader({ title, subtitle, actionText, actionLink }) {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return (
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
                <div className="max-w-2xl">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
                    {subtitle && <p className="mt-2 text-base text-gray-500">{subtitle}</p>}
                </div>
                {actionText && actionLink && (
                    <div className="mt-4 sm:mt-0">
                        <Link href={actionLink} className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold group transition-colors">
                            {actionText}
                            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div className="max-w-2xl overflow-hidden">
                <MaskReveal as="h2" className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {title}
                </MaskReveal>
                {subtitle && (
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={defaultViewport}
                        transition={{ delay: 0.08, duration: DURATION.normal, ease: EASE.outExpo }}
                        className="mt-2 text-base text-gray-500"
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>

            {actionText && actionLink && (
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={defaultViewport}
                    variants={slideInRight}
                    className="mt-4 sm:mt-0"
                >
                    <Link
                        href={actionLink}
                        className="premium-link inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold group transition-colors"
                    >
                        {actionText}
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500 ease-out" />
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
