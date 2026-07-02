import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { defaultViewport, fadeUp } from '@/lib/motion';

/**
 * Révélation au scroll — wrapper réutilisable pour sections et cartes.
 */
export default function AnimateIn({
    children,
    className = '',
    variant = fadeUp,
    delay = 0,
    duration,
    as = 'div',
    viewport = defaultViewport,
    ...props
}) {
    const prefersReducedMotion = useReducedMotion();
    const Component = motion[as] || motion.div;

    if (prefersReducedMotion) {
        const Tag = as === 'section' ? 'section' : 'div';
        return <Tag className={className}>{children}</Tag>;
    }

    const customVariant = duration
        ? {
              hidden: variant.hidden,
              visible: {
                  ...variant.visible,
                  transition: { ...variant.visible?.transition, duration, delay },
              },
          }
        : delay
          ? {
                hidden: variant.hidden,
                visible: {
                    ...variant.visible,
                    transition: { ...variant.visible?.transition, delay },
                },
            }
          : variant;

    return (
        <Component
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={customVariant}
            {...props}
        >
            {children}
        </Component>
    );
}
