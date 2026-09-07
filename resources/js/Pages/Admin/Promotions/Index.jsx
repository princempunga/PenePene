import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Megaphone, Save, Trash2, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, Eye, ShoppingBag, Loader2 } from 'lucide-react';
import { dispatchToast } from '@/Components/UI/Toast';

const HERO_SLOTS = [1, 2, 3, 4];
const EXTRA_SLOTS = [5, 6, 7, 8, 9, 10];
const HERO_AUTOPLAY_MS = 7000;

function emptySlot(slot) {
    return {
        promotion_order: slot,
        seller_id: '',
        product_id: null,
        product_ids: [],
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

function SlotPreviewCard({ slot, products, productIds = [], headline, sellerName }) {
    const selectedProducts = productIds
        .map((id) => products.find((p) => String(p.id) === String(id)))
        .filter(Boolean);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (selectedProducts.length <= 1) return undefined;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % selectedProducts.length);
        }, HERO_AUTOPLAY_MS);
        return () => clearInterval(timer);
    }, [selectedProducts.length]);

    const currentProduct = selectedProducts[currentIndex];
    const img = currentProduct?.image_url || null;

    return (
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-gray-200 bg-white shadow-sm">
            {img ? (
                <img src={img} alt={`Cadre ${slot}`} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm font-semibold">
                    Cadre {slot}
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 text-white text-xs">
                <div className="space-y-1 min-w-0">
                    <div className="font-semibold">Cadre {slot}</div>
                    {headline && <div className="truncate">{headline}</div>}
                    <div className="text-[10px] text-white/80 truncate">{sellerName || 'Vendeur'}</div>
                </div>
                {selectedProducts.length > 1 && (
                    <div className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium shrink-0">
                        {currentIndex + 1}/{selectedProducts.length}
                    </div>
                )}
            </div>
        </div>
    );
}

function HeroPreview({ slides }) {
    const activeSlides = slides.filter((s) => s.is_active && (s.product_ids?.length > 0 || s.product_id));

    if (activeSlides.length === 0) {
        return (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500 text-sm">
                <Eye size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium mb-1">Aucune promotion active</p>
                <p className="text-xs text-gray-400">Configurez les emplacements hero ci-dessous pour voir le aperçu.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Eye size={16} />
                    Aperçu hero — 4 cadres actifs
                </div>
                <span className="text-xs text-gray-500">Défilement: {HERO_AUTOPLAY_MS / 1000}s</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-100">
                {HERO_SLOTS.map((slot) => {
                    const slide = slides.find((s) => s.promotion_order === slot);
                    if (!slide?.is_active || (!slide.product_ids?.length && !slide.product_id)) return null;
                    return (
                        <SlotPreviewCard
                            key={slot}
                            slot={slot}
                            products={slide?._products || []}
                            productIds={slide?.product_ids || (slide?.product_id ? [slide.product_id] : [])}
                            headline={slide?.headline}
                            sellerName={slide?.seller_name}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function ProductPicker({ products, loading, selectedIds = [], onToggle, maxSelection = 5 }) {
    const selectedSet = useMemo(() => new Set(selectedIds.map((id) => String(id))), [selectedIds]);
    const activeCount = selectedIds.length;

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
                Sélectionnez d'abord un vendeur
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Jusqu'à {maxSelection} produits</span>
                <span className={`font-semibold ${activeCount >= maxSelection ? 'text-red-600' : 'text-gray-900'}`}>
                    {activeCount} / {maxSelection}
                </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {products.map((p) => {
                    const isSelected = selectedSet.has(String(p.id));
                    return (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => onToggle(p.id)}
                            className={`relative flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all duration-200 hover:shadow-md ${
                                isSelected
                                    ? 'border-primary-500 ring-2 ring-primary-200 shadow-md'
                                    : 'border-gray-200 hover:border-primary-300'
                            } ${!isSelected && activeCount >= maxSelection ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={!isSelected && activeCount >= maxSelection}
                        >
                            <div className="w-full h-20 bg-gray-100">
                                {p.image_url ? (
                                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ShoppingBag size={20} />
                                    </div>
                                )}
                            </div>
                            <div className="p-2">
                                <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{p.name}</p>
                                <p className="text-[11px] text-primary-600 font-bold mt-0.5">{parseFloat(p.price).toLocaleString()} {p.currency || 'CDF'}</p>
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
        </div>
    );
}

function SellerSelect({ sellers, value, onChange }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = React.useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = sellers.filter((s) =>
        `${s.business_name} ${s.user_name || ''}`.toLowerCase().includes(search.toLowerCase())
    );
    const selected = sellers.find((s) => String(s.id) === String(value));

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm hover:border-primary-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
                <span className={selected ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                    {selected ? `${selected.business_name} (${selected.user_name})` : '— Sélectionner —'}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="p-2 border-b border-gray-100">
                        <input
                            autoFocus
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un vendeur..."
                            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => { onChange(''); setOpen(false); }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
                        >
                            — Aucun —
                        </button>
                        {filtered.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => { onChange(String(s.id)); setOpen(false); setSearch(''); }}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-primary-50 ${
                                    String(s.id) === String(value) ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-800'
                                }`}
                            >
                                <div className="font-medium">{s.business_name}</div>
                                <div className="text-xs text-gray-500">
                                    {s.user_name}
                                    {s.status && s.status !== 'verified' && (
                                        <span className="ml-2 text-red-500">({s.status})</span>
                                    )}
                                </div>
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <div className="px-3 py-3 text-sm text-gray-400">Aucun vendeur trouvé</div>
                        )}
                    </div>
                    <div className="border-t border-gray-100 px-3 py-1.5 text-xs text-gray-500">
                        {filtered.length} vendeur(s) sur {sellers.length}
                    </div>
                </div>
            )}
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
    const selectedProduct = products.find((p) => String(p.id) === String(promo.product_ids?.[0] || promo.product_id));
    const previewImage = promo.custom_image_url || selectedProduct?.image_url || promo.hero_image_url || null;
    const [customImageFile, setCustomImageFile] = React.useState(null);
    const [customImagePreview, setCustomImagePreview] = React.useState(promo.custom_image_url || null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleImageChange = useCallback((e) => {
        const file = e.target.files?.[0] || null;
        setCustomImageFile(file);
        if (file) {
            setCustomImagePreview(URL.createObjectURL(file));
        } else {
            setCustomImagePreview(promo.custom_image_url || null);
        }
    }, [promo.custom_image_url]);

    useEffect(() => {
        return () => {
            if (customImagePreview && customImagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(customImagePreview);
            }
        };
    }, [customImagePreview]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        setError(null);
        try {
            await onSave(promo, customImageFile);
            dispatchToast(isExisting ? 'Promotion mise à jour.' : 'Promotion enregistrée.', 'success');
        } catch (e) {
            setError(e?.response?.data?.message || 'Échec de l’enregistrement.');
            dispatchToast(error || 'Échec de l’enregistrement.', 'error');
        } finally {
            setSaving(false);
        }
    }, [promo, customImageFile, isExisting, onSave]);

    const handleDelete = useCallback(() => {
        if (!promo.id) return;
        if (!confirm('Supprimer cette promotion ?')) return;
        onDelete(promo);
        dispatchToast('Promotion supprimée.', 'success');
    }, [promo, onDelete]);

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
                {(customImagePreview || previewImage) && (
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={customImagePreview || previewImage} alt="Aperçu" className="w-full h-full object-cover" />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendeur</label>
                    <SellerSelect
                        sellers={sellers}
                        value={promo.seller_id}
                        onChange={(val) => onUpdate(promo.promotion_order, 'seller_id', val)}
                    />
                </div>

                {promo.seller_id && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choisir jusqu'à 5 produits
                        </label>
                        <ProductPicker
                            products={products}
                            loading={false}
                            selectedIds={promo.product_ids}
                            onToggle={(id) => {
                                const isSelected = promo.product_ids.includes(id);
                                const nextIds = isSelected
                                    ? promo.product_ids.filter((item) => item !== id)
                                    : [...promo.product_ids, id].slice(0, 5);
                                onUpdate(promo.promotion_order, 'product_ids', nextIds);
                            }}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image personnalisée (optionnel)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {customImagePreview && (
                        <button
                            type="button"
                            onClick={() => { setCustomImageFile(null); setCustomImagePreview(null); onUpdate(promo.promotion_order, 'custom_image_url', ''); }}
                            className="mt-2 text-xs text-red-600 hover:text-red-700"
                        >
                            Supprimer l'image
                        </button>
                    )}
                </div>

                {promo.product_ids && promo.product_ids.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Produits sélectionnés</div>
                        <div className="grid grid-cols-5 gap-2">
                            {products
                                .filter((p) => promo.product_ids.includes(p.id))
                                .map((p) => (
                                    <div key={p.id} className="h-16 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accroche promo (optionnel)</label>
                    <input
                        type="text"
                        placeholder="ex. Super promo -50% !"
                        maxLength={100}
                        value={promo.headline || ''}
                        onChange={(e) => onUpdate(promo.promotion_order, 'headline', e.target.value)}
                        className="w-full rounded-lg border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Début (optionnel)</label>
                        <input
                            type="datetime-local"
                            value={promo.starts_at ? formatDateForInput(promo.starts_at) : ''}
                            onChange={(e) => onUpdate(promo.promotion_order, 'starts_at', e.target.value)}
                            className="w-full rounded-lg border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fin (optionnel)</label>
                        <input
                            type="datetime-local"
                            value={promo.ends_at ? formatDateForInput(promo.ends_at) : ''}
                            onChange={(e) => onUpdate(promo.promotion_order, 'ends_at', e.target.value)}
                            className="w-full rounded-lg border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                {isExisting && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={16} />
                        Vider
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !promo.seller_id || !promo.product_ids?.length}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Enregistrement...' : isExisting ? 'Mettre à jour' : 'Enregistrer'}
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
                seller_id: existing.seller_id || '',
                product_id: existing.product_id || null,
                product_ids: existing.product_ids?.length ? existing.product_ids : (existing.product_id ? [existing.product_id] : []),
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

    const handleUpdate = useCallback((slotIndex, field, value) => {
        setLocalPromotions((prev) => {
            const updated = [...prev];
            const index = updated.findIndex((p) => p.promotion_order === slotIndex);
            if (index === -1) return prev;

            updated[index] = { ...updated[index], [field]: value };

            if (field === 'seller_id') {
                updated[index].product_id = null;
                updated[index].product_ids = [];
            }

            return updated;
        });
    }, []);

    const buildFormData = useCallback((promo, customImageFile) => {
        const formData = new FormData();
        formData.append('seller_id', promo.seller_id);
        formData.append('product_id', promo.product_ids?.[0] || promo.product_id || '');
        formData.append('promotion_order', promo.promotion_order);
        formData.append('is_active', promo.is_active ? '1' : '0');

        if (promo.headline) formData.append('headline', promo.headline);
        if (promo.starts_at) formData.append('starts_at', promo.starts_at);
        if (promo.ends_at) formData.append('ends_at', promo.ends_at);
        if (promo.product_ids?.length) {
            promo.product_ids.forEach((id) => formData.append('product_ids[]', id));
        }
        if (customImageFile) {
            formData.append('custom_image', customImageFile);
        }

        return formData;
    }, []);

    const handleSave = useCallback((promo, customImageFile) => {
        const formData = buildFormData(promo, customImageFile);

        if (promo.id) {
            formData.append('_method', 'PUT');
            router.post(`/admin/promotions/${promo.id}`, formData, { forceFormData: true });
        } else {
            router.post('/admin/promotions', formData, { forceFormData: true });
        }
    }, [buildFormData]);

    const handleDelete = useCallback((promo) => {
        if (!promo.id) return;
        router.delete(`/admin/promotions/${promo.id}`);
    }, []);

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
                            Sélectionnez un vendeur, puis choisissez jusqu'à 5 produits depuis sa boutique.
                            Chaque cadre affiche ces produits et défile automatiquement toutes les 7 secondes.
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
