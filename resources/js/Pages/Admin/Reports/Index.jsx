import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminStatCard from '@/Components/Admin/AdminStatCard';
import AdminCard from '@/Components/Admin/AdminCard';
import { blockAdminDemoAction } from '@/lib/adminDemo';
import { FileDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

export default function AdminReportsIndex({ stats }) {
    const { usingDemoData } = usePage().props;
    const { data, setData } = useForm({
        type: 'sales',
        format: 'pdf',
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    const submit = (e) => {
        e.preventDefault();
        if (blockAdminDemoAction(usingDemoData, 'Export indisponible en mode démo.')) return;
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/admin/reports/generate';

        const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.content;
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        Object.keys(data).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data[key];
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    return (
        <AdminLayout subtitle="Opérations" title="Rapports">
            <Head title="Rapports" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard icon={DollarSign} label="GMV total (TZS)" value={parseFloat(stats.total_gmv || 0).toLocaleString('fr-FR')} tone="emerald" />
                <AdminStatCard icon={ShoppingCart} label="Commandes totales" value={stats.total_orders} tone="blue" />
                <AdminStatCard icon={Users} label="Vendeurs vérifiés" value={stats.total_sellers} tone="navy" />
                <AdminStatCard icon={Package} label="Produits actifs" value={stats.total_products} tone="gold" />
            </div>

            <AdminCard title="Exporter les données" icon={FileDown}>
                <div className="p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                                <div className="space-y-2">
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${data.type === 'sales' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="type" value="sales" checked={data.type === 'sales'} onChange={e => setData('type', e.target.value)} className="text-primary-600" />
                                        <span className="font-medium">Sales & Transactions</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${data.type === 'sellers' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="type" value="sellers" checked={data.type === 'sellers'} onChange={e => setData('type', e.target.value)} className="text-primary-600" />
                                        <span className="font-medium">Sellers Performance</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${data.type === 'products' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="type" value="products" checked={data.type === 'products'} onChange={e => setData('type', e.target.value)} className="text-primary-600" />
                                        <span className="font-medium">Product Inventory</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${data.type === 'platform' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="type" value="platform" checked={data.type === 'platform'} onChange={e => setData('type', e.target.value)} className="text-primary-600" />
                                        <span className="font-medium">Platform Growth Summary</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <input type="date" value={data.from} onChange={e => setData('from', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <input type="date" value={data.to} onChange={e => setData('to', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                                    <div className="flex gap-3">
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${data.format === 'pdf' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input type="radio" name="format" value="pdf" checked={data.format === 'pdf'} onChange={e => setData('format', e.target.value)} className="sr-only" />
                                            <span className="font-bold">PDF</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${data.format === 'excel' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input type="radio" name="format" value="excel" checked={data.format === 'excel'} onChange={e => setData('format', e.target.value)} className="sr-only" />
                                            <span className="font-bold">Excel</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${data.format === 'csv' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input type="radio" name="format" value="csv" checked={data.format === 'csv'} onChange={e => setData('format', e.target.value)} className="sr-only" />
                                            <span className="font-bold">CSV</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-6">
                            <button type="submit" className="admin-btn-primary">
                                <FileDown size={18} />
                                Générer le téléchargement
                            </button>
                        </div>
                    </form>
                </div>
            </AdminCard>
        </AdminLayout>
    );
}
