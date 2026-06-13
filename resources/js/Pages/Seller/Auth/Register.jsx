import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, ArrowRight, Building2, CheckCircle, ImageIcon, Lock, Mail,
    MapPin, Phone, Store, Upload, User,
} from 'lucide-react';
import AuthLayout from '@/Components/Auth/AuthLayout';
import AuthInput from '@/Components/Auth/AuthInput';
import StepIndicator from '@/Components/Auth/StepIndicator';
import useTranslation from '@/hooks/useTranslation';

const CATEGORIES = [
    'Electronics',
    'Fashion & Clothing',
    'Home & Furniture',
    'Beauty & Health',
    'Automotive',
    'Food & Groceries',
    'Other',
];

function SummaryRow({ label, value }) {
    return (
        <div className="flex justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500 shrink-0">{label}</span>
            <span className="text-sm font-medium text-gray-900 text-right break-words">{value || '—'}</span>
        </div>
    );
}

export default function Register() {
    const { t } = useTranslation();
    const STEPS = [
        { id: 'personal', label: t('seller.step_personal') },
        { id: 'store', label: t('seller.step_store') },
        { id: 'branding', label: t('seller.step_branding') },
        { id: 'review', label: t('seller.step_review') },
    ];
    const [step, setStep] = useState(1);
    const [logoPreview, setLogoPreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [stepError, setStepError] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        business_name: '',
        business_category: '',
        description: '',
        address: '',
        city: '',
        whatsapp: '',
        logo: null,
        cover_image: null,
    });

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!data.name || !data.email || !data.phone || !data.password || !data.password_confirmation) {
                return t('seller.validation_personal');
            }
            if (data.password.length < 8) return t('seller.validation_password_length');
            if (data.password !== data.password_confirmation) return t('seller.validation_password_match');
        }
        if (currentStep === 2) {
            if (!data.business_name || !data.business_category || !data.whatsapp || !data.city || !data.address || !data.description) {
                return t('seller.validation_store');
            }
        }
        return '';
    };

    const nextStep = () => {
        const err = validateStep(step);
        if (err) {
            setStepError(err);
            return;
        }
        setStepError('');
        setStep((s) => Math.min(s + 1, STEPS.length));
    };

    const prevStep = () => {
        setStepError('');
        setStep((s) => Math.max(s - 1, 1));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('cover_image', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/seller/register', { forceFormData: true });
    };

    const selectClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/80 focus:bg-white outline-none transition-all shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500';
    const textareaClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/80 focus:bg-white outline-none transition-all shadow-sm focus:ring-2 focus:ring-amber-500 resize-none';

    return (
        <>
            <Head title={t('seller.create_seller_account_title')} />
            <AuthLayout
                accent="amber"
                maxWidth="max-w-3xl"
                title={t('seller.register_title')}
                subtitle={t('seller.register_subtitle')}
                headline={t('seller.seller_register_headline')}
                benefits={[
                    t('seller.seller_benefit_1'),
                    t('seller.seller_benefit_2'),
                    t('seller.seller_benefit_3'),
                ]}
                footer={
                    <p className="text-center text-sm text-gray-500">
                        {t('auth.already_have_account')}{' '}
                        <Link href="/login" className="text-amber-600 font-semibold hover:text-amber-800 transition-colors">
                            {t('auth.sign_in_here')}
                        </Link>
                    </p>
                }
            >
                <StepIndicator steps={STEPS} currentStep={step} accent="amber" />

                {stepError && (
                    <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                        {stepError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Personal */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{t('seller.personal_information')}</h3>
                                    <p className="text-sm text-gray-500">{t('seller.personal_information_desc')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <AuthInput id="name" label={t('auth.full_name')} icon={User} value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} placeholder={t('auth.name_placeholder')} required accent="amber" />
                                </div>
                                <AuthInput id="email" label={t('auth.email')} type="email" icon={Mail} value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} placeholder="you@example.com" required accent="amber" />
                                <AuthInput id="phone" label={t('auth.phone_number')} type="tel" icon={Phone} value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} placeholder={t('auth.phone_placeholder')} required accent="amber" />
                                <AuthInput id="password" label={t('auth.password')} type="password" icon={Lock} value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} placeholder={t('auth.min_password_placeholder')} required accent="amber" />
                                <AuthInput id="password_confirmation" label={t('auth.confirm_password')} type="password" icon={Lock} value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder={t('auth.confirm_password_placeholder')} required accent="amber" />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Store */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                    <Store size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{t('seller.store_information')}</h3>
                                    <p className="text-sm text-gray-500">{t('seller.store_information_desc')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <AuthInput id="business_name" label={t('seller.business_name')} icon={Building2} value={data.business_name} onChange={(e) => setData('business_name', e.target.value)} error={errors.business_name} placeholder={t('seller.business_name_placeholder')} required accent="amber" />
                                </div>
                                <div>
                                    <label htmlFor="business_category" className="block text-sm font-semibold text-gray-700 mb-1.5">{t('seller.business_category')}</label>
                                    <select id="business_category" value={data.business_category} onChange={(e) => setData('business_category', e.target.value)} className={selectClass} required>
                                        <option value="">{t('seller.select_category')}</option>
                                        {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    {errors.business_category && <p className="mt-1.5 text-sm text-red-500">{errors.business_category}</p>}
                                </div>
                                <AuthInput id="whatsapp" label={t('seller.whatsapp_number')} type="tel" icon={Phone} value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} error={errors.whatsapp} placeholder={t('auth.phone_placeholder')} required accent="amber" />
                                <AuthInput id="city" label={t('seller.city')} icon={MapPin} value={data.city} onChange={(e) => setData('city', e.target.value)} error={errors.city} placeholder={t('seller.city_placeholder')} required accent="amber" />
                                <AuthInput id="address" label={t('seller.address')} icon={MapPin} value={data.address} onChange={(e) => setData('address', e.target.value)} error={errors.address} placeholder={t('seller.address_placeholder')} required accent="amber" />
                                <div className="sm:col-span-2">
                                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">{t('seller.store_description')}</label>
                                    <textarea id="description" rows={4} value={data.description} onChange={(e) => setData('description', e.target.value)} className={textareaClass} placeholder={t('seller.store_description_placeholder')} required />
                                    {errors.description && <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Branding */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                    <ImageIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{t('seller.store_branding')}</h3>
                                    <p className="text-sm text-gray-500">{t('seller.store_branding_desc')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-5 hover:border-amber-300 transition-colors">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">{t('seller.store_logo')}</p>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-24 w-24 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <Store className="text-gray-300" size={32} />
                                            )}
                                        </div>
                                        <label className="cursor-pointer inline-flex items-center gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors">
                                            <Upload size={16} />
                                            <span>{t('seller.upload_logo')}</span>
                                            <input type="file" className="sr-only" accept="image/*" onChange={handleLogoChange} />
                                        </label>
                                    </div>
                                    {errors.logo && <p className="mt-2 text-sm text-red-500 text-center">{errors.logo}</p>}
                                </div>

                                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-5 hover:border-amber-300 transition-colors">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">{t('seller.cover_image')}</p>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-24 w-full max-w-[200px] rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                            {coverPreview ? (
                                                <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="text-gray-300" size={32} />
                                            )}
                                        </div>
                                        <label className="cursor-pointer inline-flex items-center gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors">
                                            <Upload size={16} />
                                            <span>{t('seller.upload_cover')}</span>
                                            <input type="file" className="sr-only" accept="image/*" onChange={handleCoverChange} />
                                        </label>
                                    </div>
                                    {errors.cover_image && <p className="mt-2 text-sm text-red-500 text-center">{errors.cover_image}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{t('seller.review_submit')}</h3>
                                    <p className="text-sm text-gray-500">{t('seller.review_submit_desc')}</p>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3">{t('seller.step_personal')}</p>
                                <SummaryRow label={t('auth.full_name')} value={data.name} />
                                <SummaryRow label={t('auth.email')} value={data.email} />
                                <SummaryRow label={t('auth.phone_number')} value={data.phone} />
                            </div>

                            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3">{t('seller.step_store')}</p>
                                <SummaryRow label={t('seller.business_name')} value={data.business_name} />
                                <SummaryRow label={t('seller.business_category')} value={data.business_category} />
                                <SummaryRow label={t('seller.whatsapp_number')} value={data.whatsapp} />
                                <SummaryRow label={t('seller.city')} value={data.city} />
                                <SummaryRow label={t('seller.address')} value={data.address} />
                                <SummaryRow label={t('seller.store_description')} value={data.description} />
                            </div>

                            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3">{t('seller.step_branding')}</p>
                                <div className="flex gap-4 items-center">
                                    <div className="h-14 w-14 rounded-xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                                        {logoPreview ? <img src={logoPreview} alt="" className="h-full w-full object-cover" /> : <Store className="text-gray-300" size={20} />}
                                    </div>
                                    <div className="h-14 flex-1 max-w-xs rounded-xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                                        {coverPreview ? <img src={coverPreview} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-gray-400">{t('seller.no_cover_image')}</span>}
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-center text-gray-500 leading-relaxed">
                                {t('auth.agree_terms_prefix')}{' '}
                                <Link href="/terms" className="text-amber-600 hover:underline">{t('seller.seller_terms')}</Link>
                                {' '}{t('auth.and_conjunction')}{' '}
                                <Link href="/privacy" className="text-amber-600 hover:underline">{t('auth.privacy_policy')}</Link>.
                            </p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button type="button" onClick={prevStep} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                                <ArrowLeft size={18} />
                                {t('common.back')}
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < STEPS.length ? (
                            <button type="button" onClick={nextStep} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-lg shadow-amber-600/25 ml-auto">
                                {t('common.next')}
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-70 text-white font-bold transition-all shadow-lg shadow-amber-600/25 ml-auto">
                                {processing ? t('seller.creating_store') : t('seller.create_seller_account')}
                            </button>
                        )}
                    </div>
                </form>
            </AuthLayout>
        </>
    );
}
