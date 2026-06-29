import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import GovernmentLayout from '@/Layouts/GovernmentLayout';
import AdminBadge from '@/Components/Admin/AdminBadge';
import { ArrowLeft, CheckCircle, XCircle, ArrowUpCircle, Edit3 } from 'lucide-react';

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

export default function GovernmentProposalsShow({ proposal, profile }) {
  const [actionNote, setActionNote] = useState('');
  const { data, setData, post, processing, errors } = useForm({
    body: '',
    visibility: 'public',
  });

  const isNational = profile?.officer_level === 'national';
  const canAct = ['submitted', 'under_review'].includes(proposal.status);

  const doAction = (action) => {
    router.patch(`/government/proposals/${proposal.id}/status`, {
      action,
      note: actionNote,
    }, { preserveScroll: true });
  };

  const takeCharge = () => {
    router.post(`/government/proposals/${proposal.id}/take-charge`, {}, { preserveScroll: true });
  };

  const submitComment = (e) => {
    e.preventDefault();
    post(`/government/proposals/${proposal.id}/comment`, {
      preserveScroll: true,
      onSuccess: () => setData({ body: '', visibility: 'public' }),
    });
  };

  return (
    <GovernmentLayout title={proposal.title} subtitle={`#${proposal.proposal_number}`}>
      <Head title={proposal.title} />

      <div className="max-w-5xl">
        <Link href="/government/proposals" className="inline-flex items-center gap-1 text-sm text-[#0056B3] hover:underline mb-4">
          <ArrowLeft size={16} /> Retour à la file
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-bold text-[#002E5D]">{proposal.title}</h1>
                  <p className="text-sm text-slate-500 mt-1"><DivisionPath division={proposal.division} /></p>
                </div>
                <AdminBadge variant={proposal.status}>{proposal.status.replace(/_/g, ' ')}</AdminBadge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-slate-500">Citoyen</p>
                  <p className="font-medium">{proposal.user?.name}</p>
                  <p className="text-xs text-slate-400">{proposal.user?.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">Niveau actuel</p>
                  <p className="font-medium">{levelLabels[proposal.current_level] || '—'}</p>
                </div>
              </div>

              <p className="font-medium text-slate-700 mb-2">{proposal.summary}</p>
              <p className="text-slate-600 whitespace-pre-wrap text-sm">{proposal.body}</p>

              {proposal.documents?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium mb-2">Pièces jointes</p>
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
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-semibold text-[#002E5D] mb-4">Échanges</h2>
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {(proposal.comments || []).map((c) => (
                  <div key={c.id} className={`p-3 rounded-lg text-sm ${c.visibility === 'internal' ? 'bg-amber-50 border border-amber-100' : c.is_official ? 'bg-blue-50' : 'bg-slate-50'}`}>
                    <p className="font-medium">
                      {c.user?.name}
                      {c.is_official && <span className="text-blue-600 text-xs ml-1">(Officiel)</span>}
                      {c.visibility === 'internal' && <span className="text-amber-600 text-xs ml-1">(Interne)</span>}
                    </p>
                    <p className="text-slate-600 mt-1 whitespace-pre-wrap">{c.body}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={submitComment} className="space-y-3">
                <textarea
                  value={data.body}
                  onChange={(e) => setData('body', e.target.value)}
                  rows={3}
                  placeholder="Commentaire officiel..."
                  className="w-full border-gray-300 rounded-lg text-sm"
                />
                <div className="flex items-center gap-4">
                  <select
                    value={data.visibility}
                    onChange={(e) => setData('visibility', e.target.value)}
                    className="border-gray-300 rounded-lg text-sm"
                  >
                    <option value="public">Public (visible au citoyen)</option>
                    <option value="internal">Interne (agents uniquement)</option>
                  </select>
                  <button type="submit" disabled={processing} className="bg-[#002E5D] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                    Publier
                  </button>
                </div>
                {errors.body && <p className="text-red-600 text-sm">{errors.body}</p>}
              </form>
            </div>
          </div>

          {/* Actions panel */}
          <div className="space-y-4">
            {canAct && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-[#002E5D] mb-4">Actions</h3>

                {proposal.status === 'submitted' && !proposal.assigned_to && (
                  <button
                    onClick={takeCharge}
                    className="w-full mb-4 bg-[#0056B3] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#002E5D] transition"
                  >
                    Prendre en charge
                  </button>
                )}

                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={3}
                  placeholder="Note / justification (optionnel)"
                  className="w-full border-gray-300 rounded-lg text-sm mb-4"
                />

                <div className="space-y-2">
                  <button
                    onClick={() => doAction('approve')}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    <CheckCircle size={16} />
                    {isNational ? 'Approuver définitivement' : 'Recommander / Transmettre'}
                  </button>
                  {!isNational && (
                    <button
                      onClick={() => doAction('escalate')}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      <ArrowUpCircle size={16} />
                      Escalader au niveau supérieur
                    </button>
                  )}
                  <button
                    onClick={() => doAction('revision')}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition"
                  >
                    <Edit3 size={16} />
                    Demander une révision
                  </button>
                  <button
                    onClick={() => doAction('reject')}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                  >
                    <XCircle size={16} />
                    Rejeter
                  </button>
                </div>
              </div>
            )}

            {proposal.status_histories?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-[#002E5D] mb-3 text-sm">Historique</h3>
                <ol className="space-y-3">
                  {proposal.status_histories.map((h) => (
                    <li key={h.id} className="text-xs border-l-2 border-[#0056B3] pl-3">
                      <p className="font-medium">{h.to_status.replace(/_/g, ' ')}</p>
                      {h.note && <p className="text-slate-600 mt-0.5">{h.note}</p>}
                      <p className="text-slate-400 mt-1">{new Date(h.created_at).toLocaleString('fr-FR')}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </GovernmentLayout>
  );
}
