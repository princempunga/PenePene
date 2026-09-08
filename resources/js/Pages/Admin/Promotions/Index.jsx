import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import HeroSection from '@/Components/Home/HeroSection';
import {
    Megaphone, Save, Trash2, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, Eye,
    ShoppingBag, Loader2, UploadCloud, ImagePlus, Calendar, Type, Store,
    Monitor, Smartphone, Info, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import { dispatchToast } from '@/Components/UI/Toast';

const HERO_SLOTS = [1, 2, 3, 4];
const EXTRA_SLOTS = [5, 6, 7, 8, 9, 10];
const HERO_AUTOPLAY_MS = 7000;
const HEADLINE_MAX = 100; // limite backend (validation Laravel)

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

/* Statut d'un slot — miroir de la logique active() du modèle HomepagePromotion */
function slotStatus(p) {
    if (!p?.is_active) return 'inactive';
    const now = Date.now();
    if (p.starts_at && new Date(p.starts_at).getTime() > now) return 'scheduled';
    if (p.ends_at && new Date(p.ends_at).getTime() < now) return 'expired';
    if (!p.seller_id || !(p.product_ids?.length || p.product_id)) return 'incomplete';
    return 'live';
}

const STATUS_META = {
    live:       { label: 'Actif',         dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    scheduled:  { label: 'Programmé',     dot: 'bg-amber-500',   chip: 'bg-amber-50 text-amber-700 border-amber-200',      icon: Clock },
    expired:    { label: 'Expiré',        dot: 'bg-red-400',     chip: 'bg-red-50 text-red-600 border-red-200',            icon: XCircle },
    incomplete: { label: 'Non configuré', dot: 'bg-gray-300',    chip: 'bg-gray-100 text-gray-500 border-gray-200',        icon: AlertCircle },
    inactive:   { label: 'Désactivé',     dot: 'bg-gray-300',    chip: 'bg-gray-100 text-gray-500 border-gray-200',        icon: XCircle },
};

function StatusChip({ status, className = '' }) {
    const meta = STATUS_META[status] || STATUS_META.incomplete;
    const Icon = meta.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${meta.chip} ${className}`}>
            <Icon size={11} />
            {meta.label}
        </span>
    );
}

/* ═══ Mapper live → format réel de la landing (même mapping que HomeController) ═══ */

function mapPromoForPreview(promo, sellers, allProductsBySeller, customImageOverride) {
    const seller = sellers.find((s) => String(s.id) === String(promo.seller_id)) || null;
    const pool = allProductsBySeller[promo.seller_id] || [];
    const selectedIds = promo.product_ids?.length ? promo.product_ids : (promo.product_id ? [promo.product_id] : []);

    const products = selectedIds
        .map((id) => pool.find((p) => String(p.id) === String(id)))
        .filter(Boolean)
        .map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.sale_price ?? p.price,
            currency: p.currency || 'CDF',
            category_name: p.category_name ?? p.category?.name,
            image_url: p.image_url,
        }));

    const primary = products[0] || null;

    return {
        id: promo.id ?? null,
        promotion_order: promo.promotion_order,
        product_id: primary?.id ?? null,
        product_name: primary?.name ?? promo.product_name ?? null,
        product_price: primary?.price ?? null,
        product_currency: primary?.currency ?? 'CDF',
        product_slug: primary?.slug ?? null,
        custom_image_url: customImageOverride ?? promo.custom_image_url ?? null,
        headline: promo.headline || null,
        product_image: primary?.image_url ?? promo.product_image ?? null,
        category_name: primary?.category_name ?? null,
        seller_id: seller?.id ?? null,
        seller_name: seller?.business_name ?? promo.seller_name ?? null,
        seller_slug: seller?.slug ?? null,
        seller_city: seller?.city ?? null,
        seller_rating: seller?.average_rating ?? null,
        seller_verified: seller?.is_verified ?? null,
        product_ids: selectedIds,
        products,
    };
}

/* ═══════════════ APERÇU EN DIRECT — vrai composant HeroSection de la landing ═══════════════ */

const FRAME_WIDTHS = { desktop: 1280, mobile: 420 };

function LandingPreview({ promos, sellers, allProductsBySeller, imageOverrides, device = 'desktop' }) {
    const wrapRef = useRef(null);
    const [scale, setScale] = useState(0.4);

    // Le frame réel (1280px desktop / 420px mobile) est réduit via transform
    // pour tenir dans la colonne → fidélité 1:1 du rendu public.
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return undefined;
        const update = () => setScale(el.clientWidth / FRAME_WIDTHS[device]);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [device]);

    // Seuls les slots réellement visibles sur la landing alimentent le Hero.
    const landingPromos = useMemo(
        () => promos
            .filter((p) => slotStatus(p) === 'live')
            .map((p) => mapPromoForPreview(p, sellers, allProductsBySeller, imageOverrides?.[p.promotion_order]))
            .slice(0, 8),
        [promos, sellers, allProductsBySeller, imageOverrides],
    );

    const frameH = device === 'desktop' ? 760 : 900;

    return (
        <div>
            <div ref={wrapRef} className="relative w-full overflow-hidden rounded-xl border border-gray-300 bg-white shadow-lg">
                {/* Barre navigateur factice */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 border-b border-gray-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 flex-1 max-w-[240px] truncate rounded-full bg-white border border-gray-200 px-3 py-0.5 text-[10px] text-gray-400">
                        penepene.com — Accueil
                    </span>
                </div>

                <div className="relative w-full bg-gray-100" style={{ height: frameH * scale }}>
                    <div
                        className="absolute left-0 top-0 origin-top-left"
                        style={{ width: FRAME_WIDTHS[device], height: frameH, transform: `scale(${scale})` }}
                    >
                        {landingPromos.length > 0 ? (
                            <HeroSection heroProducts={[]} featuredPromotions={landingPromos} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0f1e5a] to-[#0056B3] text-white/80 px-8 text-center">
                                <Eye size={36} className="opacity-60" />
                                <p className="font-bold">Aucune promotion en ligne</p>
                                <p className="text-sm">Configurez un slot à gauche : l'aperçu affichera instantanément le rendu réel de la landing page.</p>
                            </div>
                        )}
                    </div>
                    {/* Bloque navigation (liens, recherche) dans l'aperçu */}
                    <div className="absolute inset-0 z-40" aria-hidden="true" />
                </div>
            </div>

            {/* Badges d'état par slot — explique pourquoi une promo n'apparaît pas */}
            <div className="mt-3 flex flex-wrap gap-2">
                {promos.map((p) => (
                    <span key={p.promotion_order} className="inline-flex items-center gap-1.5 text-[11px]">
                        <span className={`w-2 h-2 rounded-full ${STATUS_META[slotStatus(p)].dot}`} />
                        <span className="font-semibold text-gray-700">Photo {p.promotion_order}</span>
                        <StatusChip status={slotStatus(p)} />
                    </span>
                ))}
            </div>
        </div>
    );
}

function ProductPicker({ products, loading, selectedIds = [], onToggle, maxSelection = 5, disabledIds = new Set() }) {
    const selectedSet = useMemo(() => new Set(selectedIds.map((id) => String(id))), [selectedIds]);
    const disabledSet = useMemo(() => new Set([...disabledIds].map((id) => String(id))), [disabledIds]);
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
                    const isUsedElsewhere = disabledSet.has(String(p.id));
                    const isDisabled = (!isSelected && (activeCount >= maxSelection || isUsedElsewhere));
                    return (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => onToggle(p.id)}
                            disabled={isDisabled}
                            className={`relative flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all duration-200 ${
                                isSelected
                                    ? 'border-primary-500 ring-2 ring-primary-200 shadow-md'
                                    : isUsedElsewhere
                                        ? 'border-gray-200 bg-gray-100/70 opacity-60 cursor-not-allowed'
                                        : isDisabled
                                            ? 'opacity-60 cursor-not-allowed border-gray-200'
                                            : 'border-gray-200 hover:border-primary-300'
                            }`}
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
    onImagePreviewChange,
    disabledIds = new Set(),
    compact = false,
}) {
    const isExisting = !!promo.id;
    const products = sellerProducts[promo.seller_id] || [];
    const selectedProduct = products.find((p) => String(p.id) === String(promo.product_ids?.[0] || promo.product_id));
    const previewImage = promo.custom_image_url || selectedProduct?.image_url || promo.hero_image_url || null;
    const [customImageFile, setCustomImageFile] = React.useState(null);
    const [customImagePreview, setCustomImagePreview] = React.useState(promo.custom_image_url || null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleImageChange = useCallback((file) => {
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

    // Remonte l'aperçu d'image (blob local inclus) au parent pour le live preview
    useEffect(() => {
        onImagePreviewChange?.(promo.promotion_order, customImagePreview);
    }, [customImagePreview, promo.promotion_order, onImagePreviewChange]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        setError(null);
        try {
            await onSave(promo, customImageFile);
            dispatchToast(isExisting ? 'Promotion mise à jour.' : 'Promotion enregistrée.', 'success');
        } catch (e) {
            const message = e?.response?.data?.message || 'Échec de l’enregistrement.';
            setError(message);
            dispatchToast(message, 'error');
        } finally {
            setSaving(false);
        }
    }, [promo, customImageFile, isExisting, onSave]);

    const handleDelete = useCallback(async () => {
        if (!promo.id) return;
        if (!confirm('Supprimer cette promotion ?')) return;
        try {
            await onDelete(promo);
            dispatchToast('Promotion supprimée.', 'success');
        } catch (e) {
            dispatchToast('Échec de la suppression.', 'error');
        }
    }, [promo, onDelete]);

    return (
        <div className={`bg-white rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden flex flex-col ${
            isHeroSlot ? 'border-blue-200/80 ring-1 ring-blue-100/50' : 'border-gray-200/80'
        }`}>
            {/* Header de la carte */}
            <div className={`px-5 py-3.5 border-b flex justify-between items-center ${
                isHeroSlot ? 'bg-blue-50/60 border-blue-100' : 'bg-gray-50/70 border-gray-100'
            }`}>
                <div className="flex items-center gap-3 font-bold text-gray-900">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-xs ${
                        isHeroSlot ? 'bg-[#1e88e5] text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                        {promo.promotion_order}
                    </div>
                    <div>
                        <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight">
                            {isHeroSlot ? `Photo ${promo.promotion_order} (Hero)` : `Emplacement ${promo.promotion_order}`}
                        </span>
                        <span className="text-[11px] text-gray-500 font-normal">
                            {promo.seller_id ? 'Vendeur sélectionné' : 'Non configuré'}
                        </span>
                    </div>
                </div>
                <label className="flex items-center cursor-pointer gap-2 text-xs font-semibold">
                    <span className={promo.is_active ? 'text-emerald-600' : 'text-gray-400'}>
                        {promo.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <input
                        type="checkbox"
                        checked={promo.is_active}
                        onChange={(e) => onUpdate(promo.promotion_order, 'is_active', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1e88e5]" />
                </label>
            </div>

            {/* Corps de la carte */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col gap-5">
                {/* Section 1 — Vendeur */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 mb-1.5 uppercase tracking-wide">
                        <span className="w-5 h-5 rounded-full bg-[#1e88e5] text-white text-[10px] font-extrabold flex items-center justify-center">1</span>
                        Vendeur partenaire
                    </label>
                    <SellerSelect
                        sellers={sellers}
                        value={promo.seller_id}
                        onChange={(val) => onUpdate(promo.promotion_order, 'seller_id', val)}
                    />
                    <FieldHint>Les produits affichés dans le cadre proviennent de la boutique de ce vendeur.</FieldHint>
                </div>

                {/* Section 2 — Produits */}
                {promo.seller_id && (
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 mb-1.5 uppercase tracking-wide">
                            <span className="w-5 h-5 rounded-full bg-[#1e88e5] text-white text-[10px] font-extrabold flex items-center justify-center">2</span>
                            Produits mis en avant
                            <span className="text-[10px] font-normal text-gray-400 normal-case">(jusqu'à 5, rotation automatique)</span>
                        </label>
                        <ProductPicker
                            products={products}
                            loading={false}
                            selectedIds={promo.product_ids}
                            disabledIds={disabledIds}
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

                {/* Section 3 — Image personnalisée */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 mb-1.5 uppercase tracking-wide">
                        <span className="w-5 h-5 rounded-full bg-[#1e88e5] text-white text-[10px] font-extrabold flex items-center justify-center">3</span>
                        Image personnalisée
                        <span className="text-[10px] font-normal text-gray-400 normal-case">(optionnel)</span>
                    </label>
                    <ImageDropZone
                        previewUrl={customImagePreview || previewImage}
                        onFile={handleImageChange}
                        onClear={() => { setCustomImageFile(null); setCustomImagePreview(null); onUpdate(promo.promotion_order, 'custom_image_url', ''); }}
                    />
                    <FieldHint>
                        Sans image personnalisée, c'est la photo du premier produit sélectionné qui s'affiche sur le site.
                    </FieldHint>
                </div>

                {/* Section 4 — Accroche */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 uppercase tracking-wide">
                            <span className="w-5 h-5 rounded-full bg-[#1e88e5] text-white text-[10px] font-extrabold flex items-center justify-center">4</span>
                            Texte d'accroche
                            <span className="text-[10px] font-normal text-gray-400 normal-case">(optionnel)</span>
                        </label>
                        <span className={`text-[11px] font-semibold ${(promo.headline || '').length >= HEADLINE_MAX ? 'text-red-600' : 'text-gray-400'}`}>
                            {(promo.headline || '').length}/{HEADLINE_MAX}
                        </span>
                    </div>
                    <input
                        type="text"
                        placeholder="ex. Offre spéciale rentrée -30% !"
                        maxLength={HEADLINE_MAX}
                        value={promo.headline || ''}
                        onChange={(e) => onUpdate(promo.promotion_order, 'headline', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:italic placeholder:text-gray-400 focus:border-[#1e88e5] focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-2xs"
                    />
                    <FieldHint>Le texte s'affiche en bandeau bleu en haut du cadre — visible en direct dans l'aperçu à droite.</FieldHint>
                </div>

                {/* Section 5 — Dates */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 mb-1.5 uppercase tracking-wide">
                        <span className="w-5 h-5 rounded-full bg-[#1e88e5] text-white text-[10px] font-extrabold flex items-center justify-center">5</span>
                        Programmation
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1">Date de début</label>
                            <input
                                type="datetime-local"
                                value={promo.starts_at ? formatDateForInput(promo.starts_at) : ''}
                                onChange={(e) => onUpdate(promo.promotion_order, 'starts_at', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#1e88e5] focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-2xs cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1">Date de fin</label>
                            <input
                                type="datetime-local"
                                value={promo.ends_at ? formatDateForInput(promo.ends_at) : ''}
                                onChange={(e) => onUpdate(promo.promotion_order, 'ends_at', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#1e88e5] focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-2xs cursor-pointer"
                            />
                        </div>
                    </div>
                    {!promo.starts_at && !promo.ends_at ? (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                            <CheckCircle2 size={12} />
                            Promotion active dès l'enregistrement, sans date de fin.
                        </p>
                    ) : (
                        <FieldHint>
                            {promo.starts_at && new Date(promo.starts_at) > new Date()
                                ? 'La promotion n\'apparaîtra sur le site qu\'à partir de la date de début.'
                                : 'Laissez la date de fin vide pour une promotion sans expiration.'}
                        </FieldHint>
                    )}
                </div>

                {error && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 font-medium">
                        {error}
                    </div>
                )}
            </div>

            {/* Pied de carte / Boutons */}
            <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 flex justify-between items-center">
                <div>
                    {isExisting && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        >
                            <Trash2 size={14} />
                            Vider
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !promo.seller_id || !promo.product_ids?.length}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#1e88e5] hover:bg-[#1565c0] active:bg-[#0d47a1] rounded-lg shadow-2xs hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Enregistrement...' : isExisting ? 'Mettre à jour' : 'Enregistrer'}
                </button>
            </div>
        </div>
    );
}

function ImageDropZone({ previewUrl, onFile, onClear }) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

    const acceptFile = (file) => {
        if (file && file.type.startsWith('image/')) onFile(file);
    };

    return (
        <div>
            <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    acceptFile(e.dataTransfer.files?.[0]);
                }}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
                    dragOver
                        ? 'border-[#1e88e5] bg-blue-50/80 ring-4 ring-blue-100'
                        : 'border-gray-300 bg-gray-50/60 hover:border-[#1e88e5]/60 hover:bg-blue-50/40'
                }`}
            >
                {previewUrl ? (
                    <>
                        <img src={previewUrl} alt="Aperçu" className="w-full max-h-40 object-cover rounded-lg shadow-sm" />
                        <span className="text-[11px] font-semibold text-[#1e88e5]">Cliquez ou glissez pour remplacer</span>
                    </>
                ) : (
                    <>
                        <UploadCloud size={28} className="text-gray-400" />
                        <p className="text-sm font-semibold text-gray-700">Glissez une image ici</p>
                        <p className="text-[11px] text-gray-400">ou cliquez pour parcourir — JPG/PNG, max 5 Mo</p>
                    </>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => acceptFile(e.target.files?.[0])}
                />
            </div>
            {previewUrl && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                    ✕ Retirer l'image personnalisée
                </button>
            )}
        </div>
    );
}

