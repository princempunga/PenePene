import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { SPRING } from '@/lib/premiumMotion';

/**
 * Effet magnétique au survol — boutons et CTA premium
 */
export default function Magnetic({
    children,
    className = '',
    strength = 0.32,
    as = 'div',
}) {
    const ref = useRef(null);
    const prefersReducedMotion = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, SPRING.magnetic);
    const springY = useSpring(y, SPRING.magnetic);
    const Component = motion[as] || motion.div;

    if (prefersReducedMotion) {
        const Tag = as === 'span' ? 'span' : 'div';
        return <Tag className={className}>{children}</Tag>;
    }

    const handleMove = (e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * strength);
        y.set((e.clientY - cy) * strength);
    };

    const handleLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <Component
            ref={ref}
            className={className}
            style={{ x: springX, y: springY }}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
        >
            {children}
        </Component>
    );
}
