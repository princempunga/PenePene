import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import useTranslation from '@/hooks/useTranslation';

export default function Profile({ user, buyer }) {
    const { flash } = usePage().props;
    const { t } = useTranslation();

    const profileForm = useForm({
        name: user.name || '',
        phone: user.phone || '',
        address: buyer?.address || '',
        city: buyer?.city || '',
        country: buyer?.country || 'Tanzania',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updateProfile = (e) => {
        e.preventDefault();
        profileForm.patch('/buyer/profile');
    };

    const updatePassword = (e) => {
        e.preventDefault();
        passwordForm.patch('/buyer/profile/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <>
            <Head title={t('buyer.profile')} />
            <BuyerLayout
                title={t('buyer.profile')}
                subtitle={t('buyer.profile_subtitle_full')}
            >
                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50/50 to-white">
                            <h2 className="font-bold text-gray-900">{t('buyer.personal_information')}</h2>
                            <p className="text-sm text-gray-500 mt-1">{t('buyer.personal_information_desc')}</p>
                        </div>
                        <form onSubmit={updateProfile} className="p-5 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.full_name')}</label>
                                <input
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                                {profileForm.errors.name && <p className="mt-1 text-xs text-red-600">{profileForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone_number')}</label>
                                <input
                                    type="tel"
                                    value={profileForm.data.phone}
                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                                {profileForm.errors.phone && <p className="mt-1 text-xs text-red-600">{profileForm.errors.phone}</p>}
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('buyer.default_shipping_address')}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('buyer.street_address')}</label>
                                        <input
                                            type="text"
                                            value={profileForm.data.address}
                                            onChange={(e) => profileForm.setData('address', e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                            placeholder={t('buyer.street_placeholder')}
                                        />
                                        {profileForm.errors.address && <p className="mt-1 text-xs text-red-600">{profileForm.errors.address}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('seller.city')}</label>
                                            <input
                                                type="text"
                                                value={profileForm.data.city}
                                                onChange={(e) => profileForm.setData('city', e.target.value)}
                                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                                placeholder={t('buyer.city_placeholder')}
                                            />
                                            {profileForm.errors.city && <p className="mt-1 text-xs text-red-600">{profileForm.errors.city}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('buyer.country')}</label>
                                            <input
                                                type="text"
                                                value={profileForm.data.country}
                                                onChange={(e) => profileForm.setData('country', e.target.value)}
                                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                            />
                                            {profileForm.errors.country && <p className="mt-1 text-xs text-red-600">{profileForm.errors.country}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
                                >
                                    {profileForm.processing ? t('buyer.saving') : t('buyer.save_changes')}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-fit">
                        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <h2 className="font-bold text-gray-900">{t('buyer.change_password')}</h2>
                            <p className="text-sm text-gray-500 mt-1">{t('buyer.change_password_desc')}</p>
                        </div>
                        <form onSubmit={updatePassword} className="p-5 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('buyer.current_password')}</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                                {passwordForm.errors.current_password && <p className="mt-1 text-xs text-red-600">{passwordForm.errors.current_password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('buyer.new_password')}</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                                {passwordForm.errors.password && <p className="mt-1 text-xs text-red-600">{passwordForm.errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('buyer.confirm_new_password')}</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
                                >
                                    {passwordForm.processing ? t('buyer.updating') : t('buyer.update_password')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </BuyerLayout>
        </>
    );
}
