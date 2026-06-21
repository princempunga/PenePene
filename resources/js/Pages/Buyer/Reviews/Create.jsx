import React, { useState, useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { Star, CheckCircle, Upload, X, Image as ImageIcon, Video } from 'lucide-react';

function StarPicker({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    const display = hovered || value;
    const labels = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bon', 'Excellent'];

    return (
        <div>
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange(n)}
                        onMouseEnter={() => setHovered(n)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110 active:scale-95"
                    >
                        <Star
                            size={36}
                            className={`transition-colors ${n <= display ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                        />
                    </button>
                ))}
                {display > 0 && (
                    <span className="text-sm font-medium text-amber-600 ml-1">{labels[display]}</span>
                )}
            </div>
        </div>
    );
}

export default function ReviewCreate({ conversation }) {
    const { flash, errors } = usePage().props;
    const seller = conversation.seller;
    const product = conversation.product;

    const { data, setData, post, processing } = useForm({
        rating: 0,
        title: '',
        comment: '',
        media: [],
    });

    const fileInputRef = useRef(null);
    const [previewFiles, setPreviewFiles] = useState([]);

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        setData('media', files);
        setPreviewFiles(files.map(f => ({
            name: f.name,
            url: URL.createObjectURL(f),
            type: f.type.startsWith('video') ? 'video' : 'image',
        })));
    };

    const removeFile = (i) => {
        const updated = [...(data.media || [])];
        updated.splice(i, 1);
        setData('media', updated);
        setPreviewFiles(prev => {
            const p = [...prev];
            p.splice(i, 1);
            return p;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/buyer/conversations/${conversation.id}/review`);
    };

    return (
        <>
            <Head title="Laisser un avis" />
            <BuyerLayout>
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Laisser un avis</h1>
                        <p className="text-gray-500 mt-1">Partagez votre expérience avec cette transaction.</p>
                    </div>

                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium flex items-center gap-2">
                            <CheckCircle size={16} /> {flash.success}
                        </div>
                    )}

                    {/* Seller / Product Info Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shrink-0">
                            {seller?.business_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{seller?.business_name}</p>
                            {product?.name && (
                                <p className="text-sm text-gray-500 mt-0.5">Produit : {product.name}</p>
                            )}
                            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                <CheckCircle size={10} />
                                Interaction vérifiée
                            </span>
                        </div>
                    </div>

                    {/* Review Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Note globale <span className="text-red-500">*</span>
                            </label>
                            <StarPicker value={data.rating} onChange={(v) => setData('rating', v)} />
                            {errors.rating && <p className="text-xs text-red-600 mt-1">{errors.rating}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Titre (optionnel)</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                placeholder="Résumé de votre expérience"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Commentaire (optionnel)</label>
                            <textarea
                                rows={4}
                                value={data.comment}
                                onChange={e => setData('comment', e.target.value)}
                                placeholder="Décrivez votre expérience avec ce vendeur et ce produit..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            />
                        </div>

                        {/* Media upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Photos / Vidéos (optionnel)
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={handleMediaChange}
                            />

                            {previewFiles.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {previewFiles.map((f, i) => (
                                        <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200">
                                            {f.type === 'image' ? (
                                                <img src={f.url} alt="" className="w-full h-20 object-cover" />
                                            ) : (
                                                <div className="w-full h-20 bg-gray-900 flex items-center justify-center">
                                                    <Video size={24} className="text-white" />
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center"
                            >
                                <Upload size={16} />
                                Ajouter des photos ou vidéos
                            </button>
                        </div>

                        {/* Submit */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="submit"
                                disabled={processing || data.rating === 0}
                                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Envoi en cours...' : 'Publier mon avis'}
                            </button>
                        </div>
                    </form>
                </div>
            </BuyerLayout>
        </>
    );
}
