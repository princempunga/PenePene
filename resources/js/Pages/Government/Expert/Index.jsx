import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GovernmentLayout from '@/Layouts/GovernmentLayout';
import ProjectStatusBadge from '@/Components/Projects/ProjectStatusBadge';
import { AdminTable, AdminTableHead, AdminTableBody, AdminTableEmpty } from '@/Components/Admin/AdminTable';
import { ClipboardCheck } from 'lucide-react';

export default function ExpertIndex({ projects }) {
  return (
    <GovernmentLayout title="Groupe d'experts" subtitle="Validation des projets">
      <Head title="Revue experts" />
      <p className="text-sm text-blue-900 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
        Tout projet soumis doit recevoir une réponse endéant le délai légal (30 jours). Sans réponse, le délai est considéré comme non respecté.
      </p>
      <AdminTable>
        <AdminTableHead><tr><th className="px-6 py-4">Projet</th><th className="px-6 py-4">Concepteur</th><th className="px-6 py-4">Budget</th><th className="px-6 py-4">Délai</th><th className="px-6 py-4">Statut</th></tr></AdminTableHead>
        <AdminTableBody>
          {projects.data.length ? projects.data.map(p => (
            <tr key={p.id}>
              <td className="px-6 py-4"><Link href={`/government/expert/projects/${p.id}`} className="font-semibold text-[#002E5D] hover:text-[#0056B3]">{p.title}</Link><p className="text-xs text-slate-500">#{p.project_number}</p></td>
              <td className="px-6 py-4 text-sm">{p.user?.name}</td>
              <td className="px-6 py-4 text-sm">{p.budget?.creator_unsure ? 'À estimer' : Number(p.budget?.total_estimated || 0).toLocaleString()}</td>
              <td className="px-6 py-4 text-xs">{p.expert_review_deadline ? new Date(p.expert_review_deadline).toLocaleDateString('fr-FR') : '—'}</td>
              <td className="px-6 py-4"><ProjectStatusBadge status={p.status} /></td>
            </tr>
          )) : <tr><td colSpan="5"><AdminTableEmpty icon={ClipboardCheck} title="Aucun projet" description="File d'attente vide." /></td></tr>}
        </AdminTableBody>
      </AdminTable>
    </GovernmentLayout>
  );
}
