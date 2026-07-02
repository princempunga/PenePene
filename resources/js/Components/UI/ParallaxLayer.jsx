import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/**
 * Parallaxe légère au scroll — profondeur type landing premium
 */
export default function ParallaxLayer({
    children,
    className = '',
    speed = 0.15,
    offset = ['start end', 'end start'],
}) {
    const ref = useRef(null);
    const prefersReducedMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset });
    const y = useTransform(scrollYProgress, [0, 1], [speed * -80, speed * 80]);

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div ref={ref} className={className}>
            <motion.div style={{ y }}>{children}</motion.div>
        </div>
    );
}
