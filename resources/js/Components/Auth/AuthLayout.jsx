import React from 'react';
import { CheckCircle2, Shield, Star } from 'lucide-react';
import Logo from '@/Components/Brand/Logo';

const accents = {
    blue: {
        panel: 'from-blue-950 via-blue-900 to-indigo-950',
        glow: 'bg-blue-400/20',
        bullet: 'text-blue-300',
        badge: 'bg-blue-500/20 text-blue-100 border-blue-400/30',
        trust: 'text-blue-200',
    },
    amber: {
        panel: 'from-amber-700 via-amber-600 to-orange-700',
        glow: 'bg-amber-300/20',
        bullet: 'text-amber-200',
        badge: 'bg-amber-500/20 text-amber-50 border-amber-300/30',
        trust: 'text-amber-100',
    },
};

export default function AuthLayout({
    accent = 'blue',
    title,
    subtitle,
    headline,
    benefits = [],
    children,
    maxWidth = 'max-w-md',
    footer,
}) {
    const theme = accents[accent] || accents.blue;

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
            {/* Brand panel */}
            <div className={`hidden lg:flex lg:w-[44%] xl:w-[42%] bg-gradient-to-br ${theme.panel} text-white relative overflow-hidden p-10 xl:p-14 flex-col justify-between`}>
                <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full ${theme.glow} blur-3xl`} />
                <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full ${theme.glow} blur-3xl`} />
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />

                <div className="relative z-10">
                    <Logo surface className="h-14 sm:h-16 w-auto max-w-[220px]" />
                </div>

                <div className="relative z-10 my-10">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider mb-6 ${theme.badge}`}>
                        <Star size={14} className="fill-current" />
                        Premium Marketplace
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-8">{headline}</h1>
                    <ul className="space-y-4 text-lg text-white/90">
                        {benefits.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className={`${theme.bullet} shrink-0 mt-0.5`} size={22} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Marketplace visual */}
                    <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
                        {['Verified Sellers', 'Secure Orders', 'Fast Delivery'].map((label) => (
                            <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-3 text-center">
                                <Shield className="mx-auto mb-2 text-white/80" size={20} />
                                <p className="text-xs font-medium text-white/90 leading-snug">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`relative z-10 text-sm ${theme.trust}`}>
                    Trusted by thousands of buyers and sellers across the region.
                    <div className="mt-2 opacity-70">© {new Date().getFullYear()} PenePene Marketplace</div>
                </div>
            </div>

            {/* Form panel */}
            <div className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-10 xl:p-14 min-h-screen overflow-y-auto">
                <div className={`w-full ${maxWidth}`}>
                    <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12)] border border-gray-100/80 p-7 sm:p-9 lg:p-10">
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-6">
                                <Logo asLink={false} className="h-16 sm:h-20 w-auto max-w-[240px]" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
                            {subtitle && <p className="mt-2 text-gray-500 text-sm sm:text-base">{subtitle}</p>}
                        </div>

                        {children}
                    </div>

                    {footer && <div className="mt-6">{footer}</div>}
                </div>
            </div>
        </div>
    );
}
