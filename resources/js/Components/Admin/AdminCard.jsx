import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function AdminCard({
    title,
    icon: Icon,
    actionLabel,
    actionHref,
    children,
    className = '',
    noPadding = false,
}) {
    return (
        <div className={`admin-card overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
            {(title || actionLabel) && (
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-5 py-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                        {Icon && (
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#002E5D]/8 text-[#002E5D]">
                                <Icon size={18} />
                            </span>
                        )}
                        {title && <h2 className="truncate font-bold text-[#002E5D]">{title}</h2>}
                    </div>
                    {actionLabel && actionHref && (
                        <Link
                            href={actionHref}
                            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#0056B3] transition-colors hover:text-[#002E5D]"
                        >
                            {actionLabel}
                            <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
            )}
            <div className={noPadding ? '' : 'p-0'}>{children}</div>
        </div>
    );
}
