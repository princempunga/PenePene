import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { formatCurrency } from '@/lib/formatCurrency';
import SellerLayout from '@/Layouts/SellerLayout';
import ImageGallery from '@/Components/Product/ImageGallery';
import RatingStars from '@/Components/UI/RatingStars';
import { Edit, Trash2, Eye, Package, ShoppingCart, BarChart3, MapPin, Tag, Layers, Calendar, TrendingUp, Star, MessageSquare } from 'lucide-react';

const statusColors = {
    pending:  'bg-amber-100 text-amber-800',
    active:   'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
};

const statusLabels = {
    pending:  'En attente',
    active:   'Actif',
    inactive: 'Inactif',
    rejected: 'Rejeté',
};

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-xs font-semibold text-gray-900">{value}</span>
        </div>
    );
}

function MetricBox({ label, value, color = 'text-gray-900' }) {
    return (
        <div className="p-2 bg-gray-50 rounded-lg text-center">
            <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
            <p className={`text-sm font-bold ${color}`}>{value}</p>
        </div>
    );
}

export default function ProductShow({ product, stats }) {
    const { flash } = usePage().props;
    const { delete: destroy, processing } = useForm({});

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
            destroy(`/seller/products/${product.id}`);
        }
    };

    const effectivePrice = product.sale_price || product.price;
    const hasDiscount = product.sale_price && product.sale_price < product.price;

    return (
        <>
            <Head title={product.name} />
            <SellerLayout title="Détails du produit">
                {/* Header actions */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <Link href="/seller/products" className="text-xs text-gray-500 hover:text-primary-600 shrink-0">← Retour</Link>
                    <div className="flex items-center gap-1.5">
                        {product.status === 'active' && (
                            <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors" title="Page publique">
                                <Eye size={14} />
                            </a>
                        )}
                        <Link href={`/seller/products/${product.id}/edit`} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Modifier">
                            <Edit size={14} />
                        </Link>
                        <button onClick={handleDelete} disabled={processing} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50" title="Supprimer">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-medium">
                        {flash.success}
                    </div>
                )}

                {/* Carte principale : images + infos essentielles */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ImageGallery images={product.images} productName={product.name} />

                        <div>
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-1 mb-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {statusLabels[product.status] || product.status}
                                </span>
                                {stats.available_stock <= 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Rupture</span>
                                )}
                                {stats.is_low_stock && stats.available_stock > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Stock bas</span>
                                )}
                                {hasDiscount && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">-{stats.discount_percentage}%</span>
                                )}
                            </div>

                            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-tight">{product.name}</h2>

                            {product.category && (
                                <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                                    <Tag size={11} className="text-gray-400" />
                                    <span>{product.category.name}</span>
                                    {product.subcategory && <span>› {product.subcategory.name}</span>}
                                </div>
                            )}

                            {/* Prix */}
                            <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg mb-2">
                                <div className="flex items-end gap-2 flex-wrap">
                                    <span className="text-lg font-extrabold text-primary-600">{formatCurrency(effectivePrice)}</span>
                                    {hasDiscount && (
                                        <>
                                            <span className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>
                                            <span className="text-[10px] font-bold text-purple-600">Éco. {formatCurrency(product.price - product.sale_price)}</span>
                                        </>
                                    )}
                                </div>
                                {product.unit && <p className="text-[10px] text-gray-500">Unité : {product.unit}</p>}
                            </div>

                            {product.average_rating > 0 && (
                                <div className="mb-2">
                                    <RatingStars rating={product.average_rating} count={product.total_reviews} />
                                </div>
                            )}

                            {/* Dates et localisation */}
                            <div className="text-[11px] text-gray-500 space-y-0.5">
                                <p className="flex items-center gap-1.5"><Calendar size={10} className="text-gray-400" /> Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}</p>
                                <p className="flex items-center gap-1.5"><Calendar size={10} className="text-gray-400" /> MAJ le {new Date(product.updated_at).toLocaleDateString('fr-FR')}</p>
                                {product.city && (
                                    <p className="flex items-center gap-1.5"><MapPin size={10} className="text-gray-400" /> {[product.city, product.province, product.country].filter(Boolean).join(', ')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance — toujours visible */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-3">
                    <h3 className="font-bold text-gray-900 text-xs mb-2 flex items-center gap-1.5">
                        <BarChart3 size={14} className="text-primary-500" /> Performance
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        <MetricBox label="Stock" value={stats.available_stock} color={stats.available_stock <= 0 ? 'text-red-600' : stats.is_low_stock ? 'text-amber-600' : 'text-green-600'} />
                        <MetricBox label="Vendues" value={stats.confirmed_sales} />
                        <MetricBox label="Vues" value={stats.view_count} />
                        <MetricBox label="Avis" value={stats.total_reviews} />
                        <MetricBox label="Note" value={product.average_rating > 0 ? product.average_rating.toFixed(1) : '—'} />
                        <MetricBox label="Conversion" value={stats.view_count > 0 ? `${((stats.confirmed_sales / stats.view_count) * 100).toFixed(1)}%` : '—'} />
                    </div>
                </div>

                {/* Inventaire — toujours visible */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-3">
                    <h3 className="font-bold text-gray-900 text-xs mb-2 flex items-center gap-1.5">
                        <Layers size={14} className="text-primary-500" /> Inventaire
                    </h3>
                    <InfoRow label="Stock initial" value={product.initial_stock} />
                    <InfoRow label="Ventes confirmées" value={product.confirmed_sales} />
                    <InfoRow label="Seuil stock bas" value={product.low_stock_threshold || 'Non défini'} />
                    <div className="flex items-center justify-between pt-2 mt-1">
                        <span className="text-xs font-medium text-gray-700">Disponible</span>
                        <span className={`text-base font-bold ${stats.available_stock <= 0 ? 'text-red-600' : stats.is_low_stock ? 'text-amber-600' : 'text-green-600'}`}>
                            {stats.available_stock}
                        </span>
                    </div>
                    <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full ${stats.available_stock <= 0 ? 'bg-red-500' : stats.is_low_stock ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, (stats.available_stock / Math.max(1, product.initial_stock)) * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Informations supplémentaires — toujours visible */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-3">
                    <h3 className="font-bold text-gray-900 text-xs mb-2 flex items-center gap-1.5">
                        <Package size={14} className="text-primary-500" /> Informations
                    </h3>
                    <InfoRow label="Devise" value={product.currency || 'CDF'} />
                    <InfoRow label="Mis en avant" value={product.is_featured ? 'Oui' : 'Non'} />
                    {product.sponsored_until && <InfoRow label="Sponsorisé jusqu'au" value={new Date(product.sponsored_until).toLocaleDateString('fr-FR')} />}
                </div>

                {/* Description — toujours visible */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-3">
                    <h3 className="font-bold text-gray-900 text-xs mb-2">Description</h3>
                    <div className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed break-words min-h-[2rem]">
                        {product.description || <span className="italic text-gray-400">Aucune description fournie.</span>}
                    </div>
                    {product.short_description && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-500 uppercase mb-0.5">Résumé</p>
                            <p className="text-xs text-gray-700">{product.short_description}</p>
                        </div>
                    )}
                </div>
                {/* Spacer pour éviter que le contenu soit caché par la bottom nav mobile */}
                <div className="pb-6" />

                {/* Avis clients — toujours visible */}
                {product.reviews && product.reviews.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-3">
                        <h3 className="font-bold text-gray-900 text-xs mb-2 flex items-center gap-1.5">
                            <MessageSquare size={14} className="text-primary-500" /> Avis ({product.reviews.length})
                        </h3>
                        <div className="space-y-2.5">
                            {product.reviews.slice(0, 3).map((review) => (
                                <div key={review.id} className="flex gap-2 pb-2.5 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-[9px] font-bold shrink-0">
                                        {review.buyer?.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="text-[11px] font-semibold text-gray-900">{review.buyer?.user?.name || 'Client'}</span>
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={9} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-600 line-clamp-2">{review.comment}</p>
                                        <p className="text-[9px] text-gray-400 mt-0.5">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bannières statut */}
                {product.status === 'pending' && (
                    <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
                        Ce produit est en attente d'approbation par l'administrateur.
                    </div>
                )}
                {product.status === 'rejected' && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-800">
                        Ce produit a été rejeté. Veuillez revoir l'annonce.
                    </div>
                )}
            </SellerLayout>
        </>
    );
}
