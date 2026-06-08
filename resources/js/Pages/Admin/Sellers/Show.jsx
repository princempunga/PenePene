import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Store, User, MapPin, FileText, CheckCircle, XCircle, FileWarning } from 'lucide-react';

export default function SellerShow({ seller }) {
    const { flash } = usePage().props;
    const [showRejectModal, setShowRejectModal] = useState(false);
    
    const verifyForm = useForm({});
    const rejectForm = useForm({ reason: '' });
    const statusForm = useForm({ status: seller.status });

    const handleVerify = () => {
        if (confirm('Are you sure you want to verify this seller and make their store public?')) {
            verifyForm.patch(`/admin/sellers/${seller.id}/verify`);
        }
    };

    const handleReject = (e) => {
        e.preventDefault();
        rejectForm.patch(`/admin/sellers/${seller.id}/reject`, {
            onSuccess: () => setShowRejectModal(false)
        });
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        statusForm.setData('status', newStatus);
        if (confirm(`Change seller status to ${newStatus}?`)) {
            statusForm.patch(`/admin/sellers/${seller.id}/status`);
        }
    };

    return (
        <>
            <Head title={`Review ${seller.business_name}`} />
            <AdminLayout title="Seller Details">
                
                <div className="mb-6 flex justify-between items-center">
                    <Link href="/admin/sellers" className="text-sm text-gray-500 hover:text-slate-800">← Back to Sellers</Link>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        seller.status === 'active' ? 'bg-green-100 text-green-800' :
                        seller.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {seller.status}
                    </span>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                                <Store className="text-primary-500" />
                                <h2 className="font-bold text-gray-900 text-lg">Store Information</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Business Name</p>
                                        <p className="font-medium text-gray-900">{seller.business_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Selected Plan</p>
                                        <p className="font-medium text-primary-700">{seller.plan?.name || 'Standard'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="text-gray-800 text-sm mt-1">{seller.description || 'No description provided.'}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-2"><MapPin size={16} /> Location</p>
                                    <p className="font-medium text-gray-900">{seller.address}, {seller.city}, {seller.country}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                                <FileText className="text-primary-500" />
                                <h2 className="font-bold text-gray-900 text-lg">Verification Document</h2>
                            </div>
                            <div className="p-6">
                                {seller.verification_document ? (
                                    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center border border-gray-200 shadow-sm">
                                                <FileText size={20} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">Business License / ID</p>
                                                <p className="text-xs text-gray-500">Uploaded on {new Date(seller.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <a 
                                            href={`/storage/${seller.verification_document}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            View Document
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 flex flex-col items-center">
                                        <FileWarning size={32} className="mb-2 text-gray-400" />
                                        <p>No verification document provided.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions & Info */}
                    <div className="space-y-6">
                        {/* Approval Actions */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Actions</h2>
                            
                            {seller.status === 'pending' ? (
                                <div className="space-y-3">
                                    <button 
                                        onClick={handleVerify}
                                        disabled={verifyForm.processing}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                                    >
                                        <CheckCircle size={18} /> Approve Seller
                                    </button>
                                    <button 
                                        onClick={() => setShowRejectModal(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                                    >
                                        <XCircle size={18} /> Reject Application
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Change Account Status</label>
                                    <select 
                                        value={statusForm.data.status} 
                                        onChange={handleStatusChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none bg-white font-medium"
                                    >
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Owner Info */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                                <User className="text-gray-400" size={18} />
                                <h2 className="font-bold text-gray-900">Owner Contact</h2>
                            </div>
                            <div className="p-5 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">{seller.user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <a href={`mailto:${seller.user?.email}`} className="font-medium text-primary-600 hover:underline">{seller.user?.email}</a>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <a href={`tel:${seller.user?.phone}`} className="font-medium text-gray-900 hover:underline">{seller.user?.phone}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Seller Application</h3>
                            <form onSubmit={handleReject}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for rejection (sent to seller)</label>
                                <textarea 
                                    value={rejectForm.data.reason}
                                    onChange={e => rejectForm.setData('reason', e.target.value)}
                                    rows={4}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                    placeholder="e.g. Document is illegible, please upload a clear scan."
                                ></textarea>
                                {rejectForm.errors.reason && <p className="text-xs text-red-600 mb-4">{rejectForm.errors.reason}</p>}
                                
                                <div className="flex gap-3 justify-end">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowRejectModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={rejectForm.processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {rejectForm.processing ? 'Rejecting...' : 'Confirm Rejection'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
