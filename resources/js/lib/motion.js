/**
 * Variantes et transitions partagées — interface web publique
 * Courbes premium alignées sur premiumMotion.js
 */

import {
    EASE,
    SPRING,
    DURATION,
    premiumPageTransition,
    fadeBlurUp,
    scaleReveal,
    slideRevealLeft,
    slideRevealRight,
    staggerPremium,
    staggerItemPremium,
    cardHoverPremium,
    premiumViewport,
} from './premiumMotion';

export const EASE_OUT_EXPO = EASE.figmaSmooth;
export const EASE_SPRING = SPRING.smooth;
export const EASE_SPRING_SOFT = SPRING.gentle;
export const EASE_SPRING_SNAPPY = SPRING.snappy;

export const pageTransition = {
    initial: premiumPageTransition.initial,
    animate: premiumPageTransition.animate,
    exit: premiumPageTransition.exit,
    transition: { duration: DURATION.fast, ease: EASE.outExpo },
};

export const fadeUp = fadeBlurUp;

export const fadeIn = {
    hidden: { opacity: 0, filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: { duration: DURATION.normal, ease: EASE.outExpo },
    },
};

export const scaleIn = scaleReveal;

export const slideInLeft = slideRevealLeft;
export const slideInRight = slideRevealRight;

export const staggerContainer = staggerPremium;
export const staggerItem = staggerItemPremium;
export const cardHover = cardHoverPremium;

export const defaultViewport = premiumViewport;
