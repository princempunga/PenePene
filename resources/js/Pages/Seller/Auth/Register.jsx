import React, { useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Upload } from 'lucide-react';

export default function SellerRegister({ plans }) {
    const fileInputRef = useRef(null);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        business_name: '',
        description: '',
        address: '',
        city: '',
        country: 'Tanzania',
        document: null,
        plan_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/seller/register');
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setData('document', e.target.files[0]);
        }
    };

    return (
        <>
            <Head title="Become a Seller" />
            <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4">
                <div className="w-full max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-block">
                            <img src="/images/logo.png" alt="PenePene" className="h-12 w-auto object-contain mx-auto" />
                        </Link>
                        <h2 className="mt-4 text-3xl font-bold text-gray-900">Become a Seller</h2>
                        <p className="mt-2 text-gray-500">Reach thousands of buyers today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                        <div className="p-8 md:p-10 space-y-8">
                            
                            {/* Personal Info */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">1. Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
                                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
                                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
                                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                        <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
                                        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Business Info */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">2. Store Information</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name / Store Name</label>
                                        <input type="text" value={data.business_name} onChange={e => setData('business_name', e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
                                        {errors.business_name && <p className="mt-1 text-xs text-red-600">{errors.business_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                                        <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none resize-none"></textarea>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                                            <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
                                            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input type="text" value={data.city} onChange={e => setData('city', e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
                                            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                            <input type="text" value={data.country} onChange={e => setData('country', e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Document */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">3. Verification Document</h3>
                                <p className="text-sm text-gray-500 mb-3">Please upload a valid business license or national ID for verification (PDF, JPG, PNG). Max 5MB.</p>
                                
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                                        data.document ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                                    }`}
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden" 
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <Upload size={32} className={`mx-auto mb-3 ${data.document ? 'text-green-500' : 'text-gray-400'}`} />
                                    {data.document ? (
                                        <p className="font-medium text-green-700">{data.document.name}</p>
                                    ) : (
                                        <p className="font-medium text-gray-600">Click to browse or drag and drop</p>
                                    )}
                                </div>
                                {errors.document && <p className="mt-1 text-xs text-red-600">{errors.document}</p>}
                            </div>

                            {/* Plan Selection */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">4. Choose a Plan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {plans.map(plan => (
                                        <label 
                                            key={plan.id}
                                            className={`border-2 rounded-xl p-5 cursor-pointer transition-colors ${
                                                data.plan_id === plan.id 
                                                    ? 'border-primary-600 bg-primary-50' 
                                                    : 'border-gray-200 hover:border-primary-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="radio" 
                                                        name="plan_id" 
                                                        value={plan.id}
                                                        checked={data.plan_id === plan.id}
                                                        onChange={() => setData('plan_id', plan.id)}
                                                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                                    />
                                                    <span className="font-bold text-gray-900">{plan.name}</span>
                                                </div>
                                                <span className="font-bold text-primary-700">
                                                    {plan.price == 0 ? 'Free' : `${plan.currency} ${parseFloat(plan.price).toLocaleString()} / ${plan.billing_cycle}`}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 pl-7">{plan.description}</p>
                                        </label>
                                    ))}
                                </div>
                                {errors.plan_id && <p className="mt-1 text-xs text-red-600">{errors.plan_id}</p>}
                            </div>

                        </div>

                        <div className="bg-gray-50 p-8 border-t border-gray-100 text-center">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full md:w-auto min-w-[250px] bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg shadow-sm"
                            >
                                {processing ? 'Submitting Application...' : 'Apply as Seller'}
                            </button>
                            <p className="mt-4 text-sm text-gray-500">
                                Already have a seller account? <Link href="/login" className="text-primary-600 font-medium">Log in</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
