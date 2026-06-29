import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import DivisionPicker from '@/Components/Government/DivisionPicker';
import ProjectWorkflowStepper from '@/Components/Projects/ProjectWorkflowStepper';
import ProjectCompletionChecklist from '@/Components/Projects/ProjectCompletionChecklist';
import { FileText, ChevronRight } from 'lucide-react';

const TABS = [
  { id: 'general', label: '1. Intitulé & Intérêts' },
  { id: 'budget', label: '2. Budget' },
  { id: 'tasks', label: '3. Tâches & Calendrier' },
  { id: 'resources', label: '4. Matériels & Personnels' },
  { id: 'constraints', label: '5. Durée & Contraintes' },
];

const STEP_MODES = {
  successive: 'Successives', simultaneous: 'Simultanées', concurrent: 'Concomitantes',
  synchronous: 'Synchrones', cumulative: 'Cumulatives',
};

const emptyTask = () => ({ title: '', description: '', importance: 'medium', duration_days: '', planned_start: '', planned_end: '', step_mode: 'successive', responsible_name: '', members: [{ member_name: '', role: '' }] });
const emptyLine = () => ({ label: '', amount: '', category: '', notes: '' });
const emptyConstraint = () => ({ type: 'manageable', description: '', solutions: [{ description: '', status: 'planned' }] });

function buildInitial(project) {
  if (!project) {
    return {
      title: '', division_id: null, category: 'other',
      planned_duration_days: '', planned_start_date: '', planned_end_date: '',
      interests: [{ type: 'primary', description: '' }, { type: 'secondary', description: '' }],
      budget: { contingency_rate: 10, creator_unsure: false, currency: 'CDF', defined_by: 'creator', internal_expert_notes: '', external_expert_notes: '', lines: [emptyLine()] },
      tasks: [emptyTask()],
      materials: [{ name: '', quantity: 1, unit: '', source: 'existing', notes: '' }],
      personnel: [{ role_title: '', count: 1, source: 'local', notes: '' }],
      constraints: [emptyConstraint()],
      submit_experts: false,
    };
  }
  return {
    title: project.title, division_id: project.division_id, category: project.category,
    planned_duration_days: project.planned_duration_days || '',
    planned_start_date: project.planned_start_date?.slice(0, 10) || '',
    planned_end_date: project.planned_end_date?.slice(0, 10) || '',
    interests: project.interests?.length ? project.interests : [{ type: 'primary', description: '' }],
    budget: project.budget ? {
      ...project.budget, lines: project.budget.lines?.length ? project.budget.lines : [emptyLine()],
    } : { contingency_rate: 10, creator_unsure: false, currency: 'CDF', lines: [emptyLine()] },
    tasks: project.tasks?.length ? project.tasks.map(t => ({ ...t, members: t.members?.length ? t.members : [{ member_name: '', role: '' }] })) : [emptyTask()],
    materials: project.materials?.length ? project.materials : [{ name: '', quantity: 1, unit: '', source: 'existing' }],
    personnel: project.personnel?.length ? project.personnel : [{ role_title: '', count: 1, source: 'local' }],
    constraints: project.constraints?.length ? project.constraints.map(c => ({ ...c, solutions: c.solutions?.length ? c.solutions : [{ description: '' }] })) : [emptyConstraint()],
    submit_experts: false,
  };
}

