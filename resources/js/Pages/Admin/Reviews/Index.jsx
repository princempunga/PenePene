import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminAlert from '@/Components/Admin/AdminAlert';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPagination from '@/Components/Admin/AdminPagination';
import { blockAdminDemoAction } from '@/lib/adminDemo';
import { MessageSquare, Trash2, Star } from 'lucide-react';

export default function ReviewsIndex({ reviews }) {
    const { flash, usingDemoData } = usePage().props;
    const { delete: destroy } = useForm();

    const deleteReview = (id) => {
        if (blockAdminDemoAction(usingDemoData)) return;
        if (confirm('Supprimer cet avis ? Action irréversible.')) {
            destroy(`/admin/reviews/${id}`);
        }
    };

    return (
        <AdminLayout subtitle="Marketplace" title="Modération des avis">
            <Head title="Avis" />

            {flash?.success && <AdminAlert>{flash.success}</AdminAlert>}

            <AdminCard title="Avis clients" icon={MessageSquare} noPadding>
                <div className="divide-y divide-slate-100">
                    {reviews.data.length > 0 ? reviews.data.map((review) => (
                        <div key={review.id} className="flex gap-4 p-5 transition hover:bg-slate-50/80 sm:p-6">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#002E5D]/8 text-sm font-bold text-[#002E5D]">
                                {review.buyer?.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-[#002E5D]">{review.buyer?.user?.name || 'Acheteur inconnu'}</h3>
                                        <div className="mt-1 flex items-center gap-1 text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'text-slate-300'} />
                                            ))}
                                            <span className="ml-2 text-xs text-slate-500">→ {review.seller?.business_name}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => deleteReview(review.id)}
                                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                                    {review.comment || <span className="italic text-slate-400">Aucun commentaire</span>}
                                </p>
                                <p className="mt-3 text-xs text-slate-400">
                                    {new Date(review.created_at).toLocaleString('fr-FR')} · Commande #{review.order?.order_number}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center text-slate-500">
                            <MessageSquare size={40} className="mx-auto mb-3 text-slate-300" />
                            <p>Aucun avis trouvé.</p>
                        </div>
                    )}
                </div>
            </AdminCard>

            <AdminPagination paginator={reviews} />
        </AdminLayout>
    );
}
