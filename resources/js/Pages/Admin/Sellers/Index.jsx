import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/UI/Pagination';
import { Store, ShieldCheck, XCircle, Clock, CheckCircle, Ban, BarChart2, Square, CheckSquare } from 'lucide-react';

    const statusConfig = {
    pending:   { label: 'En attente',     color: 'bg-amber-100 text-amber-800', icon: Clock },
    active:    { label: 'Actif',          color: 'bg-green-100 text-green-800', icon: ShieldCheck },
    verified:  { label: 'Actif',          color: 'bg-green-100 text-green-800', icon: ShieldCheck },
    rejected:  { label: 'Rejeté',         color: 'bg-red-100 text-red-800',     icon: XCircle },
    suspended: { label: 'Suspendu',       color: 'bg-gray-100 text-gray-800',   icon: XCircle },
    blocked:   { label: 'Bloqué',         color: 'bg-red-200 text-red-900',     icon: Ban },
};

export default function SellersIndex({ sellers, filters }) {
    const { flash } = usePage().props;
    const [processingId, setProcessingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const handleFilter = (status) => {
        router.get('/admin/sellers', { status }, { preserveState: true });
        setSelectedIds([]);
    };

    const handleQuickAction = (sellerId, sellerSlug, action) => {
        setProcessingId(sellerId);
        router.post(`/admin/sellers/${sellerSlug}/quick-action`, { action }, {
            preserveState: true,
            onFinish: () => setProcessingId(null),
        });
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === sellers.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sellers.data.map(s => s.id));
        }
    };

    const handleBulkAction = (action) => {
        if (!selectedIds.length) return;
        if (!confirm(`${action === 'suspend' ? 'Suspendre' : 'Activer'} ${selectedIds.length} vendeur(s) sélectionné(s) ?`)) return;
        setBulkProcessing(true);
        router.post('/admin/sellers/bulk-action', { ids: selectedIds, action }, {
            preserveState: false,
            onFinish: () => {
                setBulkProcessing(false);
                setSelectedIds([]);
            },
        });
    };

    const allSelected = sellers.data.length > 0 && selectedIds.length === sellers.data.length;

    return (
        <>
            <Head title="Seller Management" />
            <AdminLayout title="Seller Management">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Seller Management</h1>
                        <p className="text-gray-500 mt-1 text-sm">Review and manage seller accounts across the platform.</p>
                    </div>
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm overflow-x-auto w-full sm:w-auto">
                        {['all', 'pending', 'active', 'rejected', 'suspended'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleFilter(status === 'all' ? '' : status)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                                    (filters.status === status) || (!filters.status && status === 'all') || (filters.status === '' && status === 'all') || (filters.status === 'verified' && status === 'active')
                                        ? 'bg-slate-800 text-white'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Bulk Action Bar ── */}
                {selectedIds.length > 0 && (
                    <div className="mb-4 flex items-center gap-3 bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow">
                        <span className="text-sm font-medium">{selectedIds.length} sélectionné(s)</span>
                        <div className="flex-1" />
                        <button
                            onClick={() => handleBulkAction('suspend')}
                            disabled={bulkProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                        >
                            <Ban size={14} /> Suspendre
                        </button>
                        <button
                            onClick={() => handleBulkAction('activate')}
                            disabled={bulkProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                        >
                            <ShieldCheck size={14} /> Activer
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="text-gray-300 hover:text-white text-sm"
                        >
                            Annuler
                        </button>
                    </div>
                )}

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {sellers.data.length > 0 ? (
                    <>
                        {/* ── Mobile : cartes ── */}
                        <div className="md:hidden space-y-3">
                            {sellers.data.map((seller) => {
                                const config = statusConfig[seller.status] || statusConfig.suspended;
                                const StatusIcon = config.icon;
                                const isProcessing = processingId === seller.id;
                                const isSelected = selectedIds.includes(seller.id);
                                return (
                                    <div key={seller.id} className={`bg-white rounded-xl border shadow-sm p-4 transition-colors ${isSelected ? 'border-slate-400 bg-slate-50' : 'border-gray-200'}`}>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <button onClick={() => toggleSelect(seller.id)} className="shrink-0 text-gray-400 hover:text-slate-700">
                                                    {isSelected ? <CheckSquare size={18} className="text-slate-700" /> : <Square size={18} />}
                                                </button>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{seller.business_name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{seller.city}, {seller.country}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${config.color}`}>
                                                <StatusIcon size={11} />
                                                {config.label}
                                            </span>
                                        </div>
                                        <div className="pt-3 border-t border-gray-100 space-y-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{seller.user?.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{seller.user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                {seller.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleQuickAction(seller.id, seller.slug, 'approve')}
                                                            disabled={isProcessing}
                                                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium transition-colors"
                                                        >
                                                            <CheckCircle size={14} /> {isProcessing ? '...' : 'Approve'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuickAction(seller.id, seller.slug, 'reject')}
                                                            disabled={isProcessing}
                                                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors"
                                                        >
                                                            <XCircle size={14} /> {isProcessing ? '...' : 'Reject'}
                                                        </button>
                                                    </>
                                                )}
                                                {(seller.status === 'active' || seller.status === 'verified') && (
                                                    <button
                                                        onClick={() => handleQuickAction(seller.id, seller.slug, 'suspend')}
                                                        disabled={isProcessing}
                                                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-medium transition-colors"
                                                    >
                                                        <Ban size={14} /> {isProcessing ? '...' : 'Suspend'}
                                                    </button>
                                                )}
                                                {(seller.status === 'suspended' || seller.status === 'rejected') && (
                                                    <button
                                                        onClick={() => handleQuickAction(seller.id, seller.slug, 'activate')}
                                                        disabled={isProcessing}
                                                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium transition-colors"
                                                    >
                                                        <ShieldCheck size={14} /> {isProcessing ? '...' : 'Activate'}
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/admin/sellers/${seller.slug}/statistics`}
                                                    className="shrink-0 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors"
                                                >
                                                    <BarChart2 size={14} /> Stats
                                                </Link>
                                                <Link
                                                    href={`/admin/sellers/${seller.slug}`}
                                                    className="shrink-0 inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium transition-colors"
                                                >
                                                    Review
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Desktop : tableau ── */}
                        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4">
                                            <button onClick={toggleSelectAll} className="text-gray-400 hover:text-slate-700">
                                                {allSelected ? <CheckSquare size={17} className="text-slate-700" /> : <Square size={17} />}
                                            </button>
                                        </th>
                                        <th className="px-4 py-4">Store Details</th>
                                        <th className="px-4 py-4">Owner Contact</th>
                                        <th className="px-4 py-4">Location</th>
                                        <th className="px-4 py-4">Status</th>
                                        <th className="px-4 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sellers.data.map((seller) => {
                                        const config = statusConfig[seller.status] || statusConfig.suspended;
                                        const StatusIcon = config.icon;
                                        const isProcessing = processingId === seller.id;
                                        const isSelected = selectedIds.includes(seller.id);
                                        return (
                                            <tr key={seller.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-slate-50' : ''}`}>
                                                <td className="px-4 py-4">
                                                    <button onClick={() => toggleSelect(seller.id)} className="text-gray-400 hover:text-slate-700">
                                                        {isSelected ? <CheckSquare size={17} className="text-slate-700" /> : <Square size={17} />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="font-bold text-gray-900">{seller.business_name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">Inscrit: {new Date(seller.created_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="font-medium text-gray-900">{seller.user?.name}</p>
                                                    <p className="text-xs text-gray-500">{seller.user?.email}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {seller.city}, {seller.country}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}>
                                                        <StatusIcon size={14} />
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {seller.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleQuickAction(seller.id, seller.slug, 'approve')}
                                                                    disabled={isProcessing}
                                                                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium transition-colors"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle size={16} className="mr-1" /> {isProcessing ? '...' : 'Approve'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleQuickAction(seller.id, seller.slug, 'reject')}
                                                                    disabled={isProcessing}
                                                                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle size={16} className="mr-1" /> {isProcessing ? '...' : 'Reject'}
                                                                </button>
                                                            </>
                                                        )}
                                                        {(seller.status === 'active' || seller.status === 'verified') && (
                                                            <button
                                                                onClick={() => handleQuickAction(seller.id, seller.slug, 'suspend')}
                                                                disabled={isProcessing}
                                                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-medium transition-colors"
                                                                title="Suspend"
                                                            >
                                                                <Ban size={16} className="mr-1" /> {isProcessing ? '...' : 'Suspend'}
                                                            </button>
                                                        )}
                                                        {(seller.status === 'suspended' || seller.status === 'rejected') && (
                                                            <button
                                                                onClick={() => handleQuickAction(seller.id, seller.slug, 'activate')}
                                                                disabled={isProcessing}
                                                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium transition-colors"
                                                                title="Activate"
                                                            >
                                                                <ShieldCheck size={16} className="mr-1" /> {isProcessing ? '...' : 'Activate'}
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={`/admin/sellers/${seller.slug}/statistics`}
                                                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors"
                                                            title="Statistiques vendeur"
                                                        >
                                                            <BarChart2 size={16} className="mr-1" /> Stats
                                                        </Link>
                                                        <Link
                                                            href={`/admin/sellers/${seller.slug}`}
                                                            className="inline-flex items-center justify-center px-3 py-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
                                                        >
                                                            Review
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={sellers.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 sm:p-16 text-center shadow-sm">
                        <Store size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No sellers found</h3>
                        <p className="text-gray-500 text-sm">There are no sellers matching this status.</p>
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
