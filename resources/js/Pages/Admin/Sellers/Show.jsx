import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Store, User, MapPin, FileText, CheckCircle, XCircle, FileWarning,
    Package, Eye, BarChart3, ShieldAlert, Award, Clock, Power,
} from 'lucide-react';

const statusConfig = {
    pending:   { label: 'En attente',    color: 'bg-amber-100 text-amber-800',  icon: Clock },
    active:    { label: 'Actif',         color: 'bg-green-100 text-green-800',  icon: Award },
    verified:  { label: 'Actif',         color: 'bg-green-100 text-green-800',  icon: Award },
    rejected:  { label: 'Rejeté',        color: 'bg-red-100 text-red-800',      icon: XCircle },
    suspended: { label: 'Suspendu',      color: 'bg-gray-100 text-gray-800',    icon: ShieldAlert },
    blocked:   { label: 'Bloqué',        color: 'bg-red-200 text-red-900',      icon: ShieldAlert },
};

const productStatusConfig = {
    pending:  { label: 'En attente',    color: 'bg-amber-100 text-amber-800',  icon: Clock },
    active:   { label: 'Actif',         color: 'bg-green-100 text-green-800',  icon: Award },
    inactive: { label: 'Inactif',       color: 'bg-gray-100 text-gray-800',    icon: Package },
    rejected: { label: 'Rejeté',        color: 'bg-red-100 text-red-800',      icon: XCircle },
    blocked:  { label: 'Bloqué',        color: 'bg-red-200 text-red-900',      icon: ShieldAlert },
};

