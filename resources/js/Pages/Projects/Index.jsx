import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import AdminStatCard from '@/Components/Admin/AdminStatCard';
import ProjectStatusBadge from '@/Components/Projects/ProjectStatusBadge';
import { FolderKanban, Plus, Archive, Clock, Play, AlertTriangle } from 'lucide-react';
import { statusLabel } from '@/lib/projectUi';

const FILTER_STATUSES = [
  { value: 'all', label: 'Tous' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'submitted_experts', label: 'Chez experts' },
  { value: 'revision_requested', label: 'Corrections' },
  { value: 'approved', label: 'Approuvés' },
  { value: 'in_execution', label: 'En cours' },
  { value: 'completed', label: 'Terminés' },
];

export default function ProjectsIndex({ projects, filters, stats = {} }) {
  const list = projects.data || [];
  const counts = {
    draft: stats.draft ?? 0,
    active: stats.active ?? 0,
    overdue: stats.overdue ?? 0,
  };

  return (
    <BuyerLayout title="Mes projets" subtitle="Participation citoyenne · RDC">
      <Head title="Mes projets" />

      <div className="rounded-2xl border border-[#0056B3]/15 bg-gradient-to-r from-[#002E5D] to-[#0056B3] p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[#FFB300] text-[10px] font-bold uppercase tracking-widest">Plateforme gouvernementale</p>
            <h2 className="text-lg font-bold mt-1">Concevez et suivez vos projets</h2>
            <p className="text-blue-100/75 text-sm mt-1 max-w-xl">De la conception à l'évaluation, en passant par les experts, la tutelle budgétaire et l'exécution.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href="/projects/archive" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium backdrop-blur-sm transition">
              <Archive size={16} /> Archives
            </Link>
            <Link href="/projects/create" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFB300] text-[#002E5D] text-sm font-bold hover:bg-[#F9A825] transition shadow-lg">
              <Plus size={18} /> Nouveau projet
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard label="Brouillons" value={counts.draft} icon={FolderKanban} tone="blue" />
        <AdminStatCard label="En cours de traitement" value={counts.active} icon={Play} tone="gold" />
        <AdminStatCard label="Tâches en retard" value={counts.overdue} icon={AlertTriangle} tone="navy" />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_STATUSES.map(({ value, label }) => (
          <Link key={value} href={value === 'all' ? '/projects' : `/projects?status=${value}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              (filters.status || 'all') === value
                ? 'bg-[#0056B3] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0056B3]/30'
            }`}>
            {label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {list.length ? (
          <ul className="divide-y divide-slate-100">
            {list.map((p) => {
              const overdue = p.tasks?.filter(t => ['overdue', 'delayed'].includes(t.status)).length || 0;
              return (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="block px-5 sm:px-6 py-4 hover:bg-blue-50/40 transition group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#002E5D] group-hover:text-[#0056B3] transition truncate">{p.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">#{p.project_number} · {p.division?.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {overdue > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-red-700 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-red-200">
                              <AlertTriangle size={11} /> {overdue} retard
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={11} /> {statusLabel(p.status)}
                          </span>
                        </div>
                      </div>
                      <ProjectStatusBadge status={p.status} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-20 text-center px-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0056B3] mb-4">
              <FolderKanban size={32} />
            </div>
            <p className="font-semibold text-[#002E5D]">Aucun projet</p>
            <p className="text-sm text-slate-500 mt-1 mb-5">Créez votre premier projet citoyen en 5 étapes guidées.</p>
            <Link href="/projects/create" className="inline-flex items-center gap-2 bg-[#0056B3] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#002E5D]">
              <Plus size={18} /> Commencer
            </Link>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
