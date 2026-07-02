import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { defaultViewport } from '@/lib/motion';
import { maskRevealClip, EASE, DURATION } from '@/lib/premiumMotion';

/**
 * Révélation texte par masque — style Figma Smart Animate
 */
export default function MaskReveal({
    children,
    className = '',
    delay = 0,
    as = 'div',
    viewport = defaultViewport,
}) {
    const prefersReducedMotion = useReducedMotion();
    const Component = motion[as] || motion.div;

    if (prefersReducedMotion) {
        const Tag = as === 'h2' || as === 'h3' ? as : 'div';
        return <Tag className={className}>{children}</Tag>;
    }

    return (
        <Component
            className={`premium-mask-reveal ${className}`}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={maskRevealClip}
            transition={{ delay, duration: DURATION.reveal, ease: EASE.outExpo }}
            style={{ transformOrigin: 'bottom center' }}
        >
            {children}
        </Component>
    );
}
