import React from 'react';

export function AdminTable({ children, className = '' }) {
    return (
        <div className={`admin-table-wrap overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
            <div className="overflow-x-auto">
                <table className="admin-table w-full text-left text-sm text-slate-600">{children}</table>
            </div>
        </div>
    );
}

export function AdminTableHead({ children }) {
    return (
        <thead className="border-b border-slate-200 bg-gradient-to-r from-[#002E5D]/[0.04] to-slate-50/80 text-xs font-bold uppercase tracking-wide text-[#002E5D]/70">
            {children}
        </thead>
    );
}

export function AdminTableBody({ children }) {
    return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function AdminTableEmpty({ icon: Icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            {Icon && <Icon size={40} className="mb-3 text-slate-300" />}
            <p className="font-semibold text-[#002E5D]">{title}</p>
            {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
        </div>
    );
}