export default function ProjectForm({ project, provinces, options, checklist = [] }) {
  const [tab, setTab] = useState('general');
  const { data, setData, processing, errors } = useForm(buildInitial(project));

  const set = (key, val) => setData(key, val);
  const updateList = (key, idx, field, val) => {
    const list = [...data[key]];
    list[idx] = { ...list[idx], [field]: val };
    set(key, list);
  };

  const submit = (submitExperts = false) => {
    const url = project ? `/projects/${project.id}` : '/projects';
    const method = project ? 'put' : 'post';
    router[method](url, { ...data, submit_experts: submitExperts });
  };

  return (
    <BuyerLayout title={project ? 'Modifier le projet' : 'Nouveau projet'} subtitle="Conception citoyenne">
      <Head title={project ? 'Modifier le projet' : 'Nouveau projet'} />

      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border bg-white p-4 sm:p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#0056B3]/10 flex items-center justify-center text-[#0056B3]">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFB300]">Conception du projet</p>
              <p className="text-sm text-slate-500">Remplissez chaque section avant soumission aux experts</p>
            </div>
          </div>
          <ProjectWorkflowStepper currentStage="design" compact />
          {checklist.length > 0 && (
            <div className="mt-4">
              <ProjectCompletionChecklist checklist={checklist} compact />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((t, idx) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                tab === t.id ? 'bg-[#0056B3] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0056B3]/30'
              }`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${tab === t.id ? 'bg-white/20' : 'bg-slate-100'}`}>{idx + 1}</span>
              {t.label.replace(/^\d+\.\s*/, '')}
              {tab !== t.id && <ChevronRight size={14} className="opacity-40" />}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">

          {tab === 'general' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Intitulé du projet *</label>
                <input value={data.title} onChange={e => set('title', e.target.value)} className="w-full border-gray-300 rounded-lg" placeholder="Titre officiel du projet" />
                {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
              </div>
              <DivisionPicker provinces={provinces} value={data.division_id} onChange={v => set('division_id', v)} error={errors.division_id} />
              <div>
                <label className="block text-sm font-medium mb-2">Intérêt principal *</label>
                <textarea value={data.interests.find(i => i.type === 'primary')?.description || data.interests[0]?.description || ''}
                  onChange={e => {
                    const interests = [...data.interests];
                    const idx = interests.findIndex(i => i.type === 'primary');
                    if (idx >= 0) interests[idx].description = e.target.value;
                    else interests.unshift({ type: 'primary', description: e.target.value });
                    set('interests', interests);
                  }} rows={3} className="w-full border-gray-300 rounded-lg" placeholder="Intérêt principal du projet pour la communauté" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Intérêts secondaires</label>
                {data.interests.filter(i => i.type === 'secondary').map((interest, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input value={interest.description} onChange={e => {
                      const interests = data.interests.map((i, j) => i.type === 'secondary' && j === data.interests.indexOf(interest) ? { ...i, description: e.target.value } : i);
                      set('interests', interests);
                    }} className="flex-1 border-gray-300 rounded-lg text-sm" placeholder={`Intérêt secondaire ${idx + 1}`} />
                  </div>
                ))}
                <button type="button" onClick={() => set('interests', [...data.interests, { type: 'secondary', description: '' }])}
                  className="text-sm text-[#0056B3] hover:underline">+ Ajouter un intérêt secondaire</button>
              </div>
            </>
          )}

          {tab === 'budget' && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={data.budget.creator_unsure} onChange={e => set('budget', { ...data.budget, creator_unsure: e.target.checked })} />
                Je n'ai pas d'estimation — les experts s'en occupent
              </label>
              {!data.budget.creator_unsure && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Imprévus (%)</label>
                      <input type="number" value={data.budget.contingency_rate} onChange={e => set('budget', { ...data.budget, contingency_rate: e.target.value })} className="w-full border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Devise</label>
                      <input value={data.budget.currency} onChange={e => set('budget', { ...data.budget, currency: e.target.value })} className="w-full border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Le budget sera discuté par les experts internes (concepteur, ministère, province) et externes (Budget, ministères concernés).</p>
                  {data.budget.lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg">
                      <input placeholder="Poste budgétaire" value={line.label} onChange={e => { const lines = [...data.budget.lines]; lines[idx].label = e.target.value; set('budget', { ...data.budget, lines }); }} className="border-gray-300 rounded-lg text-sm" />
                      <input type="number" placeholder="Montant" value={line.amount} onChange={e => { const lines = [...data.budget.lines]; lines[idx].amount = e.target.value; set('budget', { ...data.budget, lines }); }} className="border-gray-300 rounded-lg text-sm" />
                      <input placeholder="Catégorie" value={line.category} onChange={e => { const lines = [...data.budget.lines]; lines[idx].category = e.target.value; set('budget', { ...data.budget, lines }); }} className="border-gray-300 rounded-lg text-sm" />
                    </div>
                  ))}
                  <button type="button" onClick={() => set('budget', { ...data.budget, lines: [...data.budget.lines, emptyLine()] })} className="text-sm text-[#0056B3]">+ Ligne budgétaire</button>
                </>
              )}
              <div>
                <label className="text-sm font-medium">Notes experts internes</label>
                <textarea value={data.budget.internal_expert_notes || ''} onChange={e => set('budget', { ...data.budget, internal_expert_notes: e.target.value })} rows={2} className="w-full border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">Notes experts externes (Budget, ministères)</label>
                <textarea value={data.budget.external_expert_notes || ''} onChange={e => set('budget', { ...data.budget, external_expert_notes: e.target.value })} rows={2} className="w-full border-gray-300 rounded-lg text-sm" />
              </div>
            </>
          )}

          {tab === 'tasks' && (
            <>
              <p className="text-sm text-slate-500">Répartition des tâches selon attributions et compétences, avec calendrier et mode d'exécution.</p>
              {data.tasks.map((task, idx) => (
                <div key={idx} className="border rounded-xl p-4 space-y-3">
                  <input value={task.title} onChange={e => updateList('tasks', idx, 'title', e.target.value)} placeholder="Titre de la tâche *" className="w-full border-gray-300 rounded-lg font-medium" />
                  <textarea value={task.description || ''} onChange={e => updateList('tasks', idx, 'description', e.target.value)} placeholder="Description" rows={2} className="w-full border-gray-300 rounded-lg text-sm" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <select value={task.importance} onChange={e => updateList('tasks', idx, 'importance', e.target.value)} className="border-gray-300 rounded-lg text-sm">
                      <option value="low">Importance faible</option><option value="medium">Moyenne</option><option value="high">Forte</option>
                    </select>
                    <select value={task.step_mode} onChange={e => updateList('tasks', idx, 'step_mode', e.target.value)} className="border-gray-300 rounded-lg text-sm">
                      {Object.entries(STEP_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <input type="number" placeholder="Durée (jours)" value={task.duration_days} onChange={e => updateList('tasks', idx, 'duration_days', e.target.value)} className="border-gray-300 rounded-lg text-sm" />
                    <input placeholder="Responsable" value={task.responsible_name} onChange={e => updateList('tasks', idx, 'responsible_name', e.target.value)} className="border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={task.planned_start?.slice?.(0, 10) || task.planned_start || ''} onChange={e => updateList('tasks', idx, 'planned_start', e.target.value)} className="border-gray-300 rounded-lg text-sm" />
                    <input type="date" value={task.planned_end?.slice?.(0, 10) || task.planned_end || ''} onChange={e => updateList('tasks', idx, 'planned_end', e.target.value)} className="border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Équipe d'exécution</p>
                    {(task.members || []).map((m, mi) => (
                      <div key={mi} className="flex gap-2 mb-1">
                        <input value={m.member_name} placeholder="Membre" onChange={e => { const tasks = [...data.tasks]; tasks[idx].members[mi].member_name = e.target.value; set('tasks', tasks); }} className="flex-1 border-gray-300 rounded-lg text-sm" />
                        <input value={m.role || ''} placeholder="Rôle" onChange={e => { const tasks = [...data.tasks]; tasks[idx].members[mi].role = e.target.value; set('tasks', tasks); }} className="w-32 border-gray-300 rounded-lg text-sm" />
                      </div>
                    ))}
                    <button type="button" onClick={() => { const tasks = [...data.tasks]; tasks[idx].members.push({ member_name: '', role: '' }); set('tasks', tasks); }} className="text-xs text-[#0056B3]">+ Membre</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => set('tasks', [...data.tasks, emptyTask()])} className="text-sm text-[#0056B3]">+ Ajouter une tâche</button>
            </>
          )}

          {tab === 'resources' && (
            <>
              <h3 className="font-semibold text-[#002E5D]">Matériels nécessaires</h3>
              {data.materials.map((m, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2">
                  <input value={m.name} placeholder="Matériel" onChange={e => updateList('materials', idx, 'name', e.target.value)} className="border-gray-300 rounded-lg text-sm col-span-2" />
                  <select value={m.source} onChange={e => updateList('materials', idx, 'source', e.target.value)} className="border-gray-300 rounded-lg text-sm">
                    <option value="existing">Existant sur place</option><option value="import">À importer</option>
                  </select>
                  <input type="number" value={m.quantity} onChange={e => updateList('materials', idx, 'quantity', e.target.value)} className="border-gray-300 rounded-lg text-sm" />
                </div>
              ))}
              <button type="button" onClick={() => set('materials', [...data.materials, { name: '', quantity: 1, source: 'existing' }])} className="text-sm text-[#0056B3]">+ Matériel</button>

              <h3 className="font-semibold text-[#002E5D] pt-4">Personnels participants</h3>
              {data.personnel.map((p, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <input value={p.role_title} placeholder="Fonction" onChange={e => updateList('personnel', idx, 'role_title', e.target.value)} className="border-gray-300 rounded-lg text-sm col-span-2" />
                  <select value={p.source} onChange={e => updateList('personnel', idx, 'source', e.target.value)} className="border-gray-300 rounded-lg text-sm">
                    <option value="local">Personnel local</option><option value="expatriate">Expert expatrié</option>
                  </select>
                </div>
              ))}
              <button type="button" onClick={() => set('personnel', [...data.personnel, { role_title: '', count: 1, source: 'local' }])} className="text-sm text-[#0056B3]">+ Personnel</button>
            </>
          )}

          {tab === 'constraints' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-sm font-medium">Durée totale (jours)</label>
                  <input type="number" value={data.planned_duration_days} onChange={e => set('planned_duration_days', e.target.value)} className="w-full border-gray-300 rounded-lg" /></div>
                <div><label className="text-sm font-medium">Début prévu</label>
                  <input type="date" value={data.planned_start_date} onChange={e => set('planned_start_date', e.target.value)} className="w-full border-gray-300 rounded-lg" /></div>
                <div><label className="text-sm font-medium">Fin prévue</label>
                  <input type="date" value={data.planned_end_date} onChange={e => set('planned_end_date', e.target.value)} className="w-full border-gray-300 rounded-lg" /></div>
              </div>
              <p className="text-xs text-slate-500">Des rappels automatiques seront envoyés avant chaque échéance. Les tâches en retard s'affichent en rouge.</p>

              <h3 className="font-semibold text-[#002E5D]">Contraintes & Solutions</h3>
              {data.constraints.map((c, idx) => (
                <div key={idx} className="border rounded-xl p-4 space-y-2">
                  <select value={c.type} onChange={e => updateList('constraints', idx, 'type', e.target.value)} className="border-gray-300 rounded-lg text-sm">
                    <option value="inevitable">Contrainte inévitable (naturelle)</option>
                    <option value="manageable">Contrainte imprévue mais manageable</option>
                  </select>
                  <textarea value={c.description} onChange={e => updateList('constraints', idx, 'description', e.target.value)} placeholder="Description de la contrainte" rows={2} className="w-full border-gray-300 rounded-lg text-sm" />
                  {(c.solutions || []).map((s, si) => (
                    <input key={si} value={s.description} placeholder="Solution envisagée" onChange={e => {
                      const constraints = [...data.constraints]; constraints[idx].solutions[si].description = e.target.value; set('constraints', constraints);
                    }} className="w-full border-gray-300 rounded-lg text-sm" />
                  ))}
                  <button type="button" onClick={() => { const constraints = [...data.constraints]; constraints[idx].solutions.push({ description: '', status: 'planned' }); set('constraints', constraints); }} className="text-xs text-[#0056B3]">+ Solution</button>
                </div>
              ))}
              <button type="button" onClick={() => set('constraints', [...data.constraints, emptyConstraint()])} className="text-sm text-[#0056B3]">+ Contrainte</button>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" disabled={processing} onClick={() => submit(false)} className="px-6 py-2 rounded-lg border font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Enregistrer brouillon</button>
            <button type="button" disabled={processing} onClick={() => submit(true)} className="px-6 py-2 rounded-lg bg-[#0056B3] text-white font-medium hover:bg-[#002E5D] disabled:opacity-50">Soumettre aux experts</button>
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}
