import React from 'react';
import { Link } from '@inertiajs/react';

const LOGO_SRC = '/images/logo.png';

export default function Logo({
    className = 'h-16 w-auto max-w-[280px]',
    href = '/',
    asLink = true,
    surface = false,
    /** @deprecated use surface on dark backgrounds */
    inverted = false,
}) {
    const img = (
        <img
            src={LOGO_SRC}
            alt="PenePene — Tout proche."
            className={`object-contain object-left ${className}`}
        />
    );

    const showSurface = surface || inverted;

    const content = showSurface ? (
        <div className="inline-flex items-center justify-center bg-white rounded-2xl px-5 py-3 shadow-lg shadow-black/8 border border-gray-100/80">
            {img}
        </div>
    ) : img;

    if (!asLink) return content;

    return (
        <Link href={href} className="inline-flex items-center shrink-0 transition-opacity duration-300 hover:opacity-90">
            {content}
        </Link>
    );
}
