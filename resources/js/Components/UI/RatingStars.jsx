import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export default function RatingStars({ rating, count, size = 16 }) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} size={size} fill="currentColor" strokeWidth={0} />
                ))}
                {hasHalfStar && <StarHalf size={size} fill="currentColor" strokeWidth={0} />}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} size={size} strokeWidth={1.5} className="text-gray-300" />
                ))}
            </div>
            {count !== undefined && (
                <span className="text-sm text-gray-500">({count})</span>
            )}
        </div>
    );
}
