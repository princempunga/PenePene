import React, { useRef } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Upload, X, Star } from 'lucide-react';

const statusColors = {
    pending:  'bg-amber-100 text-amber-800',
    active:   'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
};

const statusLabels = {
    pending:  'En attente',
    active:   'Actif',
    inactive: 'Inactif',
    rejected: 'Rejeté',
};

export default function ProductEdit({ product, categories }) {
    const { flash } = usePage().props;
    const fileInputRef = useRef(null);
    const canEditStatus = ['active', 'inactive'].includes(product.status);

    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || '',
        subcategory_id: product.subcategory_id || '',
        price: product.price || '',
        sale_price: product.sale_price || '',
        initial_stock: product.initial_stock || '',
        status: product.status === 'inactive' ? 'inactive' : 'active',
    });

    const selectedCategory = categories.find((cat) => String(cat.id) === String(data.category_id));
    const subcategories = selectedCategory?.subcategories || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/seller/products/${product.id}`);
    };

    const handleImageUpload = (e) => {
        if (!e.target.files?.length) return;

        const files = Array.from(e.target.files);
        router.post(`/seller/products/${product.id}/images`, {
            images: files,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const handleDeleteImage = (imageId) => {
        if (confirm('Supprimer cette image ?')) {
            router.delete(`/seller/images/${imageId}`, { preserveScroll: true });
        }
    };

    const handleSetPrimary = (imageId) => {
        router.patch(`/seller/images/${imageId}/primary`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title={`Modifier ${product.name}`} />
            <SellerLayout title="Modifier le produit">
                <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
                    <Link href={`/seller/products/${product.id}`} className="text-sm text-gray-500 hover:text-primary-600">← Retour au produit</Link>
                    {product.status === 'active' && (
                        <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary-600 hover:underline">
                            Voir la page publique ↗
                        </a>
                    )}
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <form id="edit-form" onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
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
                        </form>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <div>
                                    <h2 className="font-bold text-gray-900">Images</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Nombre illimité — 1 Go max par image</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                                >
                                    <Upload size={14} /> Ajouter des images
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                            </div>

                            {product.images?.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {product.images.map((img) => (
                                        <div key={img.id} className={`relative group rounded-lg overflow-hidden border-2 ${img.is_primary ? 'border-primary-500' : 'border-gray-200'}`}>
                                            <img src={`/storage/${img.image_path}`} alt="" className="w-full h-32 object-cover" />

                                            {img.is_primary && (
                                                <div className="absolute top-2 left-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                                    Principale
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {!img.is_primary && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrimary(img.id)}
                                                        className="w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-gray-200"
                                                        title="Définir comme principale"
                                                    >
                                                        <Star size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteImage(img.id)}
                                                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                                                    title="Supprimer l'image"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-4">Aucune image téléchargée.</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Organisation</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Statut de l'annonce</label>
                                {canEditStatus ? (
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        form="edit-form"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium"
                                    >
                                        <option value="active">Actif (visible)</option>
                                        <option value="inactive">Inactif (masqué)</option>
                                    </select>
                                ) : (
                                    <div>
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {statusLabels[product.status] || product.status}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {product.status === 'pending' && 'Votre produit est en attente d\'approbation par l\'administrateur.'}
                                            {product.status === 'rejected' && 'Ce produit a été rejeté. Contactez le support pour plus de détails.'}
                                        </p>
                                    </div>
                                )}
                                {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
                            </div>

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
                                    form="edit-form"
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
                                        form="edit-form"
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
                                    form="edit-form"
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
                                    form="edit-form"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                {errors.sale_price && <p className="mt-1 text-xs text-red-600">{errors.sale_price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial total</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.initial_stock}
                                    onChange={(e) => setData('initial_stock', e.target.value)}
                                    form="edit-form"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Disponible : {Math.max(0, data.initial_stock - product.confirmed_sales)}
                                </p>
                                {errors.initial_stock && <p className="mt-1 text-xs text-red-600">{errors.initial_stock}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="edit-form"
                            disabled={processing}
                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                        >
                            {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </div>
            </SellerLayout>
        </>
    );
}
