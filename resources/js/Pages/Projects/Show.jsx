import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import ProjectStatusBadge from '@/Components/Projects/ProjectStatusBadge';
import ProjectWorkflowStepper from '@/Components/Projects/ProjectWorkflowStepper';
import ProjectCompletionChecklist from '@/Components/Projects/ProjectCompletionChecklist';
import { formatCurrency, stageLabel } from '@/lib/projectUi';
import { ArrowLeft, Edit, Play, Send, MapPin } from 'lucide-react';

export default function ProjectShow({ project, checklist = [] }) {
  const canEdit = ['draft', 'revision_requested'].includes(project.status);
  const canExecute = ['approved', 'tutelage_pending', 'in_execution', 'completed'].includes(project.status);

  return (
    <BuyerLayout title={project.title} subtitle={`#${project.project_number}`}>
      <Head title={project.title} />

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-[#0056B3] hover:underline">
            <ArrowLeft size={16} /> Mes projets
          </Link>
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Link href={`/projects/${project.id}/edit`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">
                <Edit size={15} /> Modifier
              </Link>
            )}
            {canEdit && (
              <button onClick={() => router.post(`/projects/${project.id}/submit-experts`)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0056B3] text-white text-sm font-medium hover:bg-[#002E5D]">
                <Send size={15} /> Soumettre aux experts
              </button>
            )}
            {canExecute && (
              <Link href={`/projects/${project.id}/execution`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                <Play size={15} /> Suivi exécution
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#002E5D]/5 to-[#0056B3]/5 px-6 pt-6 pb-2 border-b">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#002E5D]">{project.title}</h1>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><MapPin size={14} /> {project.division?.name} · {stageLabel(project.stage)}</p>
              </div>
              <ProjectStatusBadge status={project.status} />
            </div>
            <ProjectWorkflowStepper currentStage={project.stage} />
          </div>

          <div className="p-6 space-y-6">
            {canEdit && checklist.length > 0 && (
              <ProjectCompletionChecklist checklist={checklist} />
            )}

            {project.expert_review_deadline && project.status === 'submitted_experts' && (
              <div className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                Délai légal de réponse des experts : <strong>{new Date(project.expert_review_deadline).toLocaleDateString('fr-FR')}</strong>
              </div>
            )}

            <Section title="Intérêts du projet">
              {project.interests?.map(i => (
                <p key={i.id} className="text-sm mb-2 pl-3 border-l-2 border-[#0056B3]/30">
                  <span className="font-semibold text-[#002E5D]">{i.type === 'primary' ? 'Principal' : 'Secondaire'} — </span>
                  {i.description}
                </p>
              ))}
            </Section>

            {project.budget && (
              <Section title="Budget estimatif">
                {project.budget.creator_unsure ? (
                  <p className="text-sm text-slate-500 italic">Estimation confiée au groupe d'experts</p>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-[#002E5D]">{formatCurrency(project.budget.total_estimated, project.budget.currency)}</p>
                    <p className="text-xs text-slate-500 mt-1">Imprévus {project.budget.contingency_rate}% inclus</p>
                    {project.budget.approved_amount && <p className="text-sm text-emerald-700 font-medium mt-2">Approuvé : {formatCurrency(project.budget.approved_amount, project.budget.currency)}</p>}
                    <ul className="mt-3 space-y-1">{project.budget.lines?.map(l => (
                      <li key={l.id} className="text-sm flex justify-between border-b border-slate-200/60 pb-1"><span>{l.label}</span><span className="font-medium">{formatCurrency(l.amount, project.budget.currency)}</span></li>
                    ))}</ul>
                  </div>
                )}
              </Section>
            )}

            <Section title="Tâches & calendrier">
              <div className="space-y-2">
                {project.tasks?.map(t => (
                  <div key={t.id} className={`p-4 rounded-xl border text-sm ${['overdue', 'delayed'].includes(t.status) ? 'border-red-300 bg-red-50 ring-1 ring-red-100' : 'border-slate-200 bg-white'}`}>
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold text-[#002E5D]">{t.title}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${['overdue', 'delayed'].includes(t.status) ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-600'}`}>{t.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{t.responsible_name} · {t.planned_start} → {t.planned_end} · {t.step_mode}</p>
                  </div>
                ))}
              </div>
            </Section>

            <div className="grid sm:grid-cols-2 gap-4">
              <Section title="Matériels">
                <ul className="text-sm space-y-1.5">{project.materials?.map(m => (
                  <li key={m.id} className="flex justify-between"><span>{m.name}</span><span className="text-slate-500 text-xs">{m.source === 'existing' ? 'sur place' : 'import'} ×{m.quantity}</span></li>
                ))}</ul>
              </Section>
              <Section title="Personnels">
                <ul className="text-sm space-y-1.5">{project.personnel?.map(p => (
                  <li key={p.id} className="flex justify-between"><span>{p.role_title}</span><span className="text-slate-500 text-xs">{p.source === 'local' ? 'local' : 'expatrié'} ×{p.count}</span></li>
                ))}</ul>
              </Section>
            </div>

            {project.expert_reviews?.length > 0 && (
              <Section title="Avis du groupe d'experts">
                {project.expert_reviews.map(r => (
                  <div key={r.id} className="rounded-xl border-l-4 border-[#0056B3] bg-blue-50/50 p-3 mb-2 text-sm">
                    <p className="font-semibold capitalize">{r.decision?.replace(/_/g, ' ')} — {r.expert?.name}</p>
                    {r.correction_notes && <p className="text-slate-600 mt-1">{r.correction_notes}</p>}
                  </div>
                ))}
              </Section>
            )}
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wider text-[#002E5D]/70 mb-3">{title}</h2>
      {children}
    </div>
  );
}
