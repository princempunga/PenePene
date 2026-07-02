import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSplashReady } from '@/context/SplashContext';
import { EASE, DURATION } from '@/lib/premiumMotion';

const DIRECTIONS = {
    up: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
    down: { hidden: { opacity: 0, y: -16 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } },
};

export function RevealAfterSplash({
    children,
    className = '',
    delay = 0,
    direction = 'up',
    as = 'div',
}) {
    const splashReady = useSplashReady();
    const prefersReducedMotion = useReducedMotion();
    const ready = splashReady || prefersReducedMotion;
    const Component = motion[as] || motion.div;
    const variants = DIRECTIONS[direction] || DIRECTIONS.up;

    if (prefersReducedMotion) {
        const Tag = as === 'span' || as === 'p' ? as : 'div';
        return <Tag className={className}>{children}</Tag>;
    }

    return (
        <Component
            className={className}
            initial="hidden"
            animate={ready ? 'visible' : 'hidden'}
            variants={variants}
            transition={{ delay: ready ? delay : 0, duration: DURATION.normal, ease: EASE.outExpo }}
        >
            {children}
        </Component>
    );
}

/** Texte simple — pas d'animation mot par mot (plus performant). */
export function RevealWords({ text, className = '' }) {
    return <span className={className}>{text}</span>;
}
