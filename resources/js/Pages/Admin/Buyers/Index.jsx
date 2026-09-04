import React, { useState } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/UI/Pagination';
import { Users, Search, CheckCircle, XCircle, Square, CheckSquare, ToggleLeft, ToggleRight } from 'lucide-react';

export default function BuyersIndex({ buyers, filters }) {
    const { flash } = usePage().props;
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const searchForm = useForm({
        search:    filters.search    ?? '',
        is_active: filters.is_active ?? '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/buyers', {
            search:    searchForm.data.search,
            is_active: searchForm.data.is_active,
        }, { preserveState: true });
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === buyers.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(buyers.data.map(b => b.id));
        }
    };

    const handleToggle = (userId) => {
        setProcessingId(userId);
        router.patch(`/admin/buyers/${userId}/toggle`, {}, {
            preserveState: true,
            onFinish: () => setProcessingId(null),
        });
    };

    const handleBulkAction = (action) => {
        if (!selectedIds.length) return;
        if (!confirm(`${action === 'activate' ? 'Activer' : 'Désactiver'} ${selectedIds.length} acheteur(s) ?`)) return;
        setBulkProcessing(true);
        router.post('/admin/buyers/bulk-action', { ids: selectedIds, action }, {
            preserveState: false,
            onFinish: () => {
                setBulkProcessing(false);
                setSelectedIds([]);
            },
        });
    };

    const allSelected = buyers.data.length > 0 && selectedIds.length === buyers.data.length;

    return (
        <>
            <Head title="Gestion des Acheteurs" />
            <AdminLayout title="Gestion des Acheteurs">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Acheteurs</h1>
                        <p className="text-gray-500 mt-1 text-sm">Gérer les comptes acheteurs de la plateforme.</p>
                    </div>
                </div>

                {/* ── Search / Filter Bar ── */}
                <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou email…"
                            value={searchForm.data.search}
                            onChange={e => searchForm.setData('search', e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                    </div>
                    <select
                        value={searchForm.data.is_active}
                        onChange={e => searchForm.setData('is_active', e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="1">Actifs</option>
                        <option value="0">Désactivés</option>
                    </select>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                    >
                        Filtrer
                    </button>
                </form>

                {/* ── Bulk Action Bar ── */}
                {selectedIds.length > 0 && (
                    <div className="mb-4 flex items-center gap-3 bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow">
                        <span className="text-sm font-medium">{selectedIds.length} sélectionné(s)</span>
                        <div className="flex-1" />
                        <button
                            onClick={() => handleBulkAction('activate')}
                            disabled={bulkProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                        >
                            <CheckCircle size={14} /> Activer
                        </button>
                        <button
                            onClick={() => handleBulkAction('deactivate')}
                            disabled={bulkProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                        >
                            <XCircle size={14} /> Désactiver
                        </button>
                        <button onClick={() => setSelectedIds([])} className="text-gray-300 hover:text-white text-sm">
                            Annuler
                        </button>
                    </div>
                )}

                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {buyers.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4">
                                            <button onClick={toggleSelectAll} className="text-gray-400 hover:text-slate-700">
                                                {allSelected ? <CheckSquare size={17} className="text-slate-700" /> : <Square size={17} />}
                                            </button>
                                        </th>
                                        <th className="px-4 py-4">Acheteur</th>
                                        <th className="px-4 py-4">Email</th>
                                        <th className="px-4 py-4">Téléphone</th>
                                        <th className="px-4 py-4">Inscription</th>
                                        <th className="px-4 py-4">Statut</th>
                                        <th className="px-4 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {buyers.data.map((buyer) => {
                                        const isSelected = selectedIds.includes(buyer.id);
                                        const isProcessing = processingId === buyer.id;
                                        return (
                                            <tr
                                                key={buyer.id}
                                                className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-slate-50' : ''}`}
                                            >
                                                <td className="px-4 py-4">
                                                    <button onClick={() => toggleSelect(buyer.id)} className="text-gray-400 hover:text-slate-700">
                                                        {isSelected ? <CheckSquare size={17} className="text-slate-700" /> : <Square size={17} />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                            {buyer.name?.[0]?.toUpperCase() ?? '?'}
                                                        </div>
                                                        <p className="font-semibold text-gray-900">{buyer.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">{buyer.email}</td>
                                                <td className="px-4 py-4 text-gray-500">{buyer.phone ?? '—'}</td>
                                                <td className="px-4 py-4 text-gray-500 whitespace-nowrap text-xs">
                                                    {new Date(buyer.created_at).toLocaleDateString('fr-CD')}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {buyer.is_active ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                            <CheckCircle size={12} /> Actif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                            <XCircle size={12} /> Désactivé
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button
                                                        onClick={() => handleToggle(buyer.id)}
                                                        disabled={isProcessing}
                                                        title={buyer.is_active ? 'Désactiver' : 'Activer'}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                            buyer.is_active
                                                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                        }`}
                                                    >
                                                        {isProcessing ? '…' : buyer.is_active ? (
                                                            <><ToggleRight size={15} /> Désactiver</>
                                                        ) : (
                                                            <><ToggleLeft size={15} /> Activer</>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={buyers.links} />
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 sm:p-16 text-center shadow-sm">
                        <Users size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun acheteur trouvé</h3>
                        <p className="text-gray-500 text-sm">Aucun acheteur ne correspond à vos critères de recherche.</p>
                    </div>
                )}

            </AdminLayout>
        </>
    );
}
