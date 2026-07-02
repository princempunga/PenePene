import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Megaphone, Save, Trash2, AlertCircle, ChevronLeft, ChevronRight, Eye, ShoppingBag, Loader2 } from 'lucide-react';
import axios from 'axios';

const HERO_SLOTS = [1, 2, 3, 4];
const EXTRA_SLOTS = [5, 6, 7, 8, 9, 10];

function emptySlot(slot) {
    return {
        promotion_order: slot,
        seller_id: '',
        product_id: '',
        custom_image_url: '',
        custom_image_file: null,
        custom_image_preview: null,
        headline: '',
        is_active: true,
        starts_at: '',
        ends_at: '',
    };
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function getPreviewImage(promo, products) {
    if (promo.custom_image_preview) return promo.custom_image_preview;
    if (promo.custom_image_url) return promo.custom_image_url;
    if (promo.hero_image_url) return promo.hero_image_url;
    const product = products.find((p) => String(p.id) === String(promo.product_id));
    return product?.image_url || null;
}

function HeroPreview({ slides }) {
    const [index, setIndex] = useState(0);
    const activeSlides = slides.filter((s) => s.is_active && s.product_id && getPreviewImage(s, s._products || []));

    useEffect(() => {
        if (activeSlides.length <= 1) return undefined;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % activeSlides.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [activeSlides.length]);

    if (activeSlides.length === 0) {
        return (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500 text-sm">
                Configurez les 4 emplacements ci-dessous pour prévisualiser le carrousel hero.
            </div>
        );
    }

    const current = activeSlides[index] || activeSlides[0];
    const image = getPreviewImage(current, current._products || []);

    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Eye size={16} />
                    Aperçu carrousel hero ({activeSlides.length}/4 slides actifs)
                </div>
                {activeSlides.length > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs text-gray-500 min-w-[3rem] text-center">
                            {index + 1} / {activeSlides.length}
                        </span>
                        <button
                            type="button"
                            onClick={() => setIndex((prev) => (prev + 1) % activeSlides.length)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-4 gap-2 p-3 bg-gray-100">
                {HERO_SLOTS.map((slot) => {
                    const slide = slides.find((s) => s.promotion_order === slot);
                    const img = slide ? getPreviewImage(slide, slide._products || []) : null;
                    const isCurrent = slide && activeSlides[index]?.promotion_order === slot;

                    return (
                        <div
                            key={slot}
                            className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                                isCurrent ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'
                            }`}
                        >
                            {img ? (
                                <img src={img} alt={`Slide ${slot}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs font-bold">
                                    {slot}
                                </div>
                            )}
                            <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {slot}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="p-4 flex gap-4 items-center border-t border-gray-100">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {image ? (
                        <img src={image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                        {current.product_name || current.headline || `Emplacement ${current.promotion_order}`}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{current.seller_name || 'Vendeur non défini'}</p>
                    {current.headline && (
                        <p className="text-xs text-primary-600 mt-1 truncate">{current.headline}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProductPicker({ products, loading, selectedId, onSelect }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 py-6 text-primary-500">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm font-medium">Chargement des produits...</span>
            </div>
        );
    }
    if (products.length === 0) {
        return (
            <div className="py-6 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                <ShoppingBag size={24} className="mx-auto mb-2 opacity-40" />
                Aucun produit actif pour ce vendeur
            </div>
        );
    }
    return (
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {products.map((p) => {
                const isSelected = String(p.id) === String(selectedId);
                return (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => onSelect(p.id)}
                        className={`relative flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all duration-200 hover:shadow-md ${
                            isSelected
                                ? 'border-primary-500 ring-2 ring-primary-200 shadow-md'
                                : 'border-gray-200 hover:border-primary-300'
                        }`}
                    >
                        <div className="w-full h-24 bg-gray-100">
                            {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <ShoppingBag size={28} />
                                </div>
                            )}
                        </div>
                        <div className="p-2">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{p.name}</p>
                            <p className="text-xs text-primary-600 font-bold mt-0.5">{parseFloat(p.price).toLocaleString()} {p.currency}</p>
                        </div>
                        {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function PromotionSlotCard({
    promo,
    sellers,
    sellerProducts,
    isHeroSlot,
    onUpdate,
    onSave,
    onDelete,
}) {
    const isExisting = !!promo.id;
    const products = sellerProducts[promo.seller_id] || [];
    const selectedProduct = products.find((p) => String(p.id) === String(promo.product_id));
    const previewImage = selectedProduct?.image_url || promo.hero_image_url || null;

    return (
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col ${
            isHeroSlot ? 'border-primary-200 ring-1 ring-primary-100' : 'border-gray-200'
        }`}>
            <div className={`p-4 border-b flex justify-between items-center ${
                isHeroSlot ? 'bg-primary-50 border-primary-100' : 'bg-gray-50 border-gray-100'
            }`}>
                <div className="flex items-center gap-2 font-bold text-gray-900">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isHeroSlot ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'
                    }`}>
                        {promo.promotion_order}
                    </div>
                    {isHeroSlot ? `Hero — Photo ${promo.promotion_order}` : `Emplacement ${promo.promotion_order}`}
                </div>
                <label className="flex items-center cursor-pointer gap-2 text-sm font-medium">
                    <span className={promo.is_active ? 'text-green-600' : 'text-gray-500'}>
                        {promo.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <input
                        type="checkbox"
                        checked={promo.is_active}
                        onChange={(e) => onUpdate(promo.promotion_order, 'is_active', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                </label>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4">
                {previewImage && (
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={previewImage} alt="Aperçu du produit" className="w-full h-full object-cover" />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendeur</label>
                    <select
                        value={promo.seller_id}
                        onChange={(e) => onUpdate(promo.promotion_order, 'seller_id', e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                    >
                        <option value="">— Sélectionner —</option>
                        {sellers.map((s) => (
                            <option key={s.id} value={s.id}>{s.business_name} ({s.user_name})</option>
                        ))}
                    </select>
                </div>

                {promo.seller_id && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choisir un produit
                        </label>
                        <ProductPicker
                            products={products}
                            loading={false}
                            selectedId={promo.product_id}
                            onSelect={(id) => onUpdate(promo.promotion_order, 'product_id', id)}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accroche promo (opt.)</label>
                    <input
                        type="text"
                        placeholder="ex. Super promo -50% !"
                        maxLength="100"
                        value={promo.headline || ''}
                        onChange={(e) => onUpdate(promo.promotion_order, 'headline', e.target.value)}
                        className="w-full rounded-lg border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Début (opt.)</label>
                        <input
                            type="datetime-local"
                            value={promo.starts_at ? formatDateForInput(promo.starts_at) : ''}
                            onChange={(e) => onUpdate(promo.promotion_order, 'starts_at', e.target.value)}
                            className="w-full rounded-lg border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fin (opt.)</label>
                        <input
                            type="datetime-local"
                            value={promo.ends_at ? formatDateForInput(promo.ends_at) : ''}
                            onChange={(e) => onUpdate(promo.promotion_order, 'ends_at', e.target.value)}
                            className="w-full rounded-lg border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                {isExisting && (
                    <button
                        type="button"
                        onClick={() => onDelete(promo)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={16} />
                        Vider
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onSave(promo)}
                    disabled={!promo.seller_id || !promo.product_id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={16} />
                    {isExisting ? 'Mettre à jour' : 'Enregistrer'}
                </button>
            </div>
        </div>
    );
}

function buildInitialPromotions(promotions = []) {
    const allSlots = [...HERO_SLOTS, ...EXTRA_SLOTS];
    return allSlots.map((slot) => {
        const existing = promotions.find((p) => p.promotion_order === slot);
        return existing
            ? {
                ...existing,
                custom_image_file: null,
                custom_image_preview: null,
                seller_id: existing.seller_id || '',
                product_id: existing.product_id || '',
            }
            : emptySlot(slot);
    });
}

export default function HomepagePromotionsAdmin({ promotions = [], sellers = [], allProductsBySeller = {} }) {
    const initialPromotions = useMemo(() => buildInitialPromotions(promotions), [promotions]);
    const [localPromotions, setLocalPromotions] = useState(initialPromotions);

    const heroPromotions = useMemo(
        () =>
            localPromotions
                .filter((p) => HERO_SLOTS.includes(p.promotion_order))
                .map((p) => ({ ...p, _products: allProductsBySeller[p.seller_id] || [] })),
        [localPromotions, allProductsBySeller],
    );

    const handleUpdate = (slotIndex, field, value) => {
        setLocalPromotions((prev) => {
            const updated = [...prev];
            const index = updated.findIndex((p) => p.promotion_order === slotIndex);
            if (index === -1) return prev;

            updated[index] = { ...updated[index], [field]: value };

            if (field === 'seller_id') {
                updated[index].product_id = '';
            }

            return updated;
        });
    };

    const handleImageSelect = (slotIndex, file) => {
        if (!file) return;

        const preview = URL.createObjectURL(file);
        setLocalPromotions((prev) => {
            const updated = [...prev];
            const index = updated.findIndex((p) => p.promotion_order === slotIndex);
            if (index === -1) return prev;

            if (updated[index].custom_image_preview) {
                URL.revokeObjectURL(updated[index].custom_image_preview);
            }

            updated[index] = {
                ...updated[index],
                custom_image_file: file,
                custom_image_preview: preview,
                custom_image_url: '',
            };

            return updated;
        });
    };

    const handleClearImage = (slotIndex) => {
        setLocalPromotions((prev) => {
            const updated = [...prev];
            const index = updated.findIndex((p) => p.promotion_order === slotIndex);
            if (index === -1) return prev;

            if (updated[index].custom_image_preview) {
                URL.revokeObjectURL(updated[index].custom_image_preview);
            }

            updated[index] = {
                ...updated[index],
                custom_image_file: null,
                custom_image_preview: null,
                custom_image_url: '',
            };

            return updated;
        });
    };

    const buildFormData = (promo) => {
        const formData = new FormData();
        formData.append('seller_id', promo.seller_id);
        formData.append('product_id', promo.product_id);
        formData.append('promotion_order', promo.promotion_order);
        formData.append('is_active', promo.is_active ? '1' : '0');

        if (promo.headline) formData.append('headline', promo.headline);
        if (promo.starts_at) formData.append('starts_at', promo.starts_at);
        if (promo.ends_at) formData.append('ends_at', promo.ends_at);
        if (promo.custom_image_url && !promo.custom_image_file) {
            formData.append('custom_image_url', promo.custom_image_url);
        }
        if (promo.custom_image_file) {
            formData.append('custom_image', promo.custom_image_file);
        }

        return formData;
    };

    const handleSave = (promo) => {
        const formData = buildFormData(promo);

        if (promo.id) {
            formData.append('_method', 'PUT');
            router.post(`/admin/promotions/${promo.id}`, formData, { forceFormData: true });
        } else {
            router.post('/admin/promotions', formData, { forceFormData: true });
        }
    };

    const handleDelete = (promo) => {
        if (promo.id && confirm('Supprimer cette promotion ?')) {
            router.delete(`/admin/promotions/${promo.id}`);
        }
    };

    return (
        <>
            <Head title="Promotions Hero" />
            <AdminLayout title="Promotions Hero">
                <div className="mb-6 bg-primary-50 border border-primary-200 p-4 rounded-xl flex gap-3 text-primary-900">
                    <AlertCircle className="shrink-0 text-primary-600" />
                    <div>
                        <h3 className="font-semibold">Carrousel Hero — 4 emplacements</h3>
                        <p className="text-sm mt-1 text-primary-800">
                            Les emplacements <strong>1 à 4</strong> alimentent le défilement hero de la page d'accueil.
                            Sélectionnez un vendeur puis choisissez un de ses produits — l'image du produit sera utilisée automatiquement.
                            Rotation automatique toutes les 4 secondes.
                        </p>
                    </div>
                </div>

                <div className="mb-8">
                    <HeroPreview slides={heroPromotions} />
                </div>

                <div className="mb-4 flex items-center gap-2">
                    <Megaphone size={20} className="text-primary-600" />
                    <h2 className="text-lg font-bold text-gray-900">Hero — 4 emplacements</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                    {localPromotions
                        .filter((p) => HERO_SLOTS.includes(p.promotion_order))
                        .map((promo) => (
                            <PromotionSlotCard
                                key={promo.promotion_order}
                                promo={promo}
                                sellers={sellers}
                                sellerProducts={allProductsBySeller}
                                isHeroSlot
                                onUpdate={handleUpdate}
                                onSave={handleSave}
                                onDelete={handleDelete}
                            />
                        ))}
                </div>

                <div className="mb-4 flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-500">Emplacements supplémentaires (5–10)</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {localPromotions
                        .filter((p) => EXTRA_SLOTS.includes(p.promotion_order))
                        .map((promo) => (
                            <PromotionSlotCard
                                key={promo.promotion_order}
                                promo={promo}
                                sellers={sellers}
                                sellerProducts={allProductsBySeller}
                                isHeroSlot={false}
                                onUpdate={handleUpdate}
                                onSave={handleSave}
                                onDelete={handleDelete}
                            />
                        ))}
                </div>
            </AdminLayout>
        </>
    );
}
