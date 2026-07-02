import React from 'react';

/** Passthrough léger — scroll natif (plus rapide que Lenis). */
export default function WebMotionProvider({ children }) {
    return <div className="web-motion-root">{children}</div>;
}
