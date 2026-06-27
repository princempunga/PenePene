import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { blockAdminDemoAction } from '@/lib/adminDemo';
import { Plus, Trash2, Shield, X, ShieldAlert } from 'lucide-react';

export default function SubAdminsIndex({ admins }) {
    const { flash, errors, usingDemoData } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, delete: destroy, processing, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const openModal = () => {
        if (blockAdminDemoAction(usingDemoData)) return;
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => reset(), 200);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (blockAdminDemoAction(usingDemoData)) return;
        post('/admin/admins', {
            onSuccess: () => closeModal(),
        });
    };

    const handleDelete = (id) => {
        if (blockAdminDemoAction(usingDemoData)) return;
        if (confirm('Are you sure you want to remove this administrator? They will lose all access.')) {
            destroy(`/admin/admins/${id}`);
        }
    };

    return (
        <>
            <Head title="Manage Sub-Admins" />
            <AdminLayout subtitle="Système" title="Sous-admins">
                
                <div className="mb-6 bg-slate-800 text-slate-100 rounded-xl p-5 flex items-start gap-4">
                    <ShieldAlert size={24} className="text-amber-400 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-white text-lg">Super Admin Area</h3>
                        <p className="text-sm text-slate-300 mt-1">
                            Only Super Admins can access this page. You can grant admin access to staff members here. Admins can verify sellers, moderate products, and manage categories, but cannot manage other admins.
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500 font-medium">Currently active administrators: {admins.length}</p>
                    <button 
                        onClick={openModal}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm shadow-sm"
                    >
                        <Plus size={16} /> Add Admin
                    </button>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Added On</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                                            {admin.name.charAt(0)}
                                        </div>
                                        {admin.name}
                                    </td>
                                    <td className="px-6 py-4">{admin.email}</td>
                                    <td className="px-6 py-4">{admin.phone || '-'}</td>
                                    <td className="px-6 py-4">{new Date(admin.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleDelete(admin.id)}
                                            disabled={processing}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                            title="Revoke Access"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {admins.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <Shield size={32} className="mx-auto mb-3 text-gray-300" />
                                        <p>No sub-admins configured yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">Add New Administrator</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                                    <input 
                                        type="tel" 
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input 
                                        type="password" 
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                    />
                                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
                                    <button 
                                        type="button" 
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Admin'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </AdminLayout>
        </>
    );
}
