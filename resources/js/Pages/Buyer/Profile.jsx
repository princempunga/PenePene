import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';

export default function Profile({ user, buyer }) {
    const { flash } = usePage().props;

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
            <Head title="My Profile" />
            <BuyerLayout title="Profile Settings">
                {flash?.success && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Personal Information</h2>
                            <p className="text-sm text-gray-500 mt-1">Update your account details and default shipping address.</p>
                        </div>
                        <form onSubmit={updateProfile} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={e => profileForm.setData('name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                                {profileForm.errors.name && <p className="mt-1 text-xs text-red-600">{profileForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-4 py-2 text-sm cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={profileForm.data.phone}
                                    onChange={e => profileForm.setData('phone', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                                {profileForm.errors.phone && <p className="mt-1 text-xs text-red-600">{profileForm.errors.phone}</p>}
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Default Shipping Address</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                        <input
                                            type="text"
                                            value={profileForm.data.address}
                                            onChange={e => profileForm.setData('address', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                            placeholder="123 Main St, Apartment 4B"
                                        />
                                        {profileForm.errors.address && <p className="mt-1 text-xs text-red-600">{profileForm.errors.address}</p>}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                value={profileForm.data.city}
                                                onChange={e => profileForm.setData('city', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                                placeholder="Dar es Salaam"
                                            />
                                            {profileForm.errors.city && <p className="mt-1 text-xs text-red-600">{profileForm.errors.city}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                            <input
                                                type="text"
                                                value={profileForm.data.country}
                                                onChange={e => profileForm.setData('country', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
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
                                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors"
                                >
                                    {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Change Password</h2>
                            <p className="text-sm text-gray-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                        </div>
                        <form onSubmit={updatePassword} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={e => passwordForm.setData('current_password', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                                {passwordForm.errors.current_password && <p className="mt-1 text-xs text-red-600">{passwordForm.errors.current_password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={e => passwordForm.setData('password', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                                {passwordForm.errors.password && <p className="mt-1 text-xs text-red-600">{passwordForm.errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors"
                                >
                                    {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </BuyerLayout>
        </>
    );
}
