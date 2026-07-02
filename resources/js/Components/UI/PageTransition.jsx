import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import { DURATION, EASE } from '@/lib/premiumMotion';

export default function PageTransition({ children }) {
    const { url } = usePage();
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div className="w-full h-full web-page">{children}</div>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={url}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.fast, ease: EASE.outExpo }}
                className="w-full h-full web-page"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
