import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';

export default function ProductCreate({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        category_id: '',
        price: '',
        sale_price: '',
        initial_stock: '',
        condition: 'new',
        images: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/seller/products');
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setData('images', Array.from(e.target.files));
        }
    };

    return (
        <>
            <Head title="Add Product" />
            <SellerLayout title="Add New Product">
                <div className="mb-6">
                    <Link href="/seller/products" className="text-sm text-gray-500 hover:text-primary-600">← Back to Products</Link>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Basic Information</h2>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" 
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)} 
                                    rows={5}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none resize-y" 
                                ></textarea>
                                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Images</h2>
                            <p className="text-sm text-gray-500 mb-2">Upload product images (max 2MB each). The first image will be the primary one.</p>
                            
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none"
                            />
                            {errors.images && <p className="mt-1 text-xs text-red-600">{errors.images}</p>}
                            
                            {data.images.length > 0 && (
                                <p className="text-sm text-green-600 font-medium">{data.images.length} file(s) selected</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar details */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Organization</h2>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select 
                                    value={data.category_id} 
                                    onChange={e => setData('category_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <optgroup key={cat.id} label={cat.name}>
                                            <option value={cat.id}>{cat.name}</option>
                                            {cat.children?.map(child => (
                                                <option key={child.id} value={child.id}>-- {child.name}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                {errors.category_id && <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                <select 
                                    value={data.condition} 
                                    onChange={e => setData('condition', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                >
                                    <option value="new">New</option>
                                    <option value="refurbished">Refurbished</option>
                                    <option value="used">Used</option>
                                </select>
                                {errors.condition && <p className="mt-1 text-xs text-red-600">{errors.condition}</p>}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Pricing & Stock</h2>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (TZS)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={data.price} 
                                    onChange={e => setData('price', e.target.value)} 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" 
                                />
                                {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (Optional)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={data.sale_price} 
                                    onChange={e => setData('sale_price', e.target.value)} 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" 
                                />
                                {errors.sale_price && <p className="mt-1 text-xs text-red-600">{errors.sale_price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={data.initial_stock} 
                                    onChange={e => setData('initial_stock', e.target.value)} 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" 
                                />
                                {errors.initial_stock && <p className="mt-1 text-xs text-red-600">{errors.initial_stock}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                        >
                            {processing ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </SellerLayout>
        </>
    );
}
