import React, { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Flag, X, Upload, AlertTriangle, Image as ImageIcon, File, Video } from 'lucide-react';

const CATEGORIES = [
    'Scam / Fraud',
    'Fake Product',
    'Harassment',
    'Spam',
    'Misleading Information',
    'Counterfeit Goods',
    'Other',
];

const CATEGORY_LABELS = {
    'Scam / Fraud':           'Arnaque / Fraude',
    'Fake Product':           'Produit Contrefait',
    'Harassment':             'Harcèlement',
    'Spam':                   'Spam',
    'Misleading Information': 'Informations Trompeuses',
    'Counterfeit Goods':      'Marchandises Contrefaites',
    'Other':                  'Autre',
};

function EvidencePreview({ file, onRemove }) {
    const isImage = file.type.startsWith('image');
    const isVideo = file.type.startsWith('video');
    const url = URL.createObjectURL(file);

    return (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            {isImage ? (
                <img src={url} alt="Evidence" className="w-full h-16 object-cover" />
            ) : isVideo ? (
                <div className="w-full h-16 bg-gray-900 flex items-center justify-center">
                    <Video size={20} className="text-white" />
                </div>
            ) : (
                <div className="w-full h-16 flex flex-col items-center justify-center gap-1">
                    <File size={18} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 px-1 truncate w-full text-center">{file.name}</span>
                </div>
            )}
            <button
                type="button"
                onClick={onRemove}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X size={10} />
            </button>
        </div>
    );
}

export default function ReportSellerModal({ sellerId, sellerName, isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        seller_id: sellerId,
        category: '',
        description: '',
        evidence: [],
    });

    const fileInputRef = useRef(null);
    const [previewFiles, setPreviewFiles] = useState([]);

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setData('evidence', files);
        setPreviewFiles(files);
    };

    const removeFile = (i) => {
        const updated = [...data.evidence];
        updated.splice(i, 1);
        setData('evidence', updated);
        setPreviewFiles(prev => {
            const p = [...prev];
            p.splice(i, 1);
            return p;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/buyer/reports', {
            onSuccess: () => {
                reset();
                setPreviewFiles([]);
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <Flag size={16} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Signaler ce vendeur</h3>
                            {sellerName && <p className="text-xs text-gray-500">{sellerName}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Warning */}
                <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                        Les faux signalements peuvent entraîner une suspension de votre compte. Signalez uniquement en cas de problème réel.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Catégorie <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setData('category', cat)}
                                    className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                                        data.category === cat
                                            ? 'border-red-400 bg-red-50 text-red-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    {CATEGORY_LABELS[cat]}
                                </button>
                            ))}
                        </div>
                        {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Décrivez le problème en détail. Incluez les dates, montants et toute information pertinente..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
                            required
                        />
                        {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                    </div>

                    {/* Evidence upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Preuves (optionnel)
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*,.pdf,.doc,.docx"
                            className="hidden"
                            onChange={handleFilesChange}
                        />

                        {previewFiles.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                {previewFiles.map((f, i) => (
                                    <EvidencePreview key={i} file={f} onRemove={() => removeFile(i)} />
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors w-full justify-center"
                        >
                            <Upload size={14} />
                            Ajouter captures d'écran, photos, vidéos ou documents
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.category || !data.description}
                            className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Flag size={14} />
                            {processing ? 'Envoi...' : 'Soumettre le signalement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
