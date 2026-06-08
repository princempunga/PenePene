import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Settings, Save } from 'lucide-react';

export default function SettingsIndex({ settings }) {
    const { flash } = usePage().props;
    
    // settings is a grouped collection from Laravel
    // Convert it to a flat form state
    const initialState = {};
    Object.keys(settings).forEach(group => {
        settings[group].forEach(setting => {
            initialState[setting.key] = setting.value || '';
        });
    });

    const { data, setData, post, processing } = useForm({
        settings: initialState
    });

    const handleChange = (key, value) => {
        setData('settings', { ...data.settings, [key]: value });
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/settings');
    };

    return (
        <AdminLayout>
            <Head title="Platform Settings" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                    <p className="text-gray-500 mt-1">Manage global platform configurations and variables.</p>
                </div>
                <button
                    onClick={submit}
                    disabled={processing}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-primary-700 transition shadow-md shadow-primary-600/20 disabled:opacity-50"
                >
                    <Save size={18} /> Save Settings
                </button>
            </div>

            {flash?.success && (
                <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                    {flash.success}
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {Object.keys(settings).map(group => (
                    <div key={group} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-900 capitalize flex items-center gap-2">
                                <Settings size={18} className="text-gray-400" />
                                {group} Settings
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {settings[group].map(setting => (
                                    <div key={setting.id}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {setting.label || setting.key}
                                        </label>
                                        
                                        {setting.type === 'boolean' ? (
                                            <select
                                                value={data.settings[setting.key]}
                                                onChange={e => handleChange(setting.key, e.target.value)}
                                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            >
                                                <option value="1">Enabled</option>
                                                <option value="0">Disabled</option>
                                            </select>
                                        ) : setting.type === 'integer' ? (
                                            <input
                                                type="number"
                                                value={data.settings[setting.key]}
                                                onChange={e => handleChange(setting.key, e.target.value)}
                                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={data.settings[setting.key]}
                                                onChange={e => handleChange(setting.key, e.target.value)}
                                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            />
                                        )}
                                        <p className="text-xs text-gray-400 mt-1 font-mono">Key: {setting.key}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
