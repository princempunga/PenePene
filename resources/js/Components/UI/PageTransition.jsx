import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePage } from '@inertiajs/react';

export default function PageTransition({ children }) {
    const { url } = usePage();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={url}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
