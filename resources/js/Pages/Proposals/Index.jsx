import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import AdminBadge from '@/Components/Admin/AdminBadge';
import { FileText, Plus } from 'lucide-react';

const statusFilters = ['all', 'draft', 'submitted', 'under_review', 'approved', 'rejected', 'revision_requested'];

export default function ProposalsIndex({ proposals, filters }) {
  return (
    <BuyerLayout title="Mes propositions" subtitle="Gouvernance participative">
      <Head title="Mes propositions" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <p className="text-sm text-slate-600">
          Soumettez et suivez vos propositions aux autorités de la RDC.
        </p>
        <Link
          href="/proposals/create"
          className="inline-flex items-center gap-2 bg-[#0056B3] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#002E5D] transition"
        >
          <Plus size={18} />
          Nouvelle proposition
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {statusFilters.map((s) => (
          <Link
            key={s}
            href={s === 'all' ? '/proposals' : `/proposals?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              (filters.status || 'all') === s
                ? 'bg-[#0056B3] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s === 'all' ? 'Toutes' : s.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {proposals.data.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {proposals.data.map((proposal) => (
              <li key={proposal.id}>
                <Link href={`/proposals/${proposal.id}`} className="block px-6 py-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#002E5D] truncate">{proposal.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">#{proposal.proposal_number}</p>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-1">{proposal.summary}</p>
                      {proposal.division && (
                        <p className="text-xs text-slate-400 mt-1">{proposal.division.name}</p>
                      )}
                    </div>
                    <AdminBadge variant={proposal.status}>{proposal.status.replace(/_/g, ' ')}</AdminBadge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-16 text-center">
            <FileText className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="font-medium text-slate-700">Aucune proposition</p>
            <p className="text-sm text-slate-500 mt-1">Créez votre première proposition citoyenne.</p>
          </div>
        )}
      </div>

      {proposals.links && proposals.links.length > 3 && (
        <div className="flex justify-center gap-2 mt-6">
          {proposals.links.map((link, i) => (
            <Link
              key={i}
              href={link.url || '#'}
              className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-[#0056B3] text-white' : 'bg-slate-100 text-slate-600'} ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}
    </BuyerLayout>
  );
}
