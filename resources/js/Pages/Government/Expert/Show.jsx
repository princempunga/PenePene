import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import GovernmentLayout from '@/Layouts/GovernmentLayout';
import { ArrowLeft, CheckCircle, XCircle, Edit3 } from 'lucide-react';

export default function ExpertShow({ project }) {
  const [notes, setNotes] = useState('');
  const [approvedBudget, setApprovedBudget] = useState(project.budget?.total_estimated || '');

  const review = (action) => router.post(`/government/expert/projects/${project.id}/review`, { action, notes, approved_budget: approvedBudget });

  return (
    <GovernmentLayout title={project.title} subtitle="Revue expert">
      <Head title={project.title} />
      <Link href="/government/expert/projects" className="inline-flex items-center gap-1 text-sm text-[#0056B3] mb-4 hover:underline"><ArrowLeft size={16} /> File experts</Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6 space-y-4 text-sm">
          <h2 className="font-bold text-[#002E5D]">{project.title}</h2>
          <p><strong>Concepteur :</strong> {project.user?.name}</p>
          {project.interests?.map(i => <p key={i.id}><strong>{i.type} :</strong> {i.description}</p>)}
          {project.budget?.creator_unsure ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <strong>Budget (c.iii) :</strong> le concepteur n&apos;a pas fourni d&apos;estimation — les experts doivent établir le budget approuvé.
            </div>
          ) : project.budget ? (
            <div><strong>Budget estimé :</strong> {Number(project.budget.total_estimated).toLocaleString()} {project.budget.currency}
              <ul className="ml-4 mt-1">{project.budget.lines?.map(l => <li key={l.id}>{l.label}: {Number(l.amount).toLocaleString()}</li>)}</ul>
            </div>
          ) : null}
          <div><strong>Tâches ({project.tasks?.length})</strong>
            {project.tasks?.map(t => <p key={t.id} className="ml-2">• {t.title} — {t.responsible_name} ({t.planned_start} → {t.planned_end})</p>)}
          </div>
          <div><strong>Contraintes</strong>
            {project.constraints?.map(c => <p key={c.id} className="ml-2">• [{c.type}] {c.description}</p>)}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5 space-y-3">
          <h3 className="font-semibold text-[#002E5D]">Décision</h3>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full border-gray-300 rounded-lg text-sm" placeholder="Commentaires / corrections..." />
          <label className="block text-xs font-medium text-slate-600">
            Budget approuvé (CDF) {project.budget?.creator_unsure && <span className="text-red-600">* obligatoire</span>}
          </label>
          <input type="number" value={approvedBudget} onChange={e => setApprovedBudget(e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" placeholder={project.budget?.creator_unsure ? 'Budget établi par les experts' : 'Budget approuvé (CDF)'} />
          <button onClick={() => review('approve')} className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"><CheckCircle size={16} /> Approuver</button>
          <button onClick={() => review('revision')} className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium"><Edit3 size={16} /> Renvoyer pour correction</button>
          <button onClick={() => review('reject')} className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"><XCircle size={16} /> Rejeter</button>
        </div>
      </div>
    </GovernmentLayout>
  );
}
