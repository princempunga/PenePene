import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminAlert({ type = 'success', children }) {
    const isSuccess = type === 'success';
    const Icon = isSuccess ? CheckCircle2 : AlertCircle;

    return (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            isSuccess
                ? 'border-emerald-200/80 bg-emerald-50 text-emerald-800'
                : 'border-red-200/80 bg-red-50 text-red-800'
        }`}>
            <Icon size={18} className="mt-0.5 shrink-0" />
            <div>{children}</div>
        </div>
    );
}
