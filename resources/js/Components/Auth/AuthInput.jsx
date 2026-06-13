import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthInput({
    id,
    label,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    icon: Icon,
    required = false,
    autoComplete,
    hint,
    accent = 'blue',
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const ringClass = accent === 'amber'
        ? 'focus:ring-amber-500 focus:border-amber-500'
        : 'focus:ring-blue-600 focus:border-blue-600';

    return (
        <div>
            {label && (
                <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {label}
                    {hint && <span className="text-gray-400 font-normal"> {hint}</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    id={id}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    autoComplete={autoComplete}
                    className={`w-full border border-gray-200 rounded-xl py-3 ${Icon ? 'pl-11' : 'px-4'} ${isPassword ? 'pr-11' : 'pr-4'} bg-gray-50/80 focus:bg-white outline-none transition-all shadow-sm ${ringClass} focus:ring-2`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        </div>
    );
}
