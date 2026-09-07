import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function PageTransition({ children }) {
    const { url } = usePage();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(false);
        const timer = requestAnimationFrame(() => {
            setAnimate(true);
        });
        return () => cancelAnimationFrame(timer);
    }, [url]);

    return (
        <div 
            className="w-full web-page"
            style={{
                opacity: animate ? 1 : 0,
                transition: 'opacity 0.2s ease-out'
            }}
        >
            {children}
        </div>
    );
}
