import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { FileDown, FileText, Package, AlertCircle } from 'lucide-react';

export default function ReportsIndex({ stats }) {
    const { data, setData, post, processing, errors } = useForm({
        type: 'sales',
        format: 'pdf',
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    const submit = (e) => {
        e.preventDefault();
        // Inertia post doesn't handle direct file downloads well without custom handling.
        // It's usually better to use a standard form submission for downloads.
        // I will use standard window form submission so the browser handles the download stream.
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/seller/reports/generate';

        // Add CSRF token
        const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.content;
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        // Add data
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
        <SellerLayout>
            <Head title="Reports & Analytics" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-500 mt-1">Generate and download detailed reports for your store.</p>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                        <span className="font-bold text-lg">TZS</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{parseFloat(stats.total_revenue || 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
                    </div>
                </div>
            </div>

            {/* Report Generator */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-4xl">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center shrink-0">
                        <FileDown size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Generate Custom Report</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                                <div className="space-y-2">
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${data.type === 'sales' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="type" value="sales" checked={data.type === 'sales'} onChange={e => setData('type', e.target.value)} className="text-primary-600" />
                                        <span className="font-medium">Sales & Revenue</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${data.type === 'products' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="type" value="products" checked={data.type === 'products'} onChange={e => setData('type', e.target.value)} className="text-primary-600" />
                                        <span className="font-medium">Product Inventory</span>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${data.type === 'stock' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="type" value="stock" checked={data.type === 'stock'} onChange={e => setData('type', e.target.value)} className="text-primary-600" />
                                        <span className="font-medium flex items-center gap-2">Low Stock Alerts <AlertCircle size={14} className="text-red-500"/></span>
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
                                Download Report
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
}
