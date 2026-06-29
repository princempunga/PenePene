import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import DivisionPicker from '@/Components/Government/DivisionPicker';
import { FileText } from 'lucide-react';

export default function ProposalsCreate({ provinces, categories }) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    summary: '',
    body: '',
    category: 'other',
    priority: 'medium',
    division_id: null,
    documents: [],
    submit_now: false,
  });

  const submit = (e, submitNow = false) => {
    e.preventDefault();
    router.post('/proposals', { ...data, submit_now: submitNow }, { forceFormData: true });
  };

  return (
    <BuyerLayout title="Nouvelle proposition" subtitle="Soumission citoyenne">
      <Head title="Nouvelle proposition" />

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Soumettre une proposition</h1>
            <p className="text-sm text-slate-500">Votre proposition sera routée selon la hiérarchie administrative RDC.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Titre de votre proposition"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Résumé *</label>
              <textarea
                value={data.summary}
                onChange={(e) => setData('summary', e.target.value)}
                rows={2}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Résumé en quelques phrases"
              />
              {errors.summary && <p className="text-red-600 text-sm mt-1">{errors.summary}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description détaillée *</label>
              <textarea
                value={data.body}
                onChange={(e) => setData('body', e.target.value)}
                rows={8}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Décrivez le problème, la solution proposée et l'impact attendu..."
              />
              {errors.body && <p className="text-red-600 text-sm mt-1">{errors.body}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={data.category}
                  onChange={(e) => setData('category', e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  value={data.priority}
                  onChange={(e) => setData('priority', e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Localisation administrative *</label>
              <DivisionPicker
                provinces={provinces}
                value={data.division_id}
                onChange={(id) => setData('division_id', id)}
                error={errors.division_id}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pièces jointes (PDF, images — max 5)</label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setData('documents', Array.from(e.target.files || []))}
                className="w-full text-sm text-slate-600"
              />
              {errors.documents && <p className="text-red-600 text-sm mt-1">{errors.documents}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={processing}
                onClick={(e) => submit(e, false)}
                className="px-6 py-2 rounded-lg font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Enregistrer brouillon
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={(e) => submit(e, true)}
                className="bg-[#0056B3] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#002E5D] transition disabled:opacity-50"
              >
                Soumettre aux autorités
              </button>
            </div>
          </form>
        </div>
      </div>
    </BuyerLayout>
  );
}
