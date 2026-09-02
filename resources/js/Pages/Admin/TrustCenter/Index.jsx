import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Shield, AlertTriangle, CheckCircle, XCircle,
    Clock, Eye, ChevronRight, FileText, Flag, UserX
} from 'lucide-react';

const STATUS_CONFIG = {
    pending:           { label: 'En attente',          color: 'bg-amber-100 text-amber-700',    icon: Clock },
    investigating:     { label: 'En investigation',    color: 'bg-blue-100 text-blue-700',      icon: Eye },
    resolved:          { label: 'Résolu',              color: 'bg-green-100 text-green-700',    icon: CheckCircle },
    rejected:          { label: 'Rejeté',              color: 'bg-gray-100 text-gray-600',      icon: XCircle },
    seller_suspended:  { label: 'Vendeur Suspendu',    color: 'bg-red-100 text-red-700',        icon: UserX },
};

const CATEGORY_LABELS = {
    'Scam / Fraud':             'Arnaque / Fraude',
    'Fake Product':             'Produit Contrefait',
    'Harassment':               'Harcèlement',
    'Spam':                     'Spam',
    'Misleading Information':   'Informations Trompeuses',
    'Counterfeit Goods':        'Marchandises Contrefaites',
    'Other':                    'Autre',
};

function StatCard({ icon: Icon, value, label, color }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={20} className="sm:hidden" />
                <Icon size={22} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{label}</p>
            </div>
        </div>
    );
}

export default function TrustCenterIndex({ reports, stats }) {
    return (
        <>
            <Head title="Trust & Safety Center" />
            <AdminLayout title="Trust &amp; Safety Center">

                {/* Header */}
                <div className="mb-5 sm:mb-6 flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <Shield size={20} className="text-red-600" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Centre de Confiance &amp; Sécurité</h1>
                        <p className="text-xs sm:text-sm text-gray-500">Gérez les signalements, les investigations et les suspensions.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <StatCard icon={Flag}         value={stats.total_reports} label="Signalements totaux"   color="bg-gray-100 text-gray-600" />
                    <StatCard icon={AlertTriangle} value={stats.open_cases}   label="Cas ouverts"           color="bg-amber-100 text-amber-600" />
                    <StatCard icon={CheckCircle}   value={stats.resolved}     label="Cas résolus"           color="bg-green-100 text-green-600" />
                    <StatCard icon={UserX}         value={stats.suspended}    label="Vendeurs suspendus"    color="bg-red-100 text-red-600" />
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-2">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                            <FileText size={16} className="text-gray-400" />
                            Tous les signalements
                        </h2>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                            {reports.total} total
                        </span>
                    </div>

                    {/* Desktop / tablet cards (md+) */}
                    <div className="hidden md:block divide-y divide-gray-100">
                        {reports.data.length > 0 ? (
                            reports.data.map((report) => {
                                const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                                const StatusIcon = cfg.icon;
                                return (
                                    <div key={report.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors flex items-start gap-4">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0 font-bold text-red-600">
                                            {report.reporter?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {report.reporter?.name || 'Utilisateur inconnu'}
                                                </span>
                                                <span className="text-gray-400 text-xs">→</span>
                                                <span className="font-medium text-primary-700 text-sm">
                                                    {report.reported_seller?.business_name || 'Vendeur inconnu'}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                                                    {CATEGORY_LABELS[report.category] || report.category}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${cfg.color}`}>
                                                    <StatusIcon size={11} />
                                                    {cfg.label}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{report.description}</p>

                                            {report.evidence_files?.length > 0 && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    📎 {report.evidence_files.length} pièce(s) jointe(s)
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span className="text-xs text-gray-400">
                                                {new Date(report.created_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                            <Link
                                                href={`/admin/trust-center/${report.id}`}
                                                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                                            >
                                                Examiner <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-16 text-center">
                                <Shield size={48} className="mx-auto mb-4 text-gray-200" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun signalement</h3>
                                <p className="text-sm text-gray-500">Tout est calme. Aucun signalement reçu pour le moment.</p>
                            </div>
                        )}
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {reports.data.length > 0 ? (
                            reports.data.map((report) => {
                                const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                                const StatusIcon = cfg.icon;
                                return (
                                    <Link
                                        key={report.id}
                                        href={`/admin/trust-center/${report.id}`}
                                        className="block p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center shrink-0 font-bold text-red-600 text-sm">
                                                {report.reporter?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900 text-sm truncate">
                                                    {report.reported_seller?.business_name || 'Vendeur inconnu'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    par {report.reporter?.name || 'Anonyme'}
                                                </p>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                            <span className="text-[11px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                                                {CATEGORY_LABELS[report.category] || report.category}
                                            </span>
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${cfg.color}`}>
                                                <StatusIcon size={10} />
                                                {cfg.label}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-500 line-clamp-2">{report.description}</p>

                                        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                                            <span>{new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                            {report.evidence_files?.length > 0 && (
                                                <span className="text-blue-600">📎 {report.evidence_files.length}</span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="p-12 text-center">
                                <Shield size={48} className="mx-auto mb-4 text-gray-200" />
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Aucun signalement</h3>
                                <p className="text-sm text-gray-500">Tout est calme. Aucun signalement reçu pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {reports.links && (
                    <div className="flex flex-wrap justify-center gap-1 mt-6">
                        {reports.links.map((link, i) => (
                            link.url ? (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => router.get(link.url, {}, { preserveScroll: true })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-lg text-sm text-gray-400"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                )}
            </AdminLayout>
        </>
    );
}