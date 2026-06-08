import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FileDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

export default function AdminReportsIndex({ stats }) {
    const { data, setData } = useForm({
        type: 'sales',
        format: 'pdf',
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    const submit = (e) => {
        e.preventDefault();
        
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
        <AdminLayout>
            <Head title="Platform Reports" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Platform Reports</h1>
                <p className="text-gray-500 mt-1">Export detailed insights across the entire marketplace.</p>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-3">
                        <DollarSign size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{parseFloat(stats.total_gmv || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Total GMV (TZS)</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
                        <ShoppingCart size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Total Orders</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3">
                        <Users size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_sellers}</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Verified Sellers</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-3">
                        <Package size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Active Products</p>
                </div>
            </div>

            {/* Report Generator */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-4xl">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center shrink-0">
                        <FileDown size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Export Platform Data</h2>
                </div>
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

                        <div className="flex justify-end pt-6 border-t border-gray-100">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-700 transition shadow-md shadow-primary-600/20"
                            >
                                <FileDown size={18} />
                                Generate Download
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
