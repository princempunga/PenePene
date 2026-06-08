import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Shield, Plus, Edit, Trash2, Check, X } from 'lucide-react';

export default function SubscriptionPlansIndex({ plans }) {
    const { flash } = usePage().props;
    const [editingPlan, setEditingPlan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: '',
        price: '',
        currency: 'TZS',
        billing_cycle: 'monthly',
        duration_days: 30,
        features: '', // Will process as newline separated string
        is_active: true,
        sort_order: 0,
    });

    const openModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setData({
                name: plan.name,
                description: plan.description || '',
                price: plan.price,
                currency: plan.currency,
                billing_cycle: plan.billing_cycle,
                duration_days: plan.duration_days,
                features: plan.features ? JSON.parse(plan.features).join('\n') : '',
                is_active: plan.is_active,
                sort_order: plan.sort_order,
            });
        } else {
            setEditingPlan(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            features: data.features.split('\n').map(f => f.trim()).filter(f => f)
        };

        if (editingPlan) {
            put(`/admin/plans/${editingPlan.slug}`, {
                data: payload,
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            post('/admin/plans', {
                data: payload,
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const deletePlan = (slug) => {
        if (confirm('Are you sure you want to delete this plan?')) {
            destroy(`/admin/plans/${slug}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Subscription Plans" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
                    <p className="text-gray-500 mt-1">Manage seller subscription tiers and pricing.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
                >
                    <Plus size={18} /> Add Plan
                </button>
            </div>

            {flash?.success && (
                <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-lg text-sm border border-red-200">
                    {flash.error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className={`bg-white rounded-xl border ${plan.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50/20'} p-6 shadow-sm`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => openModal(plan)} className="text-blue-500 hover:text-blue-700 p-1"><Edit size={16}/></button>
                                <button onClick={() => deletePlan(plan.slug)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-gray-900 mb-4">
                            {plan.price == 0 ? 'Free' : `${plan.currency} ${parseFloat(plan.price).toLocaleString()}`}
                            {plan.price > 0 && <span className="text-sm font-medium text-gray-500 font-normal">/{plan.billing_cycle === 'monthly' ? 'mo' : 'yr'}</span>}
                        </div>
                        <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
                        <ul className="space-y-2 mb-4">
                            {plan.features ? JSON.parse(plan.features).map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <Check size={14} className="text-green-500 mt-0.5" /> {feature}
                                </li>
                            )) : null}
                        </ul>
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                            <span className={plan.is_active ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                                {plan.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-gray-400">Order: {plan.sort_order}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="planForm" onSubmit={submit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input type="text" value={data.name} onChange={e=>setData('name', e.target.value)} required className="w-full border-gray-300 rounded-lg"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (TZS)</label>
                                        <input type="number" value={data.price} onChange={e=>setData('price', e.target.value)} required min="0" className="w-full border-gray-300 rounded-lg"/>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input type="text" value={data.description} onChange={e=>setData('description', e.target.value)} className="w-full border-gray-300 rounded-lg"/>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                                        <select value={data.billing_cycle} onChange={e=>setData('billing_cycle', e.target.value)} className="w-full border-gray-300 rounded-lg">
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                                        <input type="number" value={data.duration_days} onChange={e=>setData('duration_days', e.target.value)} required className="w-full border-gray-300 rounded-lg"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                        <input type="number" value={data.sort_order} onChange={e=>setData('sort_order', e.target.value)} className="w-full border-gray-300 rounded-lg"/>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Features (One per line)</label>
                                    <textarea rows="4" value={data.features} onChange={e=>setData('features', e.target.value)} className="w-full border-gray-300 rounded-lg" placeholder="10 Products&#10;Premium Support"></textarea>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={data.is_active} onChange={e=>setData('is_active', e.target.checked)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                        <span className="text-sm font-medium text-gray-900">Plan is Active</span>
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition">Cancel</button>
                            <button form="planForm" type="submit" disabled={processing} className="px-5 py-2 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-lg transition shadow-md">
                                Save Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
