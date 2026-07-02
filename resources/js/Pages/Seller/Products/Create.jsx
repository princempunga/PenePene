import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import ProductFormCard from '@/Components/Seller/ProductFormCard';
import { Upload, X, ChevronRight, ChevronLeft, ImageIcon, Check, Package, Send } from 'lucide-react';

function productFromFile(file) {
    return {
        id: crypto.randomUUID(),
        image: file,
        preview: URL.createObjectURL(file),
        name: '',
        description: '',
        category_id: '',
        subcategory_id: '',
        price: '',
        sale_price: '',
        initial_stock: '',
        published: false,
    };
}

function buildSingleProductFormData(product, csrf) {
    const formData = new FormData();
    if (csrf) formData.append('_token', csrf);
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('category_id', product.category_id);
    if (product.subcategory_id) {
        formData.append('subcategory_id', product.subcategory_id);
    }
    formData.append('price', product.price);
    if (product.sale_price) {
        formData.append('sale_price', product.sale_price);
    }
    formData.append('initial_stock', product.initial_stock);
    if (product.image) {
        formData.append('images[0]', product.image);
    }
    return formData;
}

function buildBulkFormData(products, csrf) {
    const formData = new FormData();
    if (csrf) formData.append('_token', csrf);

    products.forEach((product, index) => {
        formData.append(`products[${index}][name]`, product.name);
        formData.append(`products[${index}][description]`, product.description);
        formData.append(`products[${index}][category_id]`, product.category_id);
        if (product.subcategory_id) {
            formData.append(`products[${index}][subcategory_id]`, product.subcategory_id);
        }
        formData.append(`products[${index}][price]`, product.price);
        if (product.sale_price) {
            formData.append(`products[${index}][sale_price]`, product.sale_price);
        }
        formData.append(`products[${index}][initial_stock]`, product.initial_stock);
        if (product.image) {
            formData.append(`products[${index}][image]`, product.image);
        }
    });

    return formData;
}

export default function ProductCreate({ categories }) {
    const { errors: pageErrors } = usePage().props;
    const [step, setStep] = useState(1);
    const [products, setProducts] = useState([]);
    const [publishingAll, setPublishingAll] = useState(false);

    const errors = pageErrors || {};
    const csrf = typeof document !== 'undefined'
        ? document.head.querySelector('meta[name="csrf-token"]')?.content
        : null;

    const pendingProducts = products.filter((p) => !p.published);

    const handlePhotosUpload = (e) => {
        if (!e.target.files?.length) return;
        const newFiles = Array.from(e.target.files);
        setProducts((prev) => [...prev, ...newFiles.map(productFromFile)]);
        e.target.value = '';
    };

    const removePhoto = (index) => {
        const removed = products[index];
        if (removed?.preview) URL.revokeObjectURL(removed.preview);
        setProducts((prev) => prev.filter((_, i) => i !== index));
    };

    const updateProduct = (index, updated) => {
        setProducts((prev) => prev.map((p, i) => (i === index ? updated : p)));
    };


    const handlePublishAll = (e) => {
        e.preventDefault();
        const toPublish = products.filter((p) => !p.published);
        if (toPublish.length === 0) return;

        setPublishingAll(true);

        router.post('/seller/products/bulk', buildBulkFormData(toPublish, csrf), {
            forceFormData: true,
            onFinish: () => setPublishingAll(false),
        });
    };

    return (
        <>
            <Head title="Publier des produits" />
            <SellerLayout title="Publier des produits">
                <div className="mb-6">
                    <Link href="/seller/products" className="text-sm text-gray-500 hover:text-primary-600">
                        ← Retour aux produits
                    </Link>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2 mb-8 max-w-md">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-700' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                            step > 1 ? 'bg-primary-600 border-primary-600 text-white' : step === 1 ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-300'
                        }`}>
                            {step > 1 ? <Check size={16} /> : '1'}
                        </div>
                        <span className="text-sm font-medium">Photos</span>
                    </div>
                    <div className={`flex-1 h-0.5 ${step > 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-700' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                            step === 2 ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-400'
                        }`}>
                            2
                        </div>
                        <span className="text-sm font-medium">Informations & publication</span>
                    </div>
                </div>

                {step === 1 && (
                    <div className="max-w-3xl space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-start gap-3 mb-5">
                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                                    <ImageIcon size={20} className="text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">Étape 1 — Ajoutez vos photos</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        1 photo = 1 produit. Ensuite vous renseignerez pour chaque photo :
                                        nom, description, catégorie, sous-catégorie, prix, prix promo et stock.
                                    </p>
                                </div>
                            </div>

                            <label className="flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-primary-400 transition-colors mb-5">
                                <Upload size={32} className="text-gray-400 mb-2" />
                                <span className="text-sm text-gray-700 font-medium">Cliquez pour ajouter des photos</span>
                                <span className="text-xs text-gray-400 mt-1">PNG, JPG · 1 Go max par photo</span>
                                <input type="file" multiple accept="image/*" onChange={handlePhotosUpload} className="hidden" />
                            </label>

                            {products.length > 0 && (
                                <>
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                        {products.length} photo{products.length > 1 ? 's' : ''} sélectionnée{products.length > 1 ? 's' : ''}
                                    </p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {products.map((product, index) => (
                                            <div key={product.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group">
                                                <img src={product.preview} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold text-center py-1">
                                                    Produit {index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(index)}
                                                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-primary-400 transition-colors">
                                            <Upload size={20} className="text-gray-400 mb-1" />
                                            <span className="text-[10px] text-gray-500">Ajouter</span>
                                            <input type="file" multiple accept="image/*" onChange={handlePhotosUpload} className="hidden" />
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={products.length === 0}
                            onClick={() => setStep(2)}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-colors"
                        >
                            Continuer — {products.length} produit{products.length > 1 ? 's' : ''}
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="max-w-5xl space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-800">
                                <Package size={16} />
                                {pendingProducts.length} produit{pendingProducts.length > 1 ? 's' : ''} à compléter
                            </span>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-primary-700 hover:text-primary-900 font-medium"
                            >
                                Modifier les photos
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                            Pour chaque produit, remplissez :{' '}
                            <strong>Nom → Description → Catégorie → Sous-catégorie → Prix → Prix promotionnel → Stock</strong>.
                            Ensuite cliquez sur <strong>Publier</strong> en bas pour tout envoyer d&apos;un coup.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {products.map((product, index) => (
                                <ProductFormCard
                                    key={product.id}
                                    index={index}
                                    product={product}
                                    categories={categories}
                                    errors={errors}
                                    onChange={updateProduct}
                                    published={product.published}
                                />
                            ))}
                        </div>

                        {pendingProducts.length > 0 && (
                            <form onSubmit={handlePublishAll}>
                                <button
                                    type="submit"
                                    id="btn-publier-tout"
                                    disabled={publishingAll}
                                    className="w-full flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl text-lg shadow-lg shadow-primary-200 transition-all duration-200 hover:shadow-xl hover:shadow-primary-300 hover:-translate-y-0.5"
                                >
                                    {publishingAll ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Publication en cours…
                                        </>
                                    ) : (
                                        <>
                                            <Send size={22} />
                                            Publier {pendingProducts.length > 1 ? `les ${pendingProducts.length} produits` : 'le produit'}
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                            <ChevronLeft size={16} />
                            Retour aux photos
                        </button>
                    </div>
                )}
            </SellerLayout>
        </>
    );
}
