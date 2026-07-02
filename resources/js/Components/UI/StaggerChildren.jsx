import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { defaultViewport, staggerContainer, staggerItem } from '@/lib/motion';

export function StaggerItem({ children, className = '', variants = staggerItem }) {
    const prefersReducedMotion = useReducedMotion();
    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }
    return (
        <motion.div className={className} variants={variants}>
            {children}
        </motion.div>
    );
}

export default function StaggerChildren({
    children,
    className = '',
    stagger = 0.07,
    delayChildren = 0.05,
    viewport = defaultViewport,
}) {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer(stagger, delayChildren)}
        >
            {children}
        </motion.div>
    );
}
