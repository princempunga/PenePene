import React from 'react';
import { Link } from '@inertiajs/react';

export default function AdminFilterTabs({ items, activeValue, onSelect, useLinks = false, baseHref = '' }) {
    return (
        <div className="admin-filter-tabs inline-flex max-w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm">
            {items.map(({ value, label }) => {
                const isActive = activeValue === value || (!activeValue && value === 'all');
                const className = `whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all duration-200 ${
                    isActive
                        ? 'bg-[#002E5D] text-white shadow-md shadow-[#002E5D]/20'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-[#002E5D]'
                }`;

                if (useLinks) {
                    return (
                        <Link key={value} href={`${baseHref}?status=${value}`} className={className}>
                            {label ?? value}
                        </Link>
                    );
                }

                return (
                    <button key={value} type="button" onClick={() => onSelect?.(value)} className={className}>
                        {label ?? value}
                    </button>
                );
            })}
        </div>
    );
}
