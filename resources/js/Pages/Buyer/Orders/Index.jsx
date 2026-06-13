import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import BuyerAccountEmptyState from '@/Components/Buyer/BuyerAccountEmptyState';
import Pagination from '@/Components/UI/Pagination';
import { Package } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

const statusColors = {
    pending:   'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped:   'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersIndex({ orders }) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('buyer.my_orders')} />
            <BuyerLayout
                title={t('buyer.my_orders')}
                subtitle={t('buyer.orders_subtitle_full')}
            >
                {orders.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {orders.data.map(order => (
                                    <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-bold text-gray-900">{order.order_number}</span>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {t('buyer.ordered')} {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {order.seller && ` · ${t('buyer.seller_label')}: ${order.seller.business_name}`}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {t('buyer.items_count', { count: order.items?.length || 0 })}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="text-lg font-bold text-gray-900">
                                                    TZS {parseFloat(order.total_amount).toLocaleString()}
                                                </span>
                                                <Link
                                                    href={`/buyer/orders/${order.id}`}
                                                    className="px-4 py-2 text-sm font-medium bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                                                >
                                                    {t('buyer.view_details')}
                                                </Link>
                                            </div>
                                        </div>

                                        {order.items && order.items.length > 0 && (
                                            <div className="mt-4 flex gap-2">
                                                {order.items.slice(0, 4).map(item => {
                                                    const imgPath = item.product?.images?.[0]?.image_path;
                                                    return (
                                                        <div key={item.id} className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                            {imgPath ? (
                                                                <img src={`/storage/${imgPath}`} alt={item.product?.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package size={18} className="text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {order.items.length > 4 && (
                                                    <div className="w-14 h-14 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                        +{order.items.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Pagination links={orders.links} />
                    </>
                ) : (
                    <BuyerAccountEmptyState
                        icon={Package}
                        title={t('buyer.no_orders_empty_title')}
                        description={t('buyer.no_orders_empty_desc')}
                        actionLabel={t('buyer.start_shopping')}
                        actionHref="/products"
                    />
                )}
            </BuyerLayout>
        </>
    );
}
