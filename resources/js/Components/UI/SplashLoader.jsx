import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SplashProvider } from '@/context/SplashContext';

const LOGO_SRC = '/images/logo.png';
const SPLASH_DURATION_MS = 700;
const SPLASH_SEEN_KEY = 'penepene_splash_seen';

export default function SplashLoader({ children }) {
    const prefersReducedMotion = useReducedMotion();
    const skipSplash = prefersReducedMotion || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SPLASH_SEEN_KEY));

    const [visible, setVisible] = useState(!skipSplash);
    const [finished, setFinished] = useState(Boolean(skipSplash));
    const [splashReady, setSplashReady] = useState(Boolean(skipSplash));

    useEffect(() => {
        if (skipSplash) return undefined;

        const timer = setTimeout(() => setVisible(false), SPLASH_DURATION_MS);
        return () => clearTimeout(timer);
    }, [skipSplash]);

    useEffect(() => {
        if (finished) {
            document.body.classList.remove('splash-active');
            return undefined;
        }
        document.body.classList.add('splash-active');
        return () => document.body.classList.remove('splash-active');
    }, [finished]);

    const handleSplashExitComplete = () => {
        try {
            sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
        } catch {
            /* ignore */
        }
        setFinished(true);
        setSplashReady(true);
    };

    if (skipSplash) {
        return <SplashProvider splashReady>{children}</SplashProvider>;
    }

    return (
        <SplashProvider splashReady={splashReady}>
            <div className={finished ? undefined : 'splash-content-hidden'}>
                {children}
            </div>

            <AnimatePresence onExitComplete={handleSplashExitComplete}>
                {visible && (
                    <motion.div
                        key="splash"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="splash-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#0f1e5a] via-[#1434a0] to-[#0056B3]"
                        aria-live="polite"
                        aria-busy="true"
                        aria-label="Chargement de PenePene"
                    >
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="splash-logo-ring relative w-28 h-28 sm:w-32 sm:h-32">
                                <div className="splash-spinner absolute inset-0 rounded-full" />
                                <div className="absolute inset-[5px] rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden">
                                    <img
                                        src={LOGO_SRC}
                                        alt="PenePene"
                                        className="w-[72%] h-[72%] object-contain rounded-full"
                                        width={80}
                                        height={80}
                                        decoding="async"
                                    />
                                </div>
                            </div>
                            <p className="mt-6 text-xs font-semibold tracking-widest uppercase text-blue-100/90">
                                Chargement
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SplashProvider>
    );
}
