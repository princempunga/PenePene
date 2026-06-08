import React, { useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import StatusBadge from '@/Components/UI/StatusBadge';
import {
    Upload, FileText, Image as ImageIcon, Trash2,
    ShieldCheck, AlertCircle, ExternalLink, FileCheck,
} from 'lucide-react';

const documentTypeIcons = {
    national_id: FileText,
    passport: FileText,
    business_registration: FileCheck,
    tax_certificate: FileCheck,
    other: FileText,
};

function getFileIcon(filename) {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return FileText;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return ImageIcon;
    return FileText;
}

function formatDocumentType(type, documentTypes) {
    return documentTypes[type] || type?.replace(/_/g, ' ') || 'Document';
}

export default function DocumentsIndex({ documents, documentTypes }) {
    const { flash } = usePage().props;
    const fileInputRef = useRef(null);
    const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
        document_type: 'national_id',
        document_number: '',
        document_file: null,
    });

    const handleFileChange = (e) => {
        setData('document_file', e.target.files[0] || null);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/seller/documents', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Remove this document? You can upload a new one afterwards.')) {
            destroy(`/seller/documents/${id}`);
        }
    };

    const pendingCount = documents.filter((d) => d.status === 'pending').length;
    const approvedCount = documents.filter((d) => d.status === 'verified').length;

    return (
        <>
            <Head title="Verification Documents" />
            <SellerLayout>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Verification Documents</h1>
                    <p className="text-gray-500 mt-1">
                        Upload and manage documents required to verify your seller account.
                    </p>
                </div>

                {flash?.success && (
                    <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200 flex items-center gap-2">
                        <ShieldCheck size={18} className="shrink-0" />
                        {flash.success}
                    </div>
                )}

                {errors.document && (
                    <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-lg text-sm border border-red-200 flex items-center gap-2">
                        <AlertCircle size={18} className="shrink-0" />
                        {errors.document}
                    </div>
                )}

                {/* Status overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <p className="text-sm text-gray-500 font-medium">Total Uploaded</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{documents.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <p className="text-sm text-gray-500 font-medium">Pending Review</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <p className="text-sm text-gray-500 font-medium">Approved</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{approvedCount}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Upload form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center shrink-0">
                                    <Upload size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">Upload Document</h2>
                                    <p className="text-xs text-gray-500">PDF, JPG, or PNG — max 5 MB</p>
                                </div>
                            </div>
                            <form onSubmit={submit} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                                    <select
                                        value={data.document_type}
                                        onChange={(e) => setData('document_type', e.target.value)}
                                        className="w-full border-gray-300 rounded-lg text-sm"
                                    >
                                        {Object.entries(documentTypes).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                    {errors.document_type && (
                                        <p className="mt-1 text-xs text-red-600">{errors.document_type}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Document Number <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.document_number}
                                        onChange={(e) => setData('document_number', e.target.value)}
                                        placeholder="e.g. ID or license number"
                                        className="w-full border-gray-300 rounded-lg text-sm"
                                    />
                                    {errors.document_number && (
                                        <p className="mt-1 text-xs text-red-600">{errors.document_number}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                                            data.document_file
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                                        }`}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                        <Upload
                                            size={28}
                                            className={`mx-auto mb-2 ${data.document_file ? 'text-green-500' : 'text-gray-400'}`}
                                        />
                                        {data.document_file ? (
                                            <p className="font-medium text-green-700 text-sm">{data.document_file.name}</p>
                                        ) : (
                                            <p className="text-sm text-gray-600">Click to browse your file</p>
                                        )}
                                    </div>
                                    {errors.document_file && (
                                        <p className="mt-1 text-xs text-red-600">{errors.document_file}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-primary-700 transition disabled:opacity-50"
                                >
                                    <Upload size={18} />
                                    {processing ? 'Uploading...' : 'Upload Document'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Document list */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-gray-900">Your Documents</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Approved documents help build trust with buyers.
                                </p>
                            </div>

                            {documents.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-600">
                                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                            <tr>
                                                <th className="px-5 py-3">Document</th>
                                                <th className="px-5 py-3">Type</th>
                                                <th className="px-5 py-3">Status</th>
                                                <th className="px-5 py-3">Uploaded</th>
                                                <th className="px-5 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {documents.map((doc) => {
                                                const TypeIcon = documentTypeIcons[doc.document_type] || FileText;
                                                const FileIcon = getFileIcon(doc.document_file);
                                                return (
                                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                                                                    <FileIcon size={18} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-medium text-gray-900 truncate max-w-[180px]">
                                                                        {doc.document_file?.split('/').pop()}
                                                                    </p>
                                                                    {doc.document_number && (
                                                                        <p className="text-xs text-gray-400">#{doc.document_number}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <TypeIcon size={14} className="text-gray-400 shrink-0" />
                                                                <span>{formatDocumentType(doc.document_type, documentTypes)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <StatusBadge status={doc.status} />
                                                            {doc.status === 'rejected' && doc.rejection_reason && (
                                                                <p className="text-xs text-red-500 mt-1 max-w-[200px]">{doc.rejection_reason}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-gray-500">
                                                            {new Date(doc.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-5 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <a
                                                                    href={`/storage/${doc.document_file}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                                                                    title="View document"
                                                                >
                                                                    <ExternalLink size={16} />
                                                                </a>
                                                                {doc.status !== 'verified' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDelete(doc.id)}
                                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                                        title="Remove document"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <ShieldCheck size={40} className="text-gray-200 mx-auto mb-3" />
                                    <h3 className="font-bold text-gray-900 mb-1">No documents uploaded</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                        Upload your national ID, business registration, or tax certificate to complete seller verification.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SellerLayout>
        </>
    );
}
