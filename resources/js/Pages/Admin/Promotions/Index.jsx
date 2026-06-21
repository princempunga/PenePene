import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Megaphone, Save, Trash2, AlertCircle, PlusCircle } from 'lucide-react';
import axios from 'axios';

export default function PromotionsIndex({ promotions = [], sellers = [] }) {
    const slots = [1, 2, 3];
    const [localPromotions, setLocalPromotions] = useState([]);
    const [sellerProducts, setSellerProducts] = useState({}); // { seller_id: [products] }
    const [loadingProducts, setLoadingProducts] = useState({}); // { slot: true/false }

    useEffect(() => {
        // Initialize local state mapping slots to promotions
        const initial = slots.map(slot => {
            const existing = promotions.find(p => p.promotion_order === slot);
            return existing || {
                promotion_order: slot,
                seller_id: '',
                product_id: '',
                is_active: true,
                starts_at: '',
                ends_at: ''
            };
        });
        setLocalPromotions(initial);

        // Preload products for existing promotions
        initial.forEach(promo => {
            if (promo.seller_id) {
                fetchProducts(promo.seller_id, promo.promotion_order);
            }
        });
    }, [promotions]);

    const fetchProducts = async (sellerId, slotIndex) => {
        if (!sellerId) return;
        setLoadingProducts(prev => ({ ...prev, [slotIndex]: true }));
        try {
            const res = await axios.get(`/admin/promotions/sellers/${sellerId}/products`);
            setSellerProducts(prev => ({ ...prev, [sellerId]: res.data.products }));
        } catch (error) {
            console.error("Failed to load products for seller", error);
        } finally {
            setLoadingProducts(prev => ({ ...prev, [slotIndex]: false }));
        }
    };

    const handleUpdate = (slotIndex, field, value) => {
        const updated = [...localPromotions];
        const index = updated.findIndex(p => p.promotion_order === slotIndex);
        if (index !== -1) {
            updated[index][field] = value;
            if (field === 'seller_id') {
                updated[index]['product_id'] = ''; // reset product when seller changes
                fetchProducts(value, slotIndex);
            }
        }
        setLocalPromotions(updated);
    };

    const handleSave = (promo) => {
        const payload = {
            seller_id: promo.seller_id,
            product_id: promo.product_id,
            promotion_order: promo.promotion_order,
            is_active: promo.is_active,
            starts_at: promo.starts_at || null,
            ends_at: promo.ends_at || null,
        };

        if (promo.id) {
            router.put(`/admin/promotions/${promo.id}`, payload);
        } else {
            router.post(`/admin/promotions`, payload);
        }
    };

    const handleDelete = (promo) => {
        if (promo.id && confirm("Are you sure you want to remove this promotion?")) {
            router.delete(`/admin/promotions/${promo.id}`);
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    return (
        <>
            <Head title="Homepage Promotions" />
            <AdminLayout title="Homepage Promotions">
                <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 text-blue-800">
                    <AlertCircle className="shrink-0 text-blue-500" />
                    <div>
                        <h3 className="font-semibold">Featured Sellers Promotion Slots</h3>
                        <p className="text-sm mt-1">
                            Select up to 3 sellers and products to feature on the homepage hero section. 
                            If a slot is inactive or expired, it will be skipped. If no slots are active, the homepage will show random featured products.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {localPromotions.map((promo) => {
                        const isExisting = !!promo.id;
                        const products = sellerProducts[promo.seller_id] || [];

                        return (
                            <div key={promo.promotion_order} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <div className="flex items-center gap-2 font-bold text-gray-900">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                                            {promo.promotion_order}
                                        </div>
                                        Slot {promo.promotion_order}
                                    </div>
                                    <label className="flex items-center cursor-pointer gap-2 text-sm font-medium">
                                        <span className={promo.is_active ? 'text-green-600' : 'text-gray-500'}>
                                            {promo.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={promo.is_active}
                                            onChange={(e) => handleUpdate(promo.promotion_order, 'is_active', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className="p-5 flex-1 flex flex-col gap-4">
                                    {/* Seller Select */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Seller</label>
                                        <select 
                                            value={promo.seller_id}
                                            onChange={(e) => handleUpdate(promo.promotion_order, 'seller_id', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                                        >
                                            <option value="">-- Select Seller --</option>
                                            {sellers.map(s => (
                                                <option key={s.id} value={s.id}>{s.business_name} ({s.user_name})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Product Select */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product {loadingProducts[promo.promotion_order] && <span className="text-primary-500 text-xs ml-2 animate-pulse">Loading...</span>}
                                        </label>
                                        <select 
                                            value={promo.product_id}
                                            onChange={(e) => handleUpdate(promo.promotion_order, 'product_id', e.target.value)}
                                            disabled={!promo.seller_id}
                                            className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        >
                                            <option value="">-- Select Product --</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} - {p.price} {p.currency}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Opt)</label>
                                            <input 
                                                type="datetime-local" 
                                                value={promo.starts_at ? formatDateForInput(promo.starts_at) : ''}
                                                onChange={(e) => handleUpdate(promo.promotion_order, 'starts_at', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Opt)</label>
                                            <input 
                                                type="datetime-local" 
                                                value={promo.ends_at ? formatDateForInput(promo.ends_at) : ''}
                                                onChange={(e) => handleUpdate(promo.promotion_order, 'ends_at', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                                    {isExisting && (
                                        <button 
                                            onClick={() => handleDelete(promo)}
                                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                            Clear Slot
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleSave(promo)}
                                        disabled={!promo.seller_id || !promo.product_id}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save size={16} />
                                        {isExisting ? 'Update' : 'Save Slot'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </AdminLayout>
        </>
    );
}
