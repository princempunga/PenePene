import React, { useState, useRef, useEffect } from 'react';
import { DollarSign, ChevronDown, Check } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export default function CurrencySwitcher({ variant = 'navbar' }) {
    const { currency, setCurrency } = useCurrency();
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

    const currencies = [
        { code: 'CDF', label: 'Franc Congolais', symbol: 'CDF / FC' },
        { code: 'USD', label: 'Dollar Américain', symbol: 'USD / $' },
    ];

    if (variant === 'compact') {
        return (
            <div ref={ref} className="flex items-center gap-1">
                {currencies.map(({ code }) => (
                    <button
                        key={code}
                        type="button"
                        onClick={() => setCurrency(code)}
                        className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                            currency === code
                                ? 'bg-emerald-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        {code}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-200/80 shadow-2xs"
                title="Convertisseur de devise (CDF / USD)"
            >
                <DollarSign size={15} className="text-emerald-600" />
                <span>{currency}</span>
                <ChevronDown size={14} className={`text-emerald-600 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[250]">
                    <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Devise d'affichage
                    </div>
                    {currencies.map(({ code, label, symbol }) => (
                        <button
                            key={code}
                            type="button"
                            onClick={() => {
                                setCurrency(code);
                                setOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs transition-colors ${
                                currency === code
                                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex flex-col items-start text-left">
                                <span className="font-bold">{code}</span>
                                <span className="text-[10px] text-gray-400">{label}</span>
                            </div>
                            {currency === code && <Check size={14} className="text-emerald-600" />}
                        </button>
                    ))}
                    <div className="px-3 py-1.5 mt-1 border-t border-gray-100 text-[10px] text-gray-400 text-center">
                        Taux indicatif: 1 $ = 2800 CDF
                    </div>
                </div>
            )}
        </div>
    );
}
