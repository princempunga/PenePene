import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';

export default function SponsoredCreate({ products }) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        placement: 'homepage_banner',
        starts_at: '',
        expires_at: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/seller/sponsored');
    };

    return (
        <SellerLayout>
            <Head title="Nouvelle campagne sponsorisée" />

            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Créer une campagne sponsorisée</h1>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sélectionner un produit</label>
                            <select
                                value={data.product_id}
                                onChange={e => setData('product_id', e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="">— Choisir un produit —</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.product_id && <p className="text-red-600 text-sm mt-1">{errors.product_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
                            <select
                                value={data.placement}
                                onChange={e => setData('placement', e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="homepage_banner">Bannière page d&apos;accueil</option>
                                <option value="product_of_day">Produit du jour</option>
                                <option value="product_of_week">Produit de la semaine</option>
                                <option value="featured_listing">Annonce en vedette (haut de recherche)</option>
                                <option value="category_top">Haut de catégorie</option>
                            </select>
                            {errors.placement && <p className="text-red-600 text-sm mt-1">{errors.placement}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                                <input
                                    type="date"
                                    value={data.starts_at}
                                    onChange={e => setData('starts_at', e.target.value)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                {errors.starts_at && <p className="text-red-600 text-sm mt-1">{errors.starts_at}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                                <input
                                    type="date"
                                    value={data.expires_at}
                                    onChange={e => setData('expires_at', e.target.value)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                {errors.expires_at && <p className="text-red-600 text-sm mt-1">{errors.expires_at}</p>}
                            </div>
                        </div>

                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-4">
                            <strong>Note :</strong> Les demandes de campagne sont examinées manuellement par les administrateurs de la plateforme. Les instructions de paiement vous seront communiquées après approbation.
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                            >
                                {processing ? 'Envoi en cours…' : 'Soumettre la demande'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
}
