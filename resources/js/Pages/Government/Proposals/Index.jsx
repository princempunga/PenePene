import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GovernmentLayout from '@/Layouts/GovernmentLayout';
import AdminFilterTabs from '@/Components/Admin/AdminFilterTabs';
import AdminBadge from '@/Components/Admin/AdminBadge';
import AdminPagination from '@/Components/Admin/AdminPagination';
import { AdminTable, AdminTableHead, AdminTableBody, AdminTableEmpty } from '@/Components/Admin/AdminTable';
import { FileText } from 'lucide-react';

const levelLabels = {
  commune: 'Commune',
  territory: 'Territoire',
  provincial: 'Province',
  national: 'National',
};

export default function GovernmentProposalsIndex({ proposals, filters, profile }) {
  return (
    <GovernmentLayout title="Propositions" subtitle={profile?.department || 'File d\'attente'}>
      <Head title="Propositions gouvernement" />

      <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-900">
        Niveau de traitement : <strong>{levelLabels[profile?.officer_level] || profile?.officer_level}</strong>
        {profile?.division && <> — <strong>{profile.division.name}</strong></>}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end mb-4">
        <AdminFilterTabs
          useLinks
          baseHref="/government/proposals"
          items={['submitted', 'under_review', 'all'].map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))}
          activeValue={filters.status || 'all'}
        />
      </div>

      <AdminTable>
        <AdminTableHead>
          <tr>
            <th className="px-6 py-4">Proposition</th>
            <th className="px-6 py-4">Citoyen</th>
            <th className="px-6 py-4">Localisation</th>
            <th className="px-6 py-4">Priorité</th>
            <th className="px-6 py-4">Statut</th>
          </tr>
        </AdminTableHead>
        <AdminTableBody>
          {proposals.data.length > 0 ? proposals.data.map((p) => (
            <tr key={p.id}>
              <td className="px-6 py-4">
                <Link href={`/government/proposals/${p.id}`} className="block">
                  <p className="font-semibold text-[#002E5D] hover:text-[#0056B3]">{p.title}</p>
                  <p className="text-xs text-slate-500">#{p.proposal_number}</p>
                </Link>
              </td>
              <td className="px-6 py-4">
                <p className="font-medium text-[#002E5D]">{p.user?.name}</p>
                <p className="text-xs text-slate-500">{p.user?.email}</p>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{p.division?.name}</td>
              <td className="px-6 py-4 capitalize text-sm">{p.priority}</td>
              <td className="px-6 py-4">
                <AdminBadge variant={p.status}>{p.status.replace(/_/g, ' ')}</AdminBadge>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5">
                <AdminTableEmpty icon={FileText} title="Aucune proposition" description="Aucune proposition dans votre périmètre." />
              </td>
            </tr>
          )}
        </AdminTableBody>
      </AdminTable>

      <AdminPagination paginator={proposals} />
    </GovernmentLayout>
  );
}
