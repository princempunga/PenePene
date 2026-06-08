import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { Ticket } from 'lucide-react';

export default function SupportCreate() {
    const { data, setData, post, processing, errors } = useForm({
        subject: '',
        category: 'other',
        priority: 'medium',
        body: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/buyer/support');
    };

    return (
        <BuyerLayout>
            <Head title="Create Support Ticket" />

            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                        <Ticket size={20} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Open a Support Ticket</h1>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                value={data.subject}
                                onChange={e => setData('subject', e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                placeholder="Brief description of the issue"
                            />
                            {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                >
                                    <option value="account">Account Issue</option>
                                    <option value="order">Order Issue</option>
                                    <option value="payment">Payment/Refund</option>
                                    <option value="product">Product Issue</option>
                                    <option value="technical">Technical Bug</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={data.priority}
                                    onChange={e => setData('priority', e.target.value)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                                {errors.priority && <p className="text-red-600 text-sm mt-1">{errors.priority}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Describe the Issue</label>
                            <textarea
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                rows="6"
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                placeholder="Please provide as much detail as possible..."
                            ></textarea>
                            {errors.body && <p className="text-red-600 text-sm mt-1">{errors.body}</p>}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                            >
                                Submit Ticket
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </BuyerLayout>
    );
}
