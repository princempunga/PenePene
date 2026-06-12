import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Upload, X } from 'lucide-react';

export default function ProductCreate({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        category_id: '',
        subcategory_id: '',
        price: '',
        sale_price: '',
        initial_stock: '',
        images: [],
    });

    const [previews, setPreviews] = useState([]);

    const selectedCategory = categories.find((cat) => String(cat.id) === String(data.category_id));
    const subcategories = selectedCategory?.subcategories || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/seller/products', { forceFormData: true });
    };

    const handleFileChange = (e) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        setData('images', files);

        previews.forEach((url) => URL.revokeObjectURL(url));
        setPreviews(files.map((file) => URL.createObjectURL(file)));
    };

    const removeImage = (index) => {
        const newFiles = data.images.filter((_, i) => i !== index);
        setData('images', newFiles);

        URL.revokeObjectURL(previews[index]);
        setPreviews(previews.filter((_, i) => i !== index));
    };

    return (
        <>
            <Head title="Ajouter un produit" />
            <SellerLayout title="Nouveau produit">
                <div className="mb-6">
                    <Link href="/seller/products" className="text-sm text-gray-500 hover:text-primary-600">← Retour aux produits</Link>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Informations de base</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={5}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none resize-y"
                                />
                                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Images</h2>
                            <p className="text-sm text-gray-500">Téléchargez des images du produit (2 Mo max chacune). La première image sera l'image principale.</p>

                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <Upload size={24} className="text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600 font-medium">Cliquez pour télécharger des images</span>
                                <span className="text-xs text-gray-400 mt-1">PNG, JPG — 2 Mo maximum</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            {errors['images.0'] && <p className="text-xs text-red-600">{errors['images.0']}</p>}
                            {errors.images && <p className="text-xs text-red-600">{errors.images}</p>}

                            {previews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {previews.map((src, index) => (
                                        <div key={src} className={`relative rounded-lg overflow-hidden border-2 ${index === 0 ? 'border-primary-500' : 'border-gray-200'}`}>
                                            <img src={src} alt="" className="w-full h-28 object-cover" />
                                            {index === 0 && (
                                                <span className="absolute top-2 left-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                                    Principale
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Organisation</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => {
                                        setData({
                                            ...data,
                                            category_id: e.target.value,
                                            subcategory_id: '',
                                        });
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                >
                                    <option value="">Choisir une catégorie</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>}
                            </div>

                            {subcategories.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sous-catégorie</label>
                                    <select
                                        value={data.subcategory_id}
                                        onChange={(e) => setData('subcategory_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                    >
                                        <option value="">Choisir une sous-catégorie (facultatif)</option>
                                        {subcategories.map((sub) => (
                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                        ))}
                                    </select>
                                    {errors.subcategory_id && <p className="mt-1 text-xs text-red-600">{errors.subcategory_id}</p>}
                                </div>
                            )}

                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
                                Les nouveaux produits sont soumis à validation et apparaîtront comme <strong>En attente</strong> jusqu'à leur approbation.
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Prix et stock</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (CDF)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix promotionnel (facultatif)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.sale_price}
                                    onChange={(e) => setData('sale_price', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                {errors.sale_price && <p className="mt-1 text-xs text-red-600">{errors.sale_price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.initial_stock}
                                    onChange={(e) => setData('initial_stock', e.target.value)}
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
                            {processing ? 'Enregistrement...' : 'Enregistrer le produit'}
                        </button>
                    </div>
                </form>
            </SellerLayout>
        </>
    );
}
