import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Shield, AlertTriangle, CheckCircle, XCircle,
    Clock, Eye, Flag, UserX, User, ExternalLink,
    FileText, ChevronLeft, Image as ImageIcon, FileVideo, File,
    ThumbsDown, Zap, ArrowRight
} from 'lucide-react';

const STATUS_CONFIG = {
    pending:          { label: 'En attente',        color: 'bg-amber-100 text-amber-700',  icon: Clock },
    investigating:    { label: 'En investigation',  color: 'bg-blue-100 text-blue-700',    icon: Eye },
    resolved:         { label: 'Résolu',            color: 'bg-green-100 text-green-700',  icon: CheckCircle },
    rejected:         { label: 'Rejeté',            color: 'bg-gray-100 text-gray-600',    icon: XCircle },
    seller_suspended: { label: 'Vendeur Suspendu',  color: 'bg-red-100 text-red-700',      icon: UserX },
};

const CATEGORY_LABELS = {
    'Scam / Fraud': 'Arnaque / Fraude',
    'Fake Product': 'Produit Contrefait',
    'Harassment': 'Harcèlement',
    'Spam': 'Spam',
    'Misleading Information': 'Informations Trompeuses',
    'Counterfeit Goods': 'Marchandises Contrefaites',
    'Other': 'Autre',
};

function EvidenceFile({ path }) {
    const name = path.split('/').pop();
    const ext = name.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    const isVideo = ['mp4', 'mov', 'avi'].includes(ext);

    if (isImage) {
        return (
            <a href={`/storage/${path}`} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-gray-200 hover:border-primary-400 transition-colors group">
                <img src={`/storage/${path}`} alt="Evidence" className="w-full h-24 object-cover group-hover:opacity-90 transition-opacity" />
                <div className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-50">
                    <ImageIcon size={11} /> Photo
                </div>
            </a>
        );
    }
    if (isVideo) {
        return (
            <a href={`/storage/${path}`} target="_blank" rel="noreferrer" className="block rounded-lg border border-gray-200 p-3 hover:border-primary-400 transition-colors flex items-center gap-2 text-sm text-blue-600">
                <FileVideo size={18} className="shrink-0" />
                <span className="truncate">{name}</span>
            </a>
        );
    }
    return (
        <a href={`/storage/${path}`} target="_blank" rel="noreferrer" className="block rounded-lg border border-gray-200 p-3 hover:border-primary-400 transition-colors flex items-center gap-2 text-sm text-blue-600">
            <File size={18} className="shrink-0" />
            <span className="truncate">{name}</span>
        </a>
    );
}

