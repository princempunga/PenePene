import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Filter, X, RotateCcw, DollarSign, MapPin, Tag, CheckCircle2, Award } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

const CITIES = ['Kinshasa', 'Lubumbashi', 'Goma', 'Dar es Salaam', 'Nairobi'];

export default function ProductFilters({ filters = {}, brandOptions = [], className = '' }) {
    const { t } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        min_price: filters.min_price || '',
        max_price: filters.max_price || '',
        city: filters.city || '',
        brand: filters.brand || '',
        condition: filters.condition || '',
        verified_seller: filters.verified_seller || false,
    });

    const conditions = [
        { value: 'New', label: t('filters.new') || 'Neuf' },
        { value: 'Used', label: t('filters.used') || 'Occasion' },
    ];

    const applyFilters = () => {
        router.get('/products', {
            ...filters,
            ...localFilters,
            verified_seller: localFilters.verified_seller ? 1 : undefined,
        }, { preserveState: true, preserveScroll: true });
        setMobileOpen(false);
    };

    const clearFilters = () => {
        const cleared = {
            min_price: '',
            max_price: '',
            city: '',
            brand: '',
            condition: '',
            verified_seller: false,
        };
        setLocalFilters(cleared);
        router.get('/products', {
            category: filters.category,
            subcategory: filters.subcategory,
            sort: filters.sort,
        }, { preserveState: true, preserveScroll: true });
        setMobileOpen(false);
    };

    const hasActiveFilters = Boolean(
        localFilters.min_price ||
        localFilters.max_price ||
        localFilters.city ||
        localFilters.brand ||
        localFilters.condition ||
        localFilters.verified_seller
    );

    return (
        <div className={`w-full bg-white rounded-2xl border border-gray-200/80 shadow-sm p-3 md:p-4 mb-6 transition-all ${className}`}>
            {/* Horizontal Filter Navigation Bar for Desktop & Mobile Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm sm:text-base border-r border-gray-200 pr-4 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                        <Filter size={18} />
                    </div>
                    <span>{t('filters.filters') || 'Filtres'}</span>
                </div>

                {/* Horizontal Bar Controls (Desktop) */}
                <div className="hidden lg:flex items-center gap-3 flex-1 flex-wrap">
                    {/* Price Inputs */}
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
                        <DollarSign size={14} className="text-gray-400 shrink-0" />
                        <input
                            type="number"
                            placeholder="Min"
                            value={localFilters.min_price}
                            onChange={(e) => setLocalFilters({ ...localFilters, min_price: e.target.value })}
                            className="w-16 text-xs bg-transparent border-0 p-0 focus:ring-0 text-gray-800 placeholder-gray-400"
                        />
                        <span className="text-gray-300 text-xs">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={localFilters.max_price}
                            onChange={(e) => setLocalFilters({ ...localFilters, max_price: e.target.value })}
                            className="w-16 text-xs bg-transparent border-0 p-0 focus:ring-0 text-gray-800 placeholder-gray-400"
                        />
                    </div>

                    {/* City Dropdown */}
                    <div className="relative">
                        <select
                            value={localFilters.city}
                            onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
                            className="bg-gray-50 border border-gray-200 rounded-xl text-xs py-2 pl-8 pr-7 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700 font-medium cursor-pointer"
                        >
                            <option value="">{t('filters.all_cities') || 'Toutes les villes'}</option>
                            {CITIES.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Brand Dropdown if available */}
                    {brandOptions.length > 0 && (
                        <div className="relative">
                            <select
                                value={localFilters.brand}
                                onChange={(e) => setLocalFilters({ ...localFilters, brand: e.target.value })}
                                className="bg-gray-50 border border-gray-200 rounded-xl text-xs py-2 pl-8 pr-7 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700 font-medium cursor-pointer"
                            >
                                <option value="">{t('filters.all_brands') || 'Toutes les marques'}</option>
                                {brandOptions.map((brand) => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                            <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    )}

                    {/* Condition Pills */}
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setLocalFilters({ ...localFilters, condition: '' })}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                                !localFilters.condition
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            Tous états
                        </button>
                        {conditions.map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setLocalFilters({ ...localFilters, condition: value })}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                                    localFilters.condition === value
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Verified Seller Checkbox Pill */}
                    <label className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        localFilters.verified_seller
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
                        <input
                            type="checkbox"
                            checked={localFilters.verified_seller}
                            onChange={(e) => setLocalFilters({ ...localFilters, verified_seller: e.target.checked })}
                            className="sr-only"
                        />
                        <Award size={14} className={localFilters.verified_seller ? 'text-green-600' : 'text-gray-400'} />
                        <span>{t('filters.verified_seller_only') || 'Vendeurs vérifiés'}</span>
                        {localFilters.verified_seller && <CheckCircle2 size={13} className="text-green-600 ml-0.5" />}
                    </label>
                </div>

                {/* Mobile / Tablet Filter Toggle Button */}
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="lg:hidden flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-800 transition-colors"
                >
                    <Filter size={15} />
                    <span>{t('filters.filters') || 'Filtres'}</span>
                    {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                </button>

                {/* Submit & Reset Buttons */}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <button
                        onClick={applyFilters}
                        className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm shadow-primary-600/20 active:scale-95 cursor-pointer"
                    >
                        {t('filters.apply_filters') || 'Appliquer'}
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-xs font-semibold p-2 rounded-xl transition-colors cursor-pointer"
                            title={t('filters.clear_all') || 'Effacer les filtres'}
                        >
                            <RotateCcw size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Filter Modal Sheet */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
                    <div className="absolute inset-y-0 right-0 w-[85%] max-w-xs bg-white shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                <Filter size={18} className="text-primary-600" />
                                {t('filters.filters') || 'Filtres'}
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            <div>
                                <h3 className="font-semibold text-gray-900 text-xs mb-2">Fourchette de prix</h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={localFilters.min_price}
                                        onChange={(e) => setLocalFilters({ ...localFilters, min_price: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={localFilters.max_price}
                                        onChange={(e) => setLocalFilters({ ...localFilters, max_price: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 text-xs mb-2">Ville</h3>
                                <select
                                    value={localFilters.city}
                                    onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Toutes les villes</option>
                                    {CITIES.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            {brandOptions.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-xs mb-2">Marque</h3>
                                    <select
                                        value={localFilters.brand}
                                        onChange={(e) => setLocalFilters({ ...localFilters, brand: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">Toutes les marques</option>
                                        {brandOptions.map((brand) => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold text-gray-900 text-xs mb-2">État</h3>
                                <div className="space-y-2">
                                    {conditions.map(({ value, label }) => (
                                        <label key={value} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="condition"
                                                checked={localFilters.condition === value}
                                                onChange={() => setLocalFilters({ ...localFilters, condition: value })}
                                                className="text-primary-600 focus:ring-primary-500"
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 text-xs mb-2">Type de vendeur</h3>
                                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localFilters.verified_seller}
                                        onChange={(e) => setLocalFilters({ ...localFilters, verified_seller: e.target.checked })}
                                        className="rounded text-primary-600 focus:ring-primary-500"
                                    />
                                    Vendeurs vérifiés uniquement
                                </label>
                            </div>
                        </div>

                        <div className="p-4 border-t flex gap-2">
                            <button
                                onClick={applyFilters}
                                className="flex-1 bg-primary-600 text-white text-xs font-bold py-2.5 rounded-xl"
                            >
                                Appliquer les filtres
                            </button>
                            <button
                                onClick={clearFilters}
                                className="bg-gray-100 text-gray-600 text-xs font-semibold px-4 py-2.5 rounded-xl"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

