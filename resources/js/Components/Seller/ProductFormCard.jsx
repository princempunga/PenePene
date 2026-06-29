import React from 'react';

const FIELD_LABELS = [
    { key: 'image', label: 'Image' },
    { key: 'name', label: 'Nom du produit' },
    { key: 'description', label: 'Description' },
    { key: 'category_id', label: 'Catégorie' },
    { key: 'subcategory_id', label: 'Sous-catégorie' },
    { key: 'price', label: 'Prix' },
    { key: 'sale_price', label: 'Prix promotionnel (facultatif)' },
    { key: 'initial_stock', label: 'Stock' },
];

export default function ProductFormCard({
    index,
    product,
    categories,
    errors = {},
    onChange,
    onPublish,
    publishing = false,
    published = false,
}) {
    const selectedCategory = categories.find((cat) => String(cat.id) === String(product.category_id));
    const subcategories = selectedCategory?.subcategories || [];

    const fieldError = (field) => errors[`products.${index}.${field}`] || errors[field];

    const update = (field, value) => {
        onChange(index, { ...product, [field]: value });
    };

    const handleCategoryChange = (categoryId) => {
        onChange(index, {
            ...product,
            category_id: categoryId,
            subcategory_id: '',
        });
    };

    if (published) {
        return (
            <div className="bg-green-50 rounded-xl border border-green-200 p-5 flex items-center gap-4">
                {product.preview && (
                    <img src={product.preview} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                )}
                <div>
                    <p className="font-semibold text-green-800">{product.name || `Produit ${index + 1}`}</p>
                    <p className="text-sm text-green-600">Publié avec succès</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Produit {index + 1}</span>
            </div>

            <div className="p-5 space-y-5">
                {/* 1. Image */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        <span className="text-primary-600 mr-1.5">1.</span>
                        Image
                    </label>
                    <div className="w-full max-w-xs aspect-square rounded-xl overflow-hidden border-2 border-primary-500 bg-gray-100">
                        {product.preview ? (
                            <img
                                src={product.preview}
                                alt={`Produit ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                Aucune image
                            </div>
                        )}
                    </div>
                    {fieldError('image') && (
                        <p className="mt-1 text-xs text-red-600">{fieldError('image')}</p>
                    )}
                </div>

                {/* 2. Nom du produit */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                        <span className="text-primary-600 mr-1.5">2.</span>
                        Nom du produit
                    </label>
                    <input
                        type="text"
                        value={product.name}
                        onChange={(e) => update('name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Ex : iPhone 14 Pro Max"
                    />
                    {fieldError('name') && <p className="mt-1 text-xs text-red-600">{fieldError('name')}</p>}
                </div>

                {/* 3. Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                        <span className="text-primary-600 mr-1.5">3.</span>
                        Description
                    </label>
                    <textarea
                        value={product.description}
                        onChange={(e) => update('description', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none resize-y"
                        placeholder="Décrivez votre produit"
                    />
                    {fieldError('description') && (
                        <p className="mt-1 text-xs text-red-600">{fieldError('description')}</p>
                    )}
                </div>

                {/* 4. Catégorie */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                        <span className="text-primary-600 mr-1.5">4.</span>
                        Catégorie
                    </label>
                    <select
                        value={product.category_id}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                    >
                        <option value="">Choisir une catégorie</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {fieldError('category_id') && (
                        <p className="mt-1 text-xs text-red-600">{fieldError('category_id')}</p>
                    )}
                </div>

                {/* 5. Sous-catégorie */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                        <span className="text-primary-600 mr-1.5">5.</span>
                        Sous-catégorie
                        {subcategories.length === 0 && (
                            <span className="font-normal text-gray-400 ml-1">(si applicable)</span>
                        )}
                    </label>
                    <select
                        value={product.subcategory_id}
                        onChange={(e) => update('subcategory_id', e.target.value)}
                        disabled={subcategories.length === 0}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        <option value="">
                            {subcategories.length > 0 ? 'Choisir une sous-catégorie' : 'Aucune sous-catégorie'}
                        </option>
                        {subcategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                    </select>
                    {fieldError('subcategory_id') && (
                        <p className="mt-1 text-xs text-red-600">{fieldError('subcategory_id')}</p>
                    )}
                </div>

                {/* 6. Prix */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                        <span className="text-primary-600 mr-1.5">6.</span>
                        Prix (CDF)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => update('price', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none sm:max-w-xs"
                    />
                    {fieldError('price') && <p className="mt-1 text-xs text-red-600">{fieldError('price')}</p>}
                </div>

                {/* 7. Prix promotionnel (facultatif) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                        <span className="text-primary-600 mr-1.5">7.</span>
                        Prix promotionnel (facultatif)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.sale_price}
                        onChange={(e) => update('sale_price', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none sm:max-w-xs"
                        placeholder="Laisser vide si pas de promotion"
                    />
                    {fieldError('sale_price') && (
                        <p className="mt-1 text-xs text-red-600">{fieldError('sale_price')}</p>
                    )}
                </div>

                {/* 8. Stock */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                        <span className="text-primary-600 mr-1.5">8.</span>
                        Stock
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={product.initial_stock}
                        onChange={(e) => update('initial_stock', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none sm:max-w-xs"
                    />
                    {fieldError('initial_stock') && (
                        <p className="mt-1 text-xs text-red-600">{fieldError('initial_stock')}</p>
                    )}
                </div>

                {/* 9. Publier */}
                <div className="pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => onPublish(index)}
                        disabled={publishing}
                        className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        {publishing ? 'Publication…' : 'Publier'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Export labels for reference in parent
export { FIELD_LABELS };
