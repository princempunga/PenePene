import React from 'react';
import { getCategoryIconMeta } from '@/lib/categoryIcons';

/**
 * Icône ronde colorée pour une catégorie (slug)
 */
export default function CategoryIcon({
    slug,
    size = 24,
    className = '',
    iconClassName = '',
    showRing = true,
}) {
    const { Icon, color, bg, ring, hoverBg } = getCategoryIconMeta(slug);

    return (
        <div
            className={`flex items-center justify-center rounded-full shrink-0 transition-colors duration-300 ${bg} ${hoverBg} ${
                showRing ? `ring-2 ${ring}` : ''
            } ${className}`}
            style={{ width: size * 2, height: size * 2 }}
        >
            <Icon size={size} className={`${color} ${iconClassName}`} strokeWidth={2} />
        </div>
    );
}
