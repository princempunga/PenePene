/**
 * Animations légères — transform/opacity uniquement (GPU-friendly, pas de blur)
 */

export const EASE = {
    outExpo: [0.16, 1, 0.3, 1],
    outQuart: [0.25, 1, 0.5, 1],
    inOutCubic: [0.65, 0, 0.35, 1],
    figmaSmooth: [0.22, 1, 0.36, 1],
    figmaEnter: [0.0, 0.0, 0.2, 1],
    figmaExit: [0.4, 0.0, 1, 1],
    elasticOut: [0.34, 1.56, 0.64, 1],
};

export const SPRING = {
    gentle: { type: 'spring', stiffness: 260, damping: 28, mass: 0.8 },
    smooth: { type: 'spring', stiffness: 320, damping: 32, mass: 0.75 },
    snappy: { type: 'spring', stiffness: 400, damping: 34, mass: 0.7 },
    bouncy: { type: 'spring', stiffness: 300, damping: 22, mass: 0.8 },
    magnetic: { type: 'spring', stiffness: 350, damping: 26, mass: 0.6 },
};

export const DURATION = {
    fast: 0.25,
    normal: 0.4,
    slow: 0.55,
    reveal: 0.5,
};

export const premiumPageTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

export const maskRevealUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.reveal, ease: EASE.outExpo },
    },
};

export const maskRevealClip = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.reveal, ease: EASE.outExpo },
    },
};

export const fadeBlurUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.normal, ease: EASE.outExpo },
    },
};

export const scaleReveal = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: DURATION.normal, ease: EASE.outExpo },
    },
};

export const slideRevealLeft = {
    hidden: { opacity: 0, x: -24 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: DURATION.normal, ease: EASE.outExpo },
    },
};

export const slideRevealRight = {
    hidden: { opacity: 0, x: 24 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: DURATION.normal, ease: EASE.outExpo },
    },
};

export const staggerPremium = (stagger = 0.06, delayChildren = 0.04) => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: stagger, delayChildren },
    },
});

export const staggerItemPremium = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.normal, ease: EASE.outExpo },
    },
};

export const cardHoverPremium = {
    rest: { y: 0, scale: 1 },
    hover: {
        y: -4,
        scale: 1.01,
        transition: { duration: DURATION.fast, ease: EASE.outExpo },
    },
    tap: { scale: 0.99, transition: { duration: 0.08 } },
};

export const premiumViewport = { once: true, margin: '-40px', amount: 0.08 };

export const lenisEasing = (t) => Math.min(1, 1.001 - 2 ** (-10 * t));
