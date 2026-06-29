import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { Copy, Search } from 'lucide-react';

export default function ProjectArchive({ projects, filters }) {
  return (
    <BuyerLayout title="Archives publiques" subtitle="Copie & adaptation">
      <Head title="Archives projets" />

      <p className="text-sm text-slate-600 mb-4">Projets terminés visibles par d'autres entités pour copie, adaptation et archivage.</p>

      <form onSubmit={e => { e.preventDefault(); router.get('/projects/archive', { search: e.target.search.value }); }} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input name="search" defaultValue={filters.search || ''} placeholder="Rechercher un projet..." className="w-full pl-9 border-gray-300 rounded-lg" />
        </div>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.data.map(p => (
          <div key={p.id} className="bg-white rounded-xl border p-4 flex flex-col">
            <h3 className="font-semibold text-[#002E5D] mb-1">{p.title}</h3>
            <p className="text-xs text-slate-500 mb-3">{p.division?.name}</p>
            <div className="mt-auto flex gap-2">
              <Link href={`/projects/archive/${p.id}`} className="flex-1 text-center py-2 rounded-lg border text-sm font-medium hover:bg-slate-50">Voir</Link>
              <button onClick={() => router.post(`/projects/archive/${p.id}/copy`)} className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-[#0056B3] text-white text-sm font-medium">
                <Copy size={14} /> Copier
              </button>
            </div>
          </div>
        ))}
      </div>
    </BuyerLayout>
  );
}
