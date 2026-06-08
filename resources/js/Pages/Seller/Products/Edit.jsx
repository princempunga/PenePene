import React, { useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Upload, X, Star } from 'lucide-react';

export default function ProductEdit({ product, categories }) {
    const fileInputRef = useRef(null);
    
    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || '',
        price: product.price || '',
        sale_price: product.sale_price || '',
        initial_stock: product.initial_stock || '',
        condition: product.condition || 'new',
        status: product.status || 'active',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/seller/products/${product.id}`);
    };

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            router.post(`/seller/products/${product.id}/images`, {
                _method: 'post',
                image: e.target.files[0]
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            });
        }
    };

    const handleDeleteImage = (imageId) => {
        if (confirm('Delete this image?')) {
            router.delete(`/seller/images/${imageId}`, {
                preserveScroll: true
            });
        }
    };

    const handleSetPrimary = (imageId) => {
        router.patch(`/seller/images/${imageId}/primary`, {}, {
            preserveScroll: true
        });
    };

    return (
        <>
            <Head title={`Edit ${product.name}`} />
            <SellerLayout title="Edit Product">
                <div className="mb-6 flex justify-between items-center">
                    <Link href="/seller/products" className="text-sm text-gray-500 hover:text-primary-600">← Back to Products</Link>
                    <a href={`/products/${product.slug}`} target="_blank" className="text-sm font-medium text-primary-600 hover:underline">View Public Page ↗</a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main details */}
                    <div className="lg:col-span-2 space-y-6">
                        <form id="edit-form" onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
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
                        </form>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <h2 className="font-bold text-gray-900">Images</h2>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                                >
                                    <Upload size={14} /> Add Image
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            
                            {product.images?.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {product.images.map(img => (
                                        <div key={img.id} className={`relative group rounded-lg overflow-hidden border-2 ${img.is_primary ? 'border-primary-500' : 'border-gray-200'}`}>
                                            <img src={`/storage/${img.image_path}`} alt="" className="w-full h-32 object-cover" />
                                            
                                            {img.is_primary && (
                                                <div className="absolute top-2 left-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                                    Primary
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {!img.is_primary && (
                                                    <button 
                                                        onClick={() => handleSetPrimary(img.id)}
                                                        className="w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-gray-200"
                                                        title="Set as Primary"
                                                    >
                                                        <Star size={14} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteImage(img.id)}
                                                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                                                    title="Delete Image"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-4">No images uploaded.</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar details */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Organization</h2>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select 
                                    value={data.status} 
                                    onChange={e => setData('status', e.target.value)}
                                    form="edit-form"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium"
                                >
                                    <option value="active">Active (Visible)</option>
                                    <option value="inactive">Inactive (Hidden)</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select 
                                    value={data.category_id} 
                                    onChange={e => setData('category_id', e.target.value)}
                                    form="edit-form"
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
                                    form="edit-form"
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
                                    form="edit-form"
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
                                    form="edit-form"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" 
                                />
                                {errors.sale_price && <p className="mt-1 text-xs text-red-600">{errors.sale_price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Initial Stock</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={data.initial_stock} 
                                    onChange={e => setData('initial_stock', e.target.value)} 
                                    form="edit-form"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" 
                                />
                                <p className="text-xs text-gray-500 mt-1">Available: {data.initial_stock - product.confirmed_sales}</p>
                                {errors.initial_stock && <p className="mt-1 text-xs text-red-600">{errors.initial_stock}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="edit-form"
                            disabled={processing}
                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                        >
                            {processing ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </SellerLayout>
        </>
    );
}
