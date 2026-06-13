import React from 'react';
import { Link } from '@inertiajs/react';

export default function BuyerAccountEmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref = '/products',
    accent = 'primary',
}) {
    const accentClasses = {
        primary: 'from-primary-50 to-blue-50 text-primary-600 ring-primary-100',
        amber: 'from-amber-50 to-orange-50 text-amber-600 ring-amber-100',
        purple: 'from-purple-50 to-indigo-50 text-purple-600 ring-purple-100',
    };

    const buttonClasses = {
        primary: 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/20',
        amber: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
        purple: 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20',
    };

    const accentStyle = accentClasses[accent] || accentClasses.primary;
    const buttonStyle = buttonClasses[accent] || buttonClasses.primary;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 via-white to-primary-50/30 pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-100/40 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

            <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-center">
                <div className={`mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br ${accentStyle} ring-8 flex items-center justify-center shadow-sm`}>
                    <Icon size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed mb-8">{description}</p>
                {actionLabel && (
                    <Link
                        href={actionHref}
                        className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all hover:-translate-y-0.5 ${buttonStyle}`}
                    >
                        {actionLabel}
                    </Link>
                )}
            </div>
        </div>
    );
}
