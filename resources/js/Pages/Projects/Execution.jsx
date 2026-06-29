import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import ProjectWorkflowStepper from '@/Components/Projects/ProjectWorkflowStepper';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ProjectExecution({ project }) {
  const reportForm = useForm({ body: '', delay_justification: '', document: null });
  const finalForm = useForm({ body: '', lessons_learned: '', recommendations: '' });

  const overdueCount = project.tasks?.filter(t => ['overdue', 'delayed'].includes(t.status)).length || 0;
  const completedCount = project.tasks?.filter(t => t.status === 'completed').length || 0;
  const totalTasks = project.tasks?.length || 0;

  return (
    <BuyerLayout title="Exécution" subtitle={project.title}>
      <Head title={`Exécution — ${project.title}`} />

      <div className="max-w-5xl mx-auto space-y-6">
        <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-[#0056B3] hover:underline">
          <ArrowLeft size={16} /> Retour au projet
        </Link>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <ProjectWorkflowStepper currentStage="execution" />
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-sm">
            <span className="text-slate-600"><strong className="text-[#002E5D]">{completedCount}/{totalTasks}</strong> tâches terminées</span>
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                <AlertTriangle size={16} /> {overdueCount} en retard
              </span>
            )}
          </div>
        </div>

        {overdueCount > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-900 rounded-2xl px-5 py-4 text-sm">
            <AlertTriangle className="shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold">Tâches en retard — action requise</p>
              <p className="text-red-700/80 mt-0.5">Le responsable doit justifier tout retard ou le signaler avant l'échéance.</p>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {project.tasks?.map(task => {
            const isLate = ['overdue', 'delayed'].includes(task.status);
            const isDone = task.status === 'completed';
            return (
              <div key={task.id} className={`rounded-2xl border p-5 transition ${isLate ? 'border-red-400 bg-red-50/80 ring-2 ring-red-100' : isDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white shadow-sm'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className={`font-bold ${isLate ? 'text-red-800' : 'text-[#002E5D]'}`}>{task.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{task.responsible_name} · Échéance {task.planned_end}</p>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="text-emerald-600 shrink-0" size={22} />
                  ) : (
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${isLate ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-600'}`}>{task.status}</span>
                  )}
                </div>

                {!isDone && (
                  <div className="space-y-3 border-t border-slate-200/80 pt-4">
                    <textarea value={reportForm.data.body} onChange={e => reportForm.setData('body', e.target.value)} rows={2} className="w-full border-gray-300 rounded-xl text-sm" placeholder="Rapport partiel avec documentation..." />
                    {isLate && (
                      <textarea value={reportForm.data.delay_justification} onChange={e => reportForm.setData('delay_justification', e.target.value)} rows={2} className="w-full border-red-200 rounded-xl text-sm bg-white" placeholder="Justification du retard (obligatoire) *" />
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => reportForm.post(`/projects/${project.id}/tasks/${task.id}/report`, { forceFormData: true, preserveScroll: true, onSuccess: () => reportForm.reset() })}
                        className="px-4 py-2 bg-[#0056B3] text-white rounded-xl text-xs font-semibold hover:bg-[#002E5D]">
                        Soumettre rapport
                      </button>
                      <button onClick={() => router.post(`/projects/${project.id}/tasks/${task.id}/delay`, { reason: 'Retard anticipé signalé', reported_before_deadline: true }, { preserveScroll: true })}
                        className="px-4 py-2 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold hover:bg-amber-50">
                        Signaler retard à l'avance
                      </button>
                    </div>
                  </div>
                )}

                {task.reports?.map(r => (
                  <div key={r.id} className="mt-3 p-3 bg-white/80 rounded-xl text-xs border">
                    <p>{r.body}</p>
                    {!r.is_on_time && r.delay_justification && <p className="text-red-600 mt-1 font-medium">Retard : {r.delay_justification}</p>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {project.status === 'in_execution' && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-bold text-[#002E5D] mb-1">Rapport final du Project Manager</h3>
            <p className="text-sm text-slate-500 mb-4">Leçons tirées et propositions pour évaluation</p>
            <div className="space-y-3">
              <textarea value={finalForm.data.body} onChange={e => finalForm.setData('body', e.target.value)} rows={4} className="w-full border-gray-300 rounded-xl text-sm" placeholder="Synthèse du projet..." />
              <textarea value={finalForm.data.lessons_learned} onChange={e => finalForm.setData('lessons_learned', e.target.value)} rows={3} className="w-full border-gray-300 rounded-xl text-sm" placeholder="Leçons apprises *" />
              <textarea value={finalForm.data.recommendations} onChange={e => finalForm.setData('recommendations', e.target.value)} rows={2} className="w-full border-gray-300 rounded-xl text-sm" placeholder="Recommandations" />
              <button onClick={() => finalForm.post(`/projects/${project.id}/final-report`)} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">
                Soumettre pour évaluation
              </button>
            </div>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
