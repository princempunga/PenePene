import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null; // Only prev, next, and 1 page

    return (
        <div className="flex flex-wrap items-center justify-center gap-1 mt-8">
            {links.map((link, index) => {
                let label = link.label;
                if (label.includes('Previous')) label = <ChevronLeft size={18} />;
                if (label.includes('Next')) label = <ChevronRight size={18} />;

                const isActive = link.active;
                const isUrl = !!link.url;

                if (!isUrl) {
                    return (
                        <div 
                            key={index} 
                            className="w-10 h-10 flex items-center justify-center text-gray-400 bg-gray-50 rounded-md border border-gray-200 cursor-not-allowed"
                        >
                            {label}
                        </div>
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
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
