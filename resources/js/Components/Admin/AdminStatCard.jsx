import React from 'react';
import { TrendingUp } from 'lucide-react';

const tones = {
    navy: {
        icon: 'bg-[#002E5D]/10 text-[#002E5D] ring-[#002E5D]/10',
        accent: 'from-[#002E5D] to-[#0056B3]',
    },
    gold: {
        icon: 'bg-[#FFB300]/15 text-[#B8860B] ring-[#FFB300]/20',
        accent: 'from-[#FFB300] to-[#F9A825]',
    },
    blue: {
        icon: 'bg-[#0056B3]/10 text-[#0056B3] ring-[#0056B3]/15',
        accent: 'from-[#0056B3] to-[#0066CC]',
    },
    emerald: {
        icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        accent: 'from-emerald-500 to-emerald-600',
    },
};

export default function AdminStatCard({ icon: Icon, label, value, trend, tone = 'navy' }) {
    const style = tones[tone] ?? tones.navy;

    return (
        <div className="admin-stat-card group relative overflow-hidden rounded-2xl border border-white/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#002E5D]/8">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.accent} opacity-80`} />
            <div className="flex items-start justify-between gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${style.icon}`}>
                    <Icon size={22} strokeWidth={2} />
                </div>
                {trend && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <TrendingUp size={11} />
                        {trend}
                    </span>
                )}
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-[#002E5D]">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
        </div>
    );
}