function StrikeIndicator({ count }) {
    return (
        <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((n) => (
                <div
                    key={n}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        n <= count
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                    }`}
                >
                    {n}
                </div>
            ))}
            <span className="text-xs text-gray-500 ml-1">
                {count === 0 ? 'Aucun strike' : count === 1 ? 'Avertissement' : count === 2 ? 'Suspension temp.' : 'Banni'}
            </span>
        </div>
    );
}

export default function TrustCenterShow({ report }) {
    const { flash } = usePage().props;
    const seller = report.reported_seller;

    const { data, setData, put, processing } = useForm({
        status: report.status,
        admin_notes: report.admin_notes || '',
    });

    const { post: issueStrike, processing: striking } = useForm({});

    const handleUpdateStatus = (e) => {
        e.preventDefault();
        put(`/admin/trust-center/${report.id}`);
    };

    const handleIssueStrike = () => {
        if (confirm(`Émettre un strike contre ${seller?.business_name}? Ceci est irréversible.`)) {
            issueStrike(`/admin/trust-center/sellers/${seller?.id}/strike`);
        }
    };

    const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;

    return (
        <>
            <Head title={`Signalement #${report.id}`} />
            <AdminLayout title="Détails du Signalement">
                {/* Back */}
                <div className="mb-5">
                    <Link href="/admin/trust-center" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        <ChevronLeft size={16} /> Retour au Trust Center
                    </Link>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-5 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        ✅ {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* === MAIN COLUMN === */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Report Header */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">
                                        Signalement #{report.id}
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Soumis le {new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.color}`}>
                                    <StatusIcon size={13} />
                                    {cfg.label}
                                </span>
                            </div>

                            {/* Reporter → Seller */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                                        {report.reporter?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Signalé par</p>
                                        <p className="text-sm font-semibold text-gray-800">{report.reporter?.name || 'Anonyme'}</p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-sm">
                                        {seller?.business_name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Signalement contre</p>
                                        <p className="text-sm font-semibold text-gray-800">{seller?.business_name || 'Vendeur inconnu'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="mt-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Catégorie</p>
                                <span className="text-sm px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                                    {CATEGORY_LABELS[report.category] || report.category}
                                </span>
                            </div>

                            {/* Description */}
                            <div className="mt-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap leading-relaxed">
                                    {report.description}
                                </p>
                            </div>
                        </div>

                        {/* Evidence */}
                        {report.evidence_files?.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-gray-400" />
                                    Preuves ({report.evidence_files.length})
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {report.evidence_files.map((file, i) => (
                                        <EvidenceFile key={i} path={file} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Previous Reports on Same Seller */}
                        {seller?.reports?.length > 1 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                                <h2 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    Signalements précédents ({seller.reports.length - 1} autre(s))
                                </h2>
                                <div className="space-y-2">
                                    {seller.reports.filter(r => r.id !== report.id).slice(0, 5).map(r => {
                                        const rCfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                                        return (
                                            <Link
                                                key={r.id}
                                                href={`/admin/trust-center/${r.id}`}
                                                className="flex items-center justify-between text-sm bg-white px-3 py-2 rounded-lg border border-amber-100 hover:border-primary-300 transition-colors"
                                            >
                                                <span className="text-gray-600">#{r.id} — {CATEGORY_LABELS[r.category] || r.category}</span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rCfg.color}`}>{rCfg.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* === SIDEBAR === */}
                    <div className="space-y-5">

                        {/* Update Status Form */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={16} className="text-gray-400" />
                                Mise à jour du statut
                            </h2>
                            <form onSubmit={handleUpdateStatus} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                    >
                                        {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Notes internes</label>
                                    <textarea
                                        rows={4}
                                        value={data.admin_notes}
                                        onChange={e => setData('admin_notes', e.target.value)}
                                        placeholder="Observations, preuves trouvées, décision..."
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Mise à jour...' : 'Enregistrer'}
                                </button>
                            </form>
                        </div>

                        {/* Seller Info Card */}
                        {seller && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User size={16} className="text-gray-400" />
                                    Vendeur signalé
                                </h2>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center font-bold text-white text-lg">
                                        {seller.business_name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{seller.business_name}</p>
                                        <p className="text-xs text-gray-400">{seller.user?.email || 'Email non disponible'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Note moyenne</span>
                                        <span className="font-semibold">⭐ {seller.average_rating || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Nombre d'avis</span>
                                        <span className="font-semibold">{seller.total_reviews || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Statut du compte</span>
                                        <span className={`font-semibold capitalize px-2 py-0.5 rounded-full text-xs ${seller.status === 'verified' ? 'bg-green-100 text-green-700' : seller.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {seller.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1.5">Strikes</p>
                                        <StrikeIndicator count={seller.strikes || 0} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <Link
                                        href={`/admin/sellers/${seller.slug}`}
                                        className="text-xs text-center text-primary-600 hover:text-primary-800 font-medium flex items-center justify-center gap-1 py-2 bg-primary-50 rounded-lg transition-colors"
                                    >
                                        Voir le profil <ExternalLink size={12} />
                                    </Link>
                                    <button
                                        onClick={handleIssueStrike}
                                        disabled={striking || seller.status === 'suspended'}
                                        className="text-xs text-center text-red-600 hover:text-red-800 font-medium flex items-center justify-center gap-1 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Zap size={12} /> Émettre un Strike
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Admin Resolution Info */}
                        {report.resolved_at && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-xs font-semibold text-green-700 mb-1">✅ Résolu</p>
                                <p className="text-xs text-green-600">
                                    Le {new Date(report.resolved_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    {report.resolved_by_admin && ` par ${report.resolved_by_admin.name}`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
