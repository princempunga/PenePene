import React from 'react';

const variants = {
    pending: 'bg-amber-50 text-amber-800 ring-amber-200/60',
    active: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
    verified: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
    confirmed: 'bg-blue-50 text-blue-800 ring-blue-200/60',
    shipped: 'bg-indigo-50 text-indigo-800 ring-indigo-200/60',
    delivered: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
    rejected: 'bg-red-50 text-red-800 ring-red-200/60',
    cancelled: 'bg-red-50 text-red-800 ring-red-200/60',
    suspended: 'bg-slate-100 text-slate-700 ring-slate-200/60',
    inactive: 'bg-slate-100 text-slate-600 ring-slate-200/60',
};

export default function AdminBadge({ children, variant = 'pending', icon: Icon, className = '' }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${variants[variant] ?? variants.pending} ${className}`}>
            {Icon && <Icon size={13} />}
            {children}
        </span>
    );
}