function FieldHint({ children }) {
    return (
        <p className="mt-1 flex items-start gap-1 text-[11px] text-gray-500">
            <Info size={12} className="mt-0.5 shrink-0 text-gray-400" />
            <span>{children}</span>
        </p>
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
    const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'extra'
    const [activeHeroSlot, setActiveHeroSlot] = useState(1); // 1, 2, 3, 4
    const [viewMode, setViewMode] = useState('single'); // 'single' | 'all'
    const [imageOverrides, setImageOverrides] = useState({}); // slot -> url blob live
    const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

    const handleImagePreviewChange = useCallback((slot, url) => {
        setImageOverrides((prev) => {
            if (prev[slot] === url) return prev;
            return { ...prev, [slot]: url };
        });
    }, []);

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

    // Un produit ne peut appartenir qu'à un seul cadre à la fois.
    // On calcique, pour chaque slot, l'ensemble des IDs déjà utilisés par les autres slots.
    const disabledBySlot = useMemo(() => {
        const map = {};
        localPromotions.forEach((promo) => {
            map[promo.promotion_order] = new Set(
                (promo.product_ids || []).map((id) => String(id))
            );
        });
        return map;
    }, [localPromotions]);

    const getDisabledForSlot = useCallback((slot) => {
        const mine = disabledBySlot[slot] || new Set();
        const all = new Set();
        Object.entries(disabledBySlot).forEach(([order, set]) => {
            if (String(order) !== String(slot)) set.forEach((id) => all.add(id));
        });
        // On retire nos propres IDs pour rester sélectionnable
        mine.forEach((id) => all.delete(id));
        return all;
    }, [disabledBySlot]);

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
            return router.post(`/admin/promotions/${promo.id}`, formData, { forceFormData: true });
        }
        return router.post('/admin/promotions', formData, { forceFormData: true });
    }, [buildFormData]);

    const handleDelete = useCallback((promo) => {
        if (!promo.id) return Promise.resolve();
        return router.delete(`/admin/promotions/${promo.id}`);
    }, []);

    const currentHeroPromo = useMemo(
        () => localPromotions.find((p) => p.promotion_order === activeHeroSlot) || emptySlot(activeHeroSlot),
        [localPromotions, activeHeroSlot]
    );

    return (
        <>
            <Head title="Promotions Hero" />
            <AdminLayout title="Gestion des Promotions Page d'Accueil">

                {/* Header Banner & Navigation Tabs */}
                <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1e88e5] shrink-0">
                            <Megaphone size={22} />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900">Promotions Homepage</h2>
                            <p className="text-xs text-gray-500">Gérez le carrousel hero principal et les blocs de promotions vendeurs.</p>
                        </div>
                    </div>

                    {/* Tabs navigation */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab('hero')}
                            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                                activeTab === 'hero'
                                    ? 'bg-white text-[#1e88e5] shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            🎠 Carrousel Hero (1-4)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('extra')}
                            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                                activeTab === 'extra'
                                    ? 'bg-white text-[#1e88e5] shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            📌 Emplacements 5-10
                        </button>
                    </div>
                </div>

                {/* TAB 1: HERO CAROUSEL */}
                {activeTab === 'hero' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                        {/* Left Column: Form / Slot Editor */}
                        <div className="lg:col-span-7 space-y-5">

                    {/* Slot Selector — statut visible par slot */}
                            <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                    <span className="text-xs font-bold text-gray-400 mr-1 uppercase">Cadre:</span>
                                    {HERO_SLOTS.map((slot) => {
                                        const p = localPromotions.find((item) => item.promotion_order === slot);
                                        const status = slotStatus(p);
                                        const meta = STATUS_META[status];
                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => { setActiveHeroSlot(slot); setViewMode('single'); }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                    activeHeroSlot === slot && viewMode === 'single'
                                                        ? 'bg-[#1e88e5] text-white shadow-xs'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                                title={meta.label}
                                            >
                                                Photo {slot}
                                                <span className={`w-2 h-2 rounded-full ${activeHeroSlot === slot && viewMode === 'single' ? 'bg-white' : meta.dot}`} />
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-1 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('single')}
                                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                                            viewMode === 'single' ? 'bg-blue-50 text-[#1e88e5] font-semibold' : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        Vue ciblée
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('all')}
                                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                                            viewMode === 'all' ? 'bg-blue-50 text-[#1e88e5] font-semibold' : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        Tout voir (4)
                                    </button>
                                </div>
                            </div>

                            {/* Slot Editor View */}
                            {viewMode === 'single' ? (
                                <div className="space-y-4">
                                    <PromotionSlotCard
                                        key={currentHeroPromo.promotion_order}
                                        promo={currentHeroPromo}
                                        sellers={sellers}
                                        sellerProducts={allProductsBySeller}
                                        isHeroSlot
                                        onUpdate={handleUpdate}
                                        onSave={handleSave}
                                        onDelete={handleDelete}
                                        onImagePreviewChange={handleImagePreviewChange}
                                        disabledIds={getDisabledForSlot(currentHeroPromo.promotion_order)}
                                    />

                                    {/* Pagination between hero slots */}
                                    <div className="flex items-center justify-between px-2 pt-1 text-xs font-semibold text-gray-600">
                                        <button
                                            type="button"
                                            disabled={activeHeroSlot <= 1}
                                            onClick={() => setActiveHeroSlot((prev) => Math.max(1, prev - 1))}
                                            className="flex items-center gap-1 hover:text-[#1e88e5] disabled:opacity-30 disabled:hover:text-gray-600"
                                        >
                                            <ChevronLeft size={16} /> Cadre précédent
                                        </button>
                                        <span>Cadre {activeHeroSlot} sur 4</span>
                                        <button
                                            type="button"
                                            disabled={activeHeroSlot >= 4}
                                            onClick={() => setActiveHeroSlot((prev) => Math.min(4, prev + 1))}
                                            className="flex items-center gap-1 hover:text-[#1e88e5] disabled:opacity-30 disabled:hover:text-gray-600"
                                        >
                                            Cadre suivant <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
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
                                                onImagePreviewChange={handleImagePreviewChange}
                                                disabledIds={getDisabledForSlot(promo.promotion_order)}
                                            />
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Sticky Landing Live Preview */}
                        <div className="lg:col-span-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto dashboard-scrollbar space-y-4 self-start">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                    </span>
                                    <h3 className="text-sm font-bold text-gray-900">Aperçu — Landing page</h3>
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">temps réel</span>
                                </div>
                                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewDevice('desktop')}
                                        className={`p-1.5 rounded-md transition-colors ${previewDevice === 'desktop' ? 'bg-white text-[#1e88e5] shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
                                        title="Vue desktop"
                                    >
                                        <Monitor size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewDevice('mobile')}
                                        className={`p-1.5 rounded-md transition-colors ${previewDevice === 'mobile' ? 'bg-white text-[#1e88e5] shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
                                        title="Vue mobile"
                                    >
                                        <Smartphone size={15} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 -mt-1">
                                Rendu réel du hero de la boutique — se met à jour automatiquement pendant que vous modifiez (avant même d'enregistrer).
                            </p>

                            <LandingPreview
                                promos={localPromotions.filter((p) => HERO_SLOTS.includes(p.promotion_order))}
                                sellers={sellers}
                                allProductsBySeller={allProductsBySeller}
                                imageOverrides={imageOverrides}
                                device={previewDevice}
                            />
                        </div>
                    </div>
                )}

                {/* TAB 2: EXTRA SLOTS (5-10) */}
                {activeTab === 'extra' && (
                    <div>
                        <div className="mb-4 bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center gap-3 text-gray-700 text-sm">
                            <Megaphone size={18} className="text-gray-500 shrink-0" />
                            <p>Ces 6 emplacements secondaires s'affichent sous les sections thématiques de la page d'accueil.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
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
                                        onImagePreviewChange={handleImagePreviewChange}
                                        disabledIds={getDisabledForSlot(promo.promotion_order)}
                                    />
                                ))}
                        </div>
                    </div>
                )}
            </AdminLayout>
        </>
    );
}


