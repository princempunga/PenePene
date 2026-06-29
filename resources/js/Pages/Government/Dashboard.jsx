import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GovernmentLayout from '@/Layouts/GovernmentLayout';
import AdminStatCard from '@/Components/Admin/AdminStatCard';
import ProjectStatusBadge from '@/Components/Projects/ProjectStatusBadge';
import { ClipboardCheck, Play, Landmark, AlertTriangle, MapPin, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/projectUi';

const levelLabels = {
  commune: 'Commune', territory: 'Territoire / Ville', provincial: 'Province', national: 'National',
};

export default function GovernmentDashboard({ stats, recentProjects }) {
  return (
    <GovernmentLayout title="Tableau de bord" subtitle="Plateforme projets citoyens — RDC">
      <Head title="Gouvernance RDC" />

      <div className="rounded-2xl border border-[#0056B3]/15 bg-gradient-to-br from-[#002E5D] to-[#0056B3] p-6 text-white shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[#FFB300] text-xs font-bold uppercase tracking-widest mb-1">République Démocratique du Congo</p>
            <h2 className="text-xl font-bold">Gestion du cycle de vie des projets</h2>
            <p className="text-blue-100/80 text-sm mt-1">Conception → Experts → Tutelle → Exécution → Évaluation</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
            <MapPin className="text-[#FFB300] shrink-0" size={22} />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-blue-200">Juridiction</p>
              <p className="font-semibold">{stats.division || 'Nationale'}</p>
              <p className="text-xs text-blue-200">{levelLabels[stats.my_level] || stats.my_level}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <AdminStatCard label="File experts" value={stats.expert_queue} icon={ClipboardCheck} tone="blue" />
        <AdminStatCard label="En tutelle" value={stats.tutelage_queue} icon={Landmark} tone="gold" />
        <AdminStatCard label="En exécution" value={stats.in_execution} icon={Play} tone="emerald" />
        <AdminStatCard label="Tâches en retard" value={stats.overdue_tasks} icon={AlertTriangle} tone="navy" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Link href="/government/expert/projects" className="group rounded-2xl border bg-white p-5 shadow-sm hover:border-[#0056B3]/30 hover:shadow-md transition">
          <ClipboardCheck className="text-[#0056B3] mb-3" size={28} />
          <h3 className="font-semibold text-[#002E5D] group-hover:text-[#0056B3]">Groupe d'experts</h3>
          <p className="text-sm text-slate-500 mt-1">Validation, corrections et approbation budgétaire</p>
          <span className="inline-flex items-center gap-1 text-sm text-[#0056B3] mt-3 font-medium">Accéder <ArrowRight size={14} /></span>
        </Link>
        <Link href="/government/tutelage/projects" className="group rounded-2xl border bg-white p-5 shadow-sm hover:border-[#0056B3]/30 hover:shadow-md transition">
          <Landmark className="text-[#FFB300] mb-3" size={28} />
          <h3 className="font-semibold text-[#002E5D] group-hover:text-[#0056B3]">Service de tutelle</h3>
          <p className="text-sm text-slate-500 mt-1">Proformats, factures et décaissement</p>
          <span className="inline-flex items-center gap-1 text-sm text-[#0056B3] mt-3 font-medium">Accéder <ArrowRight size={14} /></span>
        </Link>
        <Link href="/projects/archive" className="group rounded-2xl border bg-white p-5 shadow-sm hover:border-[#0056B3]/30 hover:shadow-md transition">
          <MapPin className="text-emerald-600 mb-3" size={28} />
          <h3 className="font-semibold text-[#002E5D] group-hover:text-[#0056B3]">Archives publiques</h3>
          <p className="text-sm text-slate-500 mt-1">Copie et adaptation par d'autres entités</p>
          <span className="inline-flex items-center gap-1 text-sm text-[#0056B3] mt-3 font-medium">Consulter <ArrowRight size={14} /></span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-[#002E5D]">Projets récents</h2>
        </div>
        {recentProjects.length > 0 ? (
          <ul className="divide-y">
            {recentProjects.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.id}`} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition">
                  <div className="min-w-0">
                    <p className="font-medium text-[#002E5D] truncate">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.user?.name} · {p.division?.name}</p>
                    {p.budget?.total_estimated && (
                      <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(p.budget.total_estimated, p.budget.currency)}</p>
                    )}
                  </div>
                  <ProjectStatusBadge status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-12 text-center text-slate-500 text-sm">Aucun projet soumis pour le moment.</p>
        )}
      </div>
    </GovernmentLayout>
  );
}
