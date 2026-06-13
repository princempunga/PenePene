import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, Info, X } from 'lucide-react';

export default function Toast() {
    const { flash } = usePage().props;
    const [message, setMessage] = useState(null);
    const [type, setType] = useState('success');

    const show = (text, toastType = 'success') => {
        if (!text) return;
        setMessage(text);
        setType(toastType);
    };

    useEffect(() => {
        if (flash?.success) show(flash.success, 'success');
        else if (flash?.info) show(flash.info, 'info');
        else if (flash?.error) show(flash.error, 'error');
    }, [flash?.success, flash?.info, flash?.error]);

    useEffect(() => {
        const handler = (e) => show(e.detail?.message, e.detail?.type || 'success');
        window.addEventListener('app-toast', handler);
        return () => window.removeEventListener('app-toast', handler);
    }, []);

    useEffect(() => {
        if (!message) return undefined;
        const timer = window.setTimeout(() => setMessage(null), 3500);
        return () => window.clearTimeout(timer);
    }, [message]);

    if (!message) return null;

    const styles = {
        success: 'border-green-200 text-green-700',
        info: 'border-blue-200 text-blue-700',
        error: 'border-red-200 text-red-700',
    };

    const Icon = type === 'info' ? Info : CheckCircle2;

    return (
        <div className="fixed top-24 right-4 z-[100] max-w-sm animate-in fade-in slide-in-from-top-2">
            <div className={`flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg ${styles[type] || styles.success}`}>
                <Icon size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-gray-900">{message}</p>
                <button
                    type="button"
                    onClick={() => setMessage(null)}
                    className="ml-auto text-gray-400 hover:text-gray-600"
                    aria-label="Dismiss notification"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

export function dispatchToast(message, type = 'success') {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }));
}
