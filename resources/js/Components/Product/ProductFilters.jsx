import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Filter, X } from 'lucide-react';
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
        { value: 'New', label: t('filters.new') },
        { value: 'Used', label: t('filters.used') },
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

    const panel = (
        <div className="space-y-6">
            <div>
                <h3 className="font-medium text-gray-900 mb-3">{t('filters.price_range')}</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder={t('filters.min')}
                        value={localFilters.min_price}
                        onChange={(e) => setLocalFilters({ ...localFilters, min_price: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="number"
                        placeholder={t('filters.max')}
                        value={localFilters.max_price}
                        onChange={(e) => setLocalFilters({ ...localFilters, max_price: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
            </div>

            <div>
                <h3 className="font-medium text-gray-900 mb-3">{t('filters.city_location')}</h3>
                <select
                    value={localFilters.city}
                    onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                    <option value="">{t('filters.all_cities')}</option>
                    {CITIES.map((city) => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            {brandOptions.length > 0 && (
                <div>
                    <h3 className="font-medium text-gray-900 mb-3">{t('filters.brand')}</h3>
                    <select
                        value={localFilters.brand}
                        onChange={(e) => setLocalFilters({ ...localFilters, brand: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">{t('filters.all_brands')}</option>
                        {brandOptions.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <h3 className="font-medium text-gray-900 mb-3">{t('filters.condition')}</h3>
                <div className="space-y-2">
                    {conditions.map(({ value, label }) => (
                        <label key={value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
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
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                            type="radio"
                            name="condition"
                            checked={!localFilters.condition}
                            onChange={() => setLocalFilters({ ...localFilters, condition: '' })}
                            className="text-primary-600 focus:ring-primary-500"
                        />
                        {t('filters.any_condition')}
                    </label>
                </div>
            </div>

            <div>
                <h3 className="font-medium text-gray-900 mb-3">{t('filters.seller_type')}</h3>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={localFilters.verified_seller}
                        onChange={(e) => setLocalFilters({ ...localFilters, verified_seller: e.target.checked })}
                        className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    {t('filters.verified_seller_only')}
                </label>
            </div>

            <div className="flex flex-col gap-2 pt-2">
                <button
                    onClick={applyFilters}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                    {t('filters.apply_filters')}
                </button>
                <button
                    onClick={clearFilters}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
                >
                    {t('filters.clear_all')}
                </button>
            </div>
        </div>
    );

    return (
        <>
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className={`md:hidden flex items-center justify-center gap-2 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm ${className}`}
            >
                <Filter size={18} />
                {t('filters.filters')}
            </button>

            <aside className="hidden md:block w-64 shrink-0">
                <div className="bg-white p-5 rounded-xl border border-gray-200 sticky top-24 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 text-gray-900 font-semibold text-lg border-b pb-4">
                        <Filter size={20} />
                        <span>{t('filters.filters')}</span>
                    </div>
                    {panel}
                </div>
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm bg-white shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <div className="flex items-center gap-2 font-semibold text-gray-900">
                                <Filter size={20} />
                                {t('filters.filters')}
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">{panel}</div>
                    </div>
                </div>
            )}
        </>
    );
}
