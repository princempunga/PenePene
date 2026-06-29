import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/UI/Pagination';
import { Check, X, FileDown } from 'lucide-react';

const statusLabels = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Refusé',
};

const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

export default function StatsRequestsIndex({ requests }) {
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingId, setRejectingId] = useState(null);

    const approve = (id) => {
        router.patch(`/admin/stats-requests/${id}/approve`, {}, { preserveScroll: true });
    };

    const reject = (id) => {
        router.patch(`/admin/stats-requests/${id}/reject`, {
            rejection_reason: rejectReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectingId(null);
                setRejectReason('');
            },
        });
    };

    return (
        <>
            <Head title="Demandes de rapports" />
            <AdminLayout title="Demandes de téléchargement">
                <p className="text-gray-500 mb-6">
                    Approuvez ou refusez les demandes de rapports statistiques des vendeurs.
                </p>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                                    <th className="px-5 py-3">Vendeur</th>
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3">Format</th>
                                    <th className="px-5 py-3">Période</th>
                                    <th className="px-5 py-3">Statut</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.data.length > 0 ? requests.data.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-900">{req.seller?.business_name}</p>
                                            <p className="text-xs text-gray-500">{req.seller?.user?.email}</p>
                                        </td>
                                        <td className="px-5 py-4 capitalize">{req.report_type}</td>
                                        <td className="px-5 py-4 uppercase">{req.format}</td>
                                        <td className="px-5 py-4 text-gray-600">
                                            {req.date_from} → {req.date_to}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${statusColors[req.status]}`}>
                                                {statusLabels[req.status]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {req.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    {rejectingId === req.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Motif (optionnel)"
                                                                value={rejectReason}
                                                                onChange={(e) => setRejectReason(e.target.value)}
                                                                className="border border-gray-200 rounded px-2 py-1 text-xs w-32"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => reject(req.id)}
                                                                className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setRejectingId(null)}
                                                                className="text-xs text-gray-500"
                                                            >
                                                                Annuler
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => approve(req.id)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700"
                                                            >
                                                                <Check size={14} />
                                                                Accepter
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setRejectingId(req.id)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100"
                                                            >
                                                                <X size={14} />
                                                                Refuser
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 flex items-center justify-end gap-1">
                                                    <FileDown size={14} />
                                                    Traité
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                                            Aucune demande en cours.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={requests.links} />
                </div>
            </AdminLayout>
        </>
    );
}
