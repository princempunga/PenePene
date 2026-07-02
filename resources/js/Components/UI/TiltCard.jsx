import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { SPRING } from '@/lib/premiumMotion';

/**
 * Carte 3D inclinable au survol — effet prototype Figma
 */
export default function TiltCard({
    children,
    className = '',
    maxTilt = 8,
    scaleOnHover = 1.02,
}) {
    const ref = useRef(null);
    const prefersReducedMotion = useReducedMotion();
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const scale = useMotionValue(1);

    const springRotateX = useSpring(rotateX, SPRING.smooth);
    const springRotateY = useSpring(rotateY, SPRING.smooth);
    const springScale = useSpring(scale, SPRING.snappy);

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    const handleMove = (e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotateY.set(px * maxTilt * 2);
        rotateX.set(-py * maxTilt * 2);
        scale.set(scaleOnHover);
    };

    const handleLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
        scale.set(1);
    };

    return (
        <motion.div
            ref={ref}
            className={`premium-tilt ${className}`}
            style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
                scale: springScale,
                transformPerspective: 1200,
                transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
        >
            {children}
        </motion.div>
    );
}
