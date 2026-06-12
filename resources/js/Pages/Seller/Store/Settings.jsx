import React, { useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Upload, Clock, Store, ImageIcon } from 'lucide-react';

const DAYS = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' },
];

const defaultHours = () =>
    DAYS.reduce((acc, { key }) => {
        acc[key] = { open: '08:00', close: '18:00', closed: false };
        return acc;
    }, {});

function FlashAlert({ flash }) {
    if (!flash?.success && !flash?.error) return null;

    const isError = !!flash?.error;
    return (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
            isError
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-green-50 border-green-200 text-green-800'
        }`}>
            {flash.success || flash.error}
        </div>
    );
}

function FieldError({ message }) {
    if (!message) return null;
    return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function ImageUpload({ label, hint, currentPath, preview, onChange, error }) {
    const inputRef = useRef(null);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors min-h-[120px]"
            >
                {preview ? (
                    <div className="text-center w-full">
                        <img src={preview} alt={label} className="h-20 object-contain rounded-md mb-2 mx-auto" />
                        <span className="text-sm text-primary-600">Cliquer pour modifier</span>
                    </div>
                ) : currentPath ? (
                    <div className="text-center w-full">
                        <img src={`/storage/${currentPath}`} alt={label} className="h-20 object-cover rounded-md mb-2 mx-auto" />
                        <span className="text-sm text-primary-600">Cliquer pour modifier</span>
                    </div>
                ) : (
                    <>
                        <Upload size={22} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">{hint}</p>
                    </>
                )}
                <input
                    type="file"
                    ref={inputRef}
                    onChange={onChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>
            <FieldError message={error} />
        </div>
    );
}

export default function StoreSettings({ seller }) {
    const { flash } = usePage().props;
    const mergedHours = { ...defaultHours(), ...(seller.business_hours || {}) };

    const form = useForm({
        business_name: seller.business_name || '',
        description: seller.description || '',
        phone: seller.phone || '',
        whatsapp: seller.whatsapp || '',
        email: seller.email || '',
        website: seller.website || '',
        address: seller.address || '',
        city: seller.city || '',
        country: seller.country || 'République démocratique du Congo',
        logo: null,
        banner: null,
        business_hours: mergedHours,
    });

    const logoPreview = form.data.logo ? URL.createObjectURL(form.data.logo) : null;
    const bannerPreview = form.data.banner ? URL.createObjectURL(form.data.banner) : null;

    const updateHours = (day, field, value) => {
        form.setData('business_hours', {
            ...form.data.business_hours,
            [day]: { ...form.data.business_hours[day], [field]: value },
        });
    };

    const submit = (e) => {
        e.preventDefault();
        form.post('/seller/store/settings', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Paramètres de la boutique" />
            <SellerLayout title="Paramètres de la boutique">
                <FlashAlert flash={flash} />

                <div className="mb-6 flex items-center gap-3 text-sm text-gray-500">
                    <Store size={16} />
                    <span>Gérez l&apos;apparence de votre boutique pour les acheteurs.</span>
                    <Link href="/seller/profile" className="ml-auto text-primary-600 hover:underline font-medium">
                        Profil du compte →
                    </Link>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Branding */}
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <ImageIcon size={18} className="text-primary-600" />
                                Image de marque
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Nom, description et identité visuelle de votre boutique.</p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique</label>
                                <input
                                    type="text"
                                    value={form.data.business_name}
                                    onChange={e => form.setData('business_name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <FieldError message={form.errors.business_name} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description de la boutique</label>
                                <textarea
                                    value={form.data.description}
                                    onChange={e => form.setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Dites aux acheteurs ce qui rend votre boutique unique..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                />
                                <FieldError message={form.errors.description} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <ImageUpload
                                    label="Logo de la boutique"
                                    hint="Cliquer pour téléverser le logo (max. 2 Mo)"
                                    currentPath={seller.logo}
                                    preview={logoPreview}
                                    onChange={e => form.setData('logo', e.target.files[0])}
                                    error={form.errors.logo}
                                />
                                <ImageUpload
                                    label="Bannière de la boutique"
                                    hint="Cliquer pour téléverser la bannière (max. 4 Mo)"
                                    currentPath={seller.banner}
                                    preview={bannerPreview}
                                    onChange={e => form.setData('banner', e.target.files[0])}
                                    error={form.errors.banner}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Coordonnées</h2>
                            <p className="text-sm text-gray-500 mt-1">Comment les acheteurs peuvent contacter votre boutique.</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone de la boutique</label>
                                <input
                                    type="text"
                                    value={form.data.phone}
                                    onChange={e => form.setData('phone', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <FieldError message={form.errors.phone} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                <input
                                    type="text"
                                    value={form.data.whatsapp}
                                    onChange={e => form.setData('whatsapp', e.target.value)}
                                    placeholder="+243..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <FieldError message={form.errors.whatsapp} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail de la boutique</label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={e => form.setData('email', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <FieldError message={form.errors.email} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                                <input
                                    type="url"
                                    value={form.data.website}
                                    onChange={e => form.setData('website', e.target.value)}
                                    placeholder="https://"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <FieldError message={form.errors.website} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                <input
                                    type="text"
                                    value={form.data.address}
                                    onChange={e => form.setData('address', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <FieldError message={form.errors.address} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                <input
                                    type="text"
                                    value={form.data.city}
                                    onChange={e => form.setData('city', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <FieldError message={form.errors.city} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                                <input
                                    type="text"
                                    value={form.data.country}
                                    onChange={e => form.setData('country', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <FieldError message={form.errors.country} />
                            </div>
                        </div>
                    </section>

                    {/* Business Hours */}
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Clock size={18} className="text-primary-600" />
                                Heures d&apos;ouverture
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Indiquez aux acheteurs quand votre boutique est ouverte.</p>
                        </div>
                        <div className="p-6 space-y-3">
                            {DAYS.map(({ key, label }) => {
                                const day = form.data.business_hours[key] || { open: '08:00', close: '18:00', closed: false };
                                return (
                                    <div key={key} className="flex flex-wrap items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                        <span className="w-28 text-sm font-medium text-gray-700">{label}</span>
                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={!!day.closed}
                                                onChange={e => updateHours(key, 'closed', e.target.checked)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            Fermé
                                        </label>
                                        {!day.closed && (
                                            <>
                                                <input
                                                    type="time"
                                                    value={day.open || '08:00'}
                                                    onChange={e => updateHours(key, 'open', e.target.value)}
                                                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                                />
                                                <span className="text-gray-400 text-sm">à</span>
                                                <input
                                                    type="time"
                                                    value={day.close || '18:00'}
                                                    onChange={e => updateHours(key, 'close', e.target.value)}
                                                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                                />
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-8 rounded-lg text-sm transition-colors disabled:opacity-60"
                        >
                            {form.processing ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                        </button>
                    </div>
                </form>
            </SellerLayout>
        </>
    );
}
