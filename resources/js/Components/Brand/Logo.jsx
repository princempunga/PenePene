import React from 'react';
import { Link } from '@inertiajs/react';

const LOGO_SRC = '/images/logo.png';

export default function Logo({
    className = 'h-12 w-auto',
    href = '/',
    asLink = true,
    surface = false,
}) {
    const img = (
        <img
            src={LOGO_SRC}
            alt="PenePene — Tout proche."
            className={`object-contain ${className}`}
        />
    );

    const content = surface ? (
        <div className="inline-flex items-center bg-white rounded-2xl px-4 py-2.5 shadow-lg shadow-black/10">
            {img}
        </div>
    ) : img;

    if (!asLink) return content;

    return (
        <Link href={href} className="inline-flex items-center shrink-0">
            {content}
        </Link>
    );
}
