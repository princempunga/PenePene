import React, { useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Upload, Shield, User } from 'lucide-react';

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

export default function Profile({ user }) {
    const { flash } = usePage().props;
    const avatarRef = useRef(null);

    const profileForm = useForm({
        name: user.name || '',
        phone: user.phone || '',
        avatar: null,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const avatarPreview = profileForm.data.avatar
        ? URL.createObjectURL(profileForm.data.avatar)
        : null;

    const updateProfile = (e) => {
        e.preventDefault();
        profileForm.post('/admin/profile', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const updatePassword = (e) => {
        e.preventDefault();
        passwordForm.patch('/admin/profile/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <>
            <Head title="Admin Profile" />
            <AdminLayout title="My Profile">
                <FlashAlert flash={flash} />

                <div className="mb-6 flex items-center gap-3 text-sm text-gray-500">
                    <User size={16} />
                    <span>Manage your personal information and account security.</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Personal Information</h2>
                            <p className="text-sm text-gray-500 mt-1">Update your name, phone number, and profile photo.</p>
                        </div>
                        <form onSubmit={updateProfile} className="p-6 space-y-5">
                            <div className="flex items-center gap-5">
                                <div
                                    onClick={() => avatarRef.current?.click()}
                                    className="relative w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-2xl cursor-pointer overflow-hidden border-2 border-dashed border-primary-200 hover:border-primary-500 transition-colors shrink-0"
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                                    ) : user.avatar ? (
                                        <img src={`/storage/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        user.name?.charAt(0)?.toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => avatarRef.current?.click()}
                                        className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
                                    >
                                        <Upload size={14} />
                                        {profileForm.data.avatar ? profileForm.data.avatar.name : 'Upload a photo'}
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5 MB</p>
                                    <input
                                        type="file"
                                        ref={avatarRef}
                                        onChange={e => profileForm.setData('avatar', e.target.files[0])}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                            <FieldError message={profileForm.errors.avatar} />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={e => profileForm.setData('name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <FieldError message={profileForm.errors.name} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-4 py-2 text-sm cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">Contact support to change your email.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={profileForm.data.phone}
                                    onChange={e => profileForm.setData('phone', e.target.value)}
                                    placeholder="+243..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <FieldError message={profileForm.errors.phone} />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors disabled:opacity-60"
                                >
                                    {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Shield size={18} className="text-gray-600" />
                                Change Password
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Protect your account with a strong password.</p>
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
                                <FieldError message={passwordForm.errors.current_password} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={e => passwordForm.setData('password', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <FieldError message={passwordForm.errors.password} />
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
                                    className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors disabled:opacity-60"
                                >
                                    {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
