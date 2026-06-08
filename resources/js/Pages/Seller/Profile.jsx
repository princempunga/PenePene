import React, { useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Upload } from 'lucide-react';

export default function Profile({ user, seller }) {
    const { flash } = usePage().props;
    const bannerRef = useRef(null);

    const profileForm = useForm({
        name: user.name || '',
        phone: user.phone || '',
        business_name: seller.business_name || '',
        description: seller.description || '',
        address: seller.address || '',
        city: seller.city || '',
        country: seller.country || 'Tanzania',
        banner: null,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updateProfile = (e) => {
        e.preventDefault();
        profileForm.post('/seller/profile', {
            preserveScroll: true,
        });
    };

    const updatePassword = (e) => {
        e.preventDefault();
        passwordForm.patch('/seller/profile/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <>
            <Head title="Store Profile" />
            <SellerLayout title="Store Profile">
                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profile Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Store Information</h2>
                            <p className="text-sm text-gray-500 mt-1">Update your public store details and contact info.</p>
                        </div>
                        <form onSubmit={updateProfile} className="p-6 space-y-5">
                            
                            {/* Banner Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Banner Image</label>
                                <div 
                                    onClick={() => bannerRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors"
                                >
                                    {seller.banner_path && !profileForm.data.banner ? (
                                        <div className="text-center">
                                            <img src={`/storage/${seller.banner_path}`} alt="Banner" className="h-24 object-cover rounded-md mb-2 mx-auto" />
                                            <span className="text-sm text-primary-600">Click to change</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={24} className="text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600">{profileForm.data.banner ? profileForm.data.banner.name : 'Click to upload banner (Max 2MB)'}</p>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={bannerRef}
                                        onChange={e => profileForm.setData('banner', e.target.files[0])}
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                </div>
                                {profileForm.errors.banner && <p className="mt-1 text-xs text-red-600">{profileForm.errors.banner}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.data.name}
                                        onChange={e => profileForm.setData('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                    {profileForm.errors.name && <p className="mt-1 text-xs text-red-600">{profileForm.errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={profileForm.data.phone}
                                        onChange={e => profileForm.setData('phone', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                    {profileForm.errors.phone && <p className="mt-1 text-xs text-red-600">{profileForm.errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                <input
                                    type="text"
                                    value={profileForm.data.business_name}
                                    onChange={e => profileForm.setData('business_name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                {profileForm.errors.business_name && <p className="mt-1 text-xs text-red-600">{profileForm.errors.business_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                                <textarea
                                    value={profileForm.data.description}
                                    onChange={e => profileForm.setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={profileForm.data.address}
                                    onChange={e => profileForm.setData('address', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={profileForm.data.city}
                                        onChange={e => profileForm.setData('city', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        value={profileForm.data.country}
                                        onChange={e => profileForm.setData('country', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
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

                    {/* Security & Subscription */}
                    <div className="space-y-6">
                        {/* Security */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900">Change Password</h2>
                                <p className="text-sm text-gray-500 mt-1">Keep your account secure.</p>
                            </div>
                            <form onSubmit={updatePassword} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.current_password}
                                        onChange={e => passwordForm.setData('current_password', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                    {passwordForm.errors.current_password && <p className="mt-1 text-xs text-red-600">{passwordForm.errors.current_password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={e => passwordForm.setData('password', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                    {passwordForm.errors.password && <p className="mt-1 text-xs text-red-600">{passwordForm.errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
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

                        {/* Subscription info */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="font-bold text-gray-900 mb-4">Subscription Plan</h2>
                            
                            <div className="p-4 bg-primary-50 rounded-lg border border-primary-100 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-primary-900">{seller.plan?.name || 'Standard Plan'}</p>
                                    <p className="text-sm text-primary-700">Expires: {new Date(seller.subscription_expires_at).toLocaleDateString()}</p>
                                </div>
                                <button className="text-sm font-medium bg-white px-3 py-1.5 rounded-md text-primary-700 border border-primary-200 hover:bg-primary-100">
                                    Upgrade
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SellerLayout>
        </>
    );
}
