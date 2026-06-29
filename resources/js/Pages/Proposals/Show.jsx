import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import AdminBadge from '@/Components/Admin/AdminBadge';
import { ArrowLeft, Send, Clock } from 'lucide-react';

const levelLabels = {
  commune: 'Commune',
  territory: 'Territoire / Ville',
  provincial: 'Province',
  national: 'National',
};

function DivisionPath({ division }) {
  if (!division) return null;
  const parts = [];
  let current = division;
  while (current) {
    parts.unshift(current.name);
    current = current.parent;
  }
  return <span>{parts.join(' › ')}</span>;
}

export default function ProposalsShow({ proposal }) {
  const { data, setData, post, processing, errors } = useForm({ body: '' });

  const canSubmit = ['draft', 'revision_requested'].includes(proposal.status);
  const publicComments = (proposal.comments || []).filter((c) => c.visibility === 'public');

  const submitReply = (e) => {
    e.preventDefault();
    post(`/proposals/${proposal.id}/reply`, { preserveScroll: true, onSuccess: () => setData('body', '') });
  };

  return (
    <BuyerLayout title={proposal.title} subtitle={`#${proposal.proposal_number}`}>
      <Head title={proposal.title} />

      <div className="max-w-4xl mx-auto">
        <Link href="/proposals" className="inline-flex items-center gap-1 text-sm text-[#0056B3] hover:underline mb-4">
          <ArrowLeft size={16} /> Retour à mes propositions
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#002E5D]">{proposal.title}</h1>
              <p className="text-sm text-slate-500 mt-1">
                <DivisionPath division={proposal.division} />
              </p>
            </div>
            <AdminBadge variant={proposal.status}>{proposal.status.replace(/_/g, ' ')}</AdminBadge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
            <div>
              <p className="text-slate-500">Catégorie</p>
              <p className="font-medium capitalize">{proposal.category}</p>
            </div>
            <div>
              <p className="text-slate-500">Priorité</p>
              <p className="font-medium capitalize">{proposal.priority}</p>
            </div>
            <div>
              <p className="text-slate-500">Niveau actuel</p>
              <p className="font-medium">{levelLabels[proposal.current_level] || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500">Soumise le</p>
              <p className="font-medium">{proposal.submitted_at ? new Date(proposal.submitted_at).toLocaleDateString('fr-FR') : '—'}</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none mb-6">
            <p className="font-medium text-slate-700">{proposal.summary}</p>
            <p className="text-slate-600 whitespace-pre-wrap mt-3">{proposal.body}</p>
          </div>

          {proposal.documents?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-700 mb-2">Pièces jointes</p>
              <ul className="space-y-1">
                {proposal.documents.map((doc) => (
                  <li key={doc.id}>
                    <a href={`/storage/${doc.path}`} target="_blank" rel="noreferrer" className="text-[#0056B3] text-sm hover:underline">
                      {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {canSubmit && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Soumettre cette proposition aux autorités ?')) {
                  router.post(`/proposals/${proposal.id}/submit`);
                }
              }}
              className="inline-flex items-center gap-2 bg-[#0056B3] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#002E5D] transition"
            >
              <Send size={16} /> Soumettre aux autorités
            </button>
          )}
        </div>

        {/* Timeline */}
        {proposal.status_histories?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-[#002E5D] mb-4 flex items-center gap-2">
              <Clock size={18} /> Historique du traitement
            </h2>
            <ol className="space-y-4">
              {proposal.status_histories.map((h) => (
                <li key={h.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#0056B3] mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800">
                      {h.to_status.replace(/_/g, ' ')}
                      {h.to_level && ` — ${levelLabels[h.to_level] || h.to_level}`}
                    </p>
                    {h.note && <p className="text-slate-600 mt-0.5">{h.note}</p>}
                    <p className="text-xs text-slate-400 mt-1">
                      {h.user?.name} · {new Date(h.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-[#002E5D] mb-4">Échanges</h2>
          <div className="space-y-4 mb-6">
            {publicComments.length > 0 ? publicComments.map((c) => (
              <div key={c.id} className={`p-4 rounded-lg ${c.is_official ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50'}`}>
                <p className="text-sm font-medium text-slate-800">
                  {c.user?.name}
                  {c.is_official && <span className="ml-2 text-xs text-blue-600">(Officiel)</span>}
                </p>
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{c.body}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(c.created_at).toLocaleString('fr-FR')}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">Aucun échange pour le moment.</p>
            )}
          </div>

          <form onSubmit={submitReply} className="space-y-3">
            <textarea
              value={data.body}
              onChange={(e) => setData('body', e.target.value)}
              rows={3}
              placeholder="Ajouter un commentaire..."
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            />
            {errors.body && <p className="text-red-600 text-sm">{errors.body}</p>}
            <button
              type="submit"
              disabled={processing}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition disabled:opacity-50"
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </BuyerLayout>
  );
}
