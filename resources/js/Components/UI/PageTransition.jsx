import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import { pageTransition } from '@/lib/motion';

export default function PageTransition({ children }) {
    const { url } = usePage();
    const prefersReduced = useReducedMotion();

    if (prefersReduced) {
        return <div className="w-full web-page">{children}</div>;
    }

    return (
        <motion.div
            key={url}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            transition={pageTransition.transition}
            className="w-full web-page"
            style={{ willChange: 'transform, opacity' }}
        >
            {children}
        </motion.div>
    );
}
