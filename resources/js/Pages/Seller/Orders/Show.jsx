import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import StatusBadge from '@/Components/UI/StatusBadge';
import { formatCurrency } from '@/lib/formatCurrency';
import { ORDER_STATUS_LABELS_FR } from '@/lib/orderStatusLabels';
import { User, MapPin, Package, Check, X, Truck, MessageCircle, ShoppingBag, AlertCircle } from 'lucide-react';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatAddress(order) {
    const parts = [
        order.shipping_address || order.delivery_address,
        order.delivery_city,
        order.delivery_province,
        order.delivery_country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'Aucune adresse fournie';
}

export default function OrderShow({ order }) {
    const { flash, errors } = usePage().props;
    const [processing, setProcessing] = React.useState(false);

    const updateStatus = (newStatus) => {
        const label = ORDER_STATUS_LABELS_FR[newStatus] ?? newStatus;
        if (!confirm(`Changer le statut de la commande en « ${label} » ?`)) return;

        setProcessing(true);
        router.patch(
            `/seller/orders/${order.id}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            }
        );
    };

    const currentStep = STATUS_STEPS.indexOf(order.status);
    const isTerminal = ['cancelled', 'rejected'].includes(order.status);

    return (
        <>
            <Head title={`Gérer la commande ${order.order_number}`} />
            <SellerLayout title="Détails de la commande">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Link
                            href="/seller/orders"
                            className="text-sm text-gray-500 hover:text-primary-600"
                        >
                            ← Retour aux commandes
                        </Link>
                        <span className="text-gray-300 hidden sm:inline">/</span>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                            {order.order_number}
                        </h1>
                        <StatusBadge status={order.status} labels={ORDER_STATUS_LABELS_FR} />
                    </div>
                    <p className="text-sm text-gray-500">
                        Passée le {formatDate(order.created_at)}
                    </p>
                </div>

                {/* Bannière d'action urgente si commande en attente */}
                {order.status === 'pending' && (
                    <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                <AlertCircle size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="font-bold text-blue-900">Nouvelle commande en attente</p>
                                <p className="text-sm text-blue-600 mt-0.5">
                                    {order.buyer?.user?.name ?? 'Un client'} a passé une commande. Acceptez ou refusez ci-dessous.
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shrink-0 animate-pulse">
                            <ShoppingBag size={12} />
                            Action requise
                        </span>
                    </div>
                )}

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {errors?.status && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
                        {errors.status}
                    </div>
                )}

                {/* Accès rapide : conversation, produit, détails */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {order.conversation_id && (
                        <Link
                            href={`/seller/messages/${order.conversation_id}`}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-primary-300 transition-colors"
                        >
                            <MessageCircle size={20} className="text-primary-600 shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Conversation</p>
                                <p className="text-xs text-gray-500">Échanger avec le client</p>
                            </div>
                        </Link>
                    )}
                    {order.items?.[0]?.product?.slug && (
                        <Link
                            href={`/seller/products/${order.items[0].product.id}`}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-primary-300 transition-colors"
                        >
                            <Package size={20} className="text-primary-600 shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Produit</p>
                                <p className="text-xs text-gray-500 truncate">{order.items[0].product_name}</p>
                            </div>
                        </Link>
                    )}
                    <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl border border-primary-200">
                        <Check size={20} className="text-primary-600 shrink-0" />
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">Détails commande</p>
                            <p className="text-xs text-gray-500">{formatCurrency(order.total_amount)}</p>
                        </div>
                    </div>
                </div>

                {/* Chronologie du statut */}
                {!isTerminal && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 mb-6 shadow-sm">
                        <h2 className="font-bold text-gray-900 mb-5">Suivi de la livraison</h2>
                        <div className="flex items-center overflow-x-auto pb-2">
                            {STATUS_STEPS.map((step, index) => (
                                <React.Fragment key={step}>
                                    <div className="flex flex-col items-center flex-shrink-0 min-w-[4.5rem]">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                                                index <= currentStep
                                                    ? 'bg-primary-600 border-primary-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-400'
                                            }`}
                                        >
                                            {index < currentStep ? '✓' : index + 1}
                                        </div>
                                        <p
                                            className={`text-xs mt-1.5 font-medium text-center ${
                                                index <= currentStep ? 'text-primary-600' : 'text-gray-400'
                                            }`}
                                        >
                                            {ORDER_STATUS_LABELS_FR[step]}
                                        </p>
                                    </div>
                                    {index < STATUS_STEPS.length - 1 && (
                                        <div
                                            className={`flex-1 h-0.5 mx-1 sm:mx-2 min-w-[1.5rem] ${
                                                index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                                            }`}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        {order.confirmed_at && (
                            <p className="text-xs text-gray-500 mt-4">
                                Confirmée le {formatDate(order.confirmed_at)}
                                {order.delivered_at && ` · Livrée le ${formatDate(order.delivered_at)}`}
                            </p>
                        )}
                    </div>
                )}

                {order.status === 'cancelled' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800">
                        Cette commande a été annulée.
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Articles */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900">Articles commandés</h2>
                            </div>

                            {order.items?.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {order.items.map((item) => {
                                        const imgPath = item.product?.images?.[0]?.image_path;
                                        const name = item.product?.name || item.product_name;

                                        return (
                                            <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                                    {imgPath ? (
                                                        <img
                                                            src={`/storage/${imgPath}`}
                                                            alt={name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package size={20} className="text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {item.product?.slug ? (
                                                        <Link
                                                            href={`/products/${item.product.slug}`}
                                                            target="_blank"
                                                            className="font-semibold text-gray-900 hover:text-primary-600 truncate block"
                                                        >
                                                            {name}
                                                        </Link>
                                                    ) : (
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {name}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Qté : {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-gray-900">
                                                        {formatCurrency(item.total_price)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatCurrency(item.unit_price)} l&apos;unité
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    Aucun article trouvé pour cette commande.
                                </div>
                            )}

                            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <div className="w-full sm:w-64 space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Sous-total</span>
                                        <span>{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Livraison</span>
                                        <span>
                                            {parseFloat(order.shipping_cost) > 0
                                                ? formatCurrency(order.shipping_cost)
                                                : 'Gratuit'}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
                                        <span>Total</span>
                                        <span>{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {order.buyer_notes && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h2 className="font-bold text-gray-900 mb-2">Notes du client</h2>
                                <p className="text-sm text-gray-600">{order.buyer_notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Actions de statut */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900">Mettre à jour le statut</h2>
                            </div>

                            <div className="p-5 sm:p-6 space-y-3">
                                {order.status === 'pending' && (
                                    <>
                                        {/* Titre des actions pour pending */}
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Choisissez une action</p>

                                        {/* ACCEPTER */}
                                        <button
                                            type="button"
                                            onClick={() => updateStatus('confirmed')}
                                            disabled={processing}
                                            className="w-full flex items-center gap-3 bg-green-600 text-white p-4 rounded-xl text-sm font-bold hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-green-600/20"
                                        >
                                            <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                                                <Check size={20} strokeWidth={3} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold">{processing ? 'Mise à jour…' : 'Accepter la commande'}</p>
                                                <p className="text-xs text-green-100 font-normal mt-0.5">Confirmer et passer en préparation</p>
                                            </div>
                                        </button>

                                        {/* CONTACTER */}
                                        {order.conversation_id && (
                                            <Link
                                                href={`/seller/messages/${order.conversation_id}`}
                                                className="w-full flex items-center gap-3 bg-blue-50 border-2 border-blue-200 text-blue-700 p-4 rounded-xl text-sm font-bold hover:bg-blue-100 hover:border-blue-300 active:scale-[0.98] transition-all"
                                            >
                                                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <MessageCircle size={18} className="text-blue-600" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold">Contacter le client</p>
                                                    <p className="text-xs text-blue-500 font-normal mt-0.5">Discuter avant de décider</p>
                                                </div>
                                            </Link>
                                        )}

                                        {/* REFUSER */}
                                        <button
                                            type="button"
                                            onClick={() => updateStatus('cancelled')}
                                            disabled={processing}
                                            className="w-full flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl text-sm font-bold hover:bg-red-100 hover:border-red-300 active:scale-[0.98] disabled:opacity-50 transition-all"
                                        >
                                            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                                <X size={20} className="text-red-600" strokeWidth={3} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold">Refuser la commande</p>
                                                <p className="text-xs text-red-400 font-normal mt-0.5">Le client sera notifié</p>
                                            </div>
                                        </button>
                                    </>
                                )}

                                {order.status === 'confirmed' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => updateStatus('shipped')}
                                            disabled={processing}
                                            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Truck size={16} />
                                            {processing ? 'Mise à jour…' : 'Marquer comme expédiée'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateStatus('cancelled')}
                                            disabled={processing}
                                            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                                        >
                                            <X size={16} />
                                            Annuler la commande
                                        </button>
                                    </>
                                )}

                                {order.status === 'shipped' && (
                                    <button
                                        type="button"
                                        onClick={() => updateStatus('delivered')}
                                        disabled={processing}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Check size={16} />
                                        {processing ? 'Mise à jour…' : 'Marquer comme livrée'}
                                    </button>
                                )}

                                {['delivered', 'cancelled', 'rejected'].includes(order.status) && (
                                    <div className="text-center p-3 bg-gray-50 rounded-lg text-sm text-gray-500 font-medium">
                                        Le traitement de la commande est terminé.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informations client */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                                <User size={18} className="text-primary-500" />
                                Informations client
                            </h2>
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {order.buyer?.user?.name || 'Client inconnu'}
                                </p>
                                {order.buyer?.user?.email && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {order.buyer.user.email}
                                    </p>
                                )}
                                {order.buyer?.user?.phone && (
                                    <p className="text-sm text-gray-500">{order.buyer.user.phone}</p>
                                )}
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-2">
                                    <MapPin size={16} className="text-gray-400" />
                                    Adresse de livraison
                                </h3>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {formatAddress(order)}
                                </p>
                            </div>

                            {order.buyer?.user?.name && order.conversation_id && (
                                <Link
                                    href={`/seller/messages/${order.conversation_id}`}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg transition-colors"
                                >
                                    <MessageCircle size={16} />
                                    Ouvrir la conversation
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </SellerLayout>
        </>
    );
}