export default function SellerShow({ seller }) {
    const { flash } = usePage().props;
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [processingProductId, setProcessingProductId] = useState(null);

    const verifyForm = useForm({});
    const rejectForm = useForm({ reason: '' });
    const statusForm = useForm({ status: seller.status });

    const handleVerify = () => {
        if (confirm('Êtes-vous sûr de vouloir vérifier ce vendeur et mettre son magasin en ligne ?')) {
            verifyForm.patch(`/admin/sellers/${seller.slug}/verify`);
        }
    };

    const handleReject = (e) => {
        e.preventDefault();
        rejectForm.patch(`/admin/sellers/${seller.slug}/reject`, {
            onSuccess: () => setShowRejectModal(false),
        });
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        statusForm.setData('status', newStatus);
        if (confirm(`Changer le statut du vendeur en ${newStatus} ?`)) {
            statusForm.patch(`/admin/sellers/${seller.slug}/status`);
        }
    };

    const handleBlockProduct = (productId) => {
        const reason = prompt('Raison du blocage :', 'vente de produit illégal');
        if (!reason) return;
        setProcessingProductId(productId);
        router.patch(`/admin/products/${productId}/block`, { reason }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setProcessingProductId(null),
        });
    };

    const handleUnblockProduct = (productId) => {
        if (!confirm('Débloquer ce produit ?')) return;
        setProcessingProductId(productId);
        router.patch(`/admin/products/${productId}/unblock`, {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setProcessingProductId(null),
        });
    };

    const SellerStatusIcon = statusConfig[seller.status]?.icon || Clock;

    return (
        <>
            <Head title={`Fiche – ${seller.business_name}`} />
            <AdminLayout title="Détails Vendeur">

                {/* ── Back + Actions Bar ── */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
                    <Link href="/admin/sellers" className="text-sm text-gray-500 hover:text-slate-800 flex items-center gap-1.5">
                        ← Retour aux vendeurs
                    </Link>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            seller.status === 'verified' || seller.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : seller.status === 'suspended'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                            <SellerStatusIcon size={12} />
                            {seller.status}
                        </span>
                        <Link
                            href={`/admin/sellers/${seller.slug}/statistics`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors"
                        >
                            <BarChart3 size={14} /> Statistiques
                        </Link>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Store Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center gap-3">
                                <Store className="text-primary-500 shrink-0" size={20} />
                                <h2 className="font-bold text-gray-900 text-lg">Informations du magasin</h2>
                            </div>
                            <div className="p-5 sm:p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Nom de l'entreprise</p>
                                        <p className="font-medium text-gray-900">{seller.business_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Plan sélectionné</p>
                                        <p className="font-medium text-primary-700">
                                            {seller.active_subscription?.plan?.name || 'Standard'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="text-gray-800 text-sm mt-1">
                                        {seller.description || 'Aucune description fournie.'}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-2">
                                        <MapPin size={16} /> Localisation
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {seller.address}, {seller.city}, {seller.country}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Verification Document */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center gap-3">
                                <FileText className="text-primary-500 shrink-0" size={20} />
                                <h2 className="font-bold text-gray-900 text-lg">Document de vérification</h2>
                            </div>
                            <div className="p-5 sm:p-6">
                                {seller.verification_document ? (
                                    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center border border-gray-200 shadow-sm shrink-0">
                                                <FileText size={20} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">Business License / ID</p>
                                                <p className="text-xs text-gray-500">
                                                    Téléchargé le {new Date(seller.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={`/storage/${seller.verification_document}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Voir le document
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 flex flex-col items-center">
                                        <FileWarning size={32} className="mb-2 text-gray-400" />
                                        <p>Aucun document de vérification fourni.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions & Info */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Actions</h2>

                            {seller.status === 'pending' ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleVerify}
                                        disabled={verifyForm.processing}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle size={18} /> Approuver le vendeur
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                                    >
                                        <XCircle size={18} /> Rejeter la candidature
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => router.patch(`/admin/sellers/${seller.slug}/toggle`)}
                                        className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl shadow-sm transition-colors ${
                                            seller.status === 'suspended'
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Power size={18} /> {seller.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
                                    </button>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Changer le statut du compte</label>
                                        <select
                                            value={statusForm.data.status}
                                            onChange={handleStatusChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none bg-white font-medium"
                                        >
                                            <option value="verified">Vérifié (actif)</option>
                                            <option value="suspended">Suspendu</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Owner Info */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                                <User className="text-gray-400 shrink-0" size={18} />
                                <h2 className="font-bold text-gray-900">Contact du propriétaire</h2>
                            </div>
                            <div className="p-5 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Nom</p>
                                    <p className="font-medium text-gray-900">{seller.user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <a href={`mailto:${seller.user?.email}`} className="font-medium text-primary-600 hover:underline break-all">
                                        {seller.user?.email}
                                    </a>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Téléphone</p>
                                    <a href={`tel:${seller.user?.phone}`} className="font-medium text-gray-900 hover:underline">
                                        {seller.user?.phone ?? '—'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seller Products */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
                    <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center gap-3">
                        <Package className="text-primary-500 shrink-0" size={20} />
                        <h2 className="font-bold text-gray-900 text-lg">
                            Produits du vendeur ({seller.products?.length || 0})
                        </h2>
                    </div>

                    {/* Mobile: cards */}
                    <div className="md:hidden">
                        {seller.products && seller.products.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {seller.products.map((product) => {
                                    const config = productStatusConfig[product.status] || productStatusConfig.inactive;
                                    const Icon = config.icon;
                                    const isProcessing = processingProductId === product.id;
                                    const available = product.initial_stock - product.confirmed_sales;

                                    return (
                                        <div key={product.id} className="p-4 hover:bg-gray-50">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                                    {product.images && product.images[0]?.image_path ? (
                                                        <img
                                                            src={`/storage/${product.images[0].image_path}`}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package size={22} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm truncate">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {product.category?.name || 'N/A'}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 ${config.color}`}>
                                                    <Icon size={10} />
                                                    {config.label}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                                <div>
                                                    <span className="text-gray-500">Prix</span>
                                                    <p className="font-semibold text-gray-900">
                                                        {new Date().getFullYear() > 2024
                                                            ? `${parseFloat(product.price).toLocaleString()} FC`
                                                            : `TZS ${parseFloat(product.price).toLocaleString()}`}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Stock dispo.</span>
                                                    <p className="font-semibold text-gray-900">{available}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                {product.status === 'active' && (
                                                    <Link
                                                        href={`/products/${product.slug}`}
                                                        target="_blank"
                                                        className="p-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                                                        title="Voir le produit"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                )}
                                                {product.status === 'blocked' ? (
                                                    <button
                                                        onClick={() => handleUnblockProduct(product.id)}
                                                        disabled={isProcessing}
                                                        className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Débloquer"
                                                    >
                                                        <Award size={16} />
                                                    </button>
                                                ) : product.status !== 'inactive' && product.status !== 'rejected' && (
                                                    <button
                                                        onClick={() => handleBlockProduct(product.id)}
                                                        disabled={isProcessing}
                                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Bloquer (vente illégale)"
                                                    >
                                                        <ShieldAlert size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <Package size={36} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Ce vendeur n'a pas encore de produits.</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop: table */}
                    <div className="hidden md:block overflow-x-auto">
                        {seller.products && seller.products.length > 0 ? (
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Produit</th>
                                        <th className="px-6 py-4">Catégorie</th>
                                        <th className="px-6 py-4">Prix</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {seller.products.map((product) => {
                                        const config = productStatusConfig[product.status] || productStatusConfig.inactive;
                                        const Icon = config.icon;
                                        const isProcessing = processingProductId === product.id;
                                        const available = product.initial_stock - product.confirmed_sales;

                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                                            {product.images && product.images[0]?.image_path ? (
                                                                <img
                                                                    src={`/storage/${product.images[0].image_path}`}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Package size={20} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 max-w-[250px]">
                                                            <p className="font-semibold text-gray-900 truncate">
                                                                {product.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {product.category?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                                                    {new Date().getFullYear() > 2024
                                                        ? `${parseFloat(product.price).toLocaleString()} FC`
                                                        : `TZS ${parseFloat(product.price).toLocaleString()}`}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {available}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold uppercase ${config.color}`}>
                                                        <Icon size={10} />
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {product.status === 'active' && (
                                                            <Link
                                                                href={`/products/${product.slug}`}
                                                                target="_blank"
                                                                className="p-1.5 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                                                                title="Voir le produit"
                                                            >
                                                                <Eye size={14} />
                                                            </Link>
                                                        )}
                                                        {product.status === 'blocked' ? (
                                                            <button
                                                                onClick={() => handleUnblockProduct(product.id)}
                                                                disabled={isProcessing}
                                                                className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Débloquer"
                                                            >
                                                                <Award size={14} />
                                                            </button>
                                                        ) : product.status !== 'inactive' && product.status !== 'rejected' && (
                                                            <button
                                                                onClick={() => handleBlockProduct(product.id)}
                                                                disabled={isProcessing}
                                                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Bloquer (vente illégale)"
                                                            >
                                                                <ShieldAlert size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <Package size={40} className="mx-auto mb-3 opacity-20" />
                                <p>Ce vendeur n'a pas encore de produits.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Rejeter la candidature du vendeur</h3>
                            <form onSubmit={handleReject}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motif du rejet (envoyé au vendeur)
                                </label>
                                <textarea
                                    value={rejectForm.data.reason}
                                    onChange={e => rejectForm.setData('reason', e.target.value)}
                                    rows={4}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                    placeholder="ex. Le document est illisible, veuillez télécharger un scan clair."
                                ></textarea>
                                {rejectForm.errors.reason && (
                                    <p className="text-xs text-red-600 mb-4">{rejectForm.errors.reason}</p>
                                )}

                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={rejectForm.processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {rejectForm.processing ? 'Rejet en cours...' : 'Confirmer le rejet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
