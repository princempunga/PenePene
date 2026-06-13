import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Globe, ChevronDown } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function LanguageSwitcher({ variant = 'navbar' }) {
    const { locale, availableLocales } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const locales = Object.values(availableLocales);

    const switchLocale = (code) => {
        setOpen(false);
        router.post(`/locale/${code}`, {}, { preserveScroll: true });
    };

    if (variant === 'compact') {
        return (
            <div ref={ref} className="flex items-center gap-1">
                {locales.map(({ code, short }) => (
                    <button
                        key={code}
                        type="button"
                        onClick={() => switchLocale(code)}
                        className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                            locale === code
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        aria-label={availableLocales[code]?.label}
                    >
                        {short}
                    </button>
                ))}
            </div>
        );
    }

    const current = availableLocales[locale];

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                aria-label="Changer de langue"
            >
                <Globe size={16} />
                <span className="hidden sm:inline">{current?.short || locale?.toUpperCase()}</span>
                <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[250]">
                    {locales.map(({ code, label, short }) => (
                        <button
                            key={code}
                            type="button"
                            onClick={() => switchLocale(code)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                                locale === code
                                    ? 'bg-primary-50 text-primary-700 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span>{label}</span>
                            <span className="text-xs text-gray-400">{short}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
