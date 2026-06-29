import React from 'react';
import { Link } from '@inertiajs/react';

const EMBLEM = '/images/rdc-gov-emblem.svg';

export default function RdcGovLogo({
    className = '',
    href = '/',
    asLink = true,
    variant = 'full',
    surface = false,
    onDark = false,
}) {
    const emblem = (
        <img
            src={EMBLEM}
            alt=""
            className="h-full w-full object-contain"
            aria-hidden
        />
    );

    const content = (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`shrink-0 ${variant === 'compact' ? 'h-9 w-9' : 'h-11 w-11 sm:h-12 sm:w-12'}`}>
                {emblem}
            </div>
            {variant !== 'emblem' && (
                <div className="min-w-0 text-left leading-tight">
                    <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] ${onDark ? 'text-[#F7D618]' : 'text-[#007FFF]'}`}>
                        République Démocratique du Congo
                    </p>
                    <p className={`font-bold truncate ${onDark ? 'text-white' : 'text-[#002E5D]'} ${variant === 'compact' ? 'text-sm' : 'text-base sm:text-lg'}`}>
                        Gouvernement
                    </p>
                    {variant === 'full' && (
                        <p className={`text-[10px] sm:text-xs truncate ${onDark ? 'text-blue-100/70' : 'text-slate-500'}`}>
                            Gouvernance participative — Projets citoyens
                        </p>
                    )}
                </div>
            )}
        </div>
    );

    const wrapped = surface ? (
        <div className="inline-flex items-center rounded-2xl border border-white/20 bg-white/95 px-4 py-3 shadow-lg shadow-black/10 backdrop-blur-sm">
            {content}
        </div>
    ) : content;

    if (!asLink) return wrapped;

    return (
        <Link href={href} className="inline-flex shrink-0 transition-opacity hover:opacity-90">
            {wrapped}
        </Link>
    );
}
