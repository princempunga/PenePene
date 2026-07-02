import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { defaultViewport } from '@/lib/motion';
import { DURATION, EASE } from '@/lib/premiumMotion';

export default function SectionReveal({ children, className = '', delay = 0 }) {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <section className={className}>{children}</section>;
    }

    return (
        <motion.section
            className={className}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: DURATION.normal, ease: EASE.outExpo, delay }}
        >
            {children}
        </motion.section>
    );
}
