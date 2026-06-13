import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function resolveHref(url) {
    if (!url) {
        return null;
    }

    if (url.startsWith('/') && !url.startsWith('//')) {
        return url;
    }

    try {
        const parsed = new URL(url, window.location.origin);

        if (parsed.origin !== window.location.origin) {
            return url;
        }

        return `${parsed.pathname}${parsed.search}`;
    } catch {
        return url;
    }
}

function renderLabel(label) {
    const text = String(label ?? '');
    const rawLabel = text.replace(/&[^;]+;/g, '').trim().toLowerCase();

    if (rawLabel.includes('previous') || rawLabel.includes('précédent') || rawLabel.includes('precedent')) {
        return <ChevronLeft size={18} aria-label="Page précédente" />;
    }

    if (rawLabel.includes('next') || rawLabel.includes('suivant')) {
        return <ChevronRight size={18} aria-label="Page suivante" />;
    }

    if (text.includes('&laquo;')) {
        return <ChevronLeft size={18} />;
    }

    if (text.includes('&raquo;')) {
        return <ChevronRight size={18} />;
    }

    return text;
}

export default function Pagination({ links }) {
    if (!Array.isArray(links) || links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-1 mt-8">
            {links.map((link, index) => {
                const label = renderLabel(link?.label);
                const isActive = Boolean(link?.active);
                const href = resolveHref(link?.url);

                if (!href) {
                    return (
                        <div
                            key={`page-${index}`}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 bg-gray-50 rounded-md border border-gray-200 cursor-not-allowed"
                            aria-disabled="true"
                        >
                            {label}
                        </div>
                    );
                }

                return (
                    <Link
                        key={`page-${index}`}
                        href={href}
                        preserveScroll
                        className={`w-10 h-10 flex items-center justify-center rounded-md border transition-colors ${
                            isActive
                                ? 'bg-primary-600 text-white border-primary-600 font-bold'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}
