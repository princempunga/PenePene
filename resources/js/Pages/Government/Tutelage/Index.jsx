import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GovernmentLayout from '@/Layouts/GovernmentLayout';
import AdminBadge from '@/Components/Admin/AdminBadge';

export default function TutelageIndex({ projects }) {
  return (
    <GovernmentLayout title="Service de tutelle" subtitle="Budget & décaissement">
      <Head title="Tutelle" />
      <div className="space-y-3">
        {projects.data.map(p => (
          <Link key={p.id} href={`/government/tutelage/projects/${p.id}`} className="block bg-white rounded-xl border p-4 hover:border-[#0056B3] transition">
            <div className="flex justify-between"><span className="font-semibold text-[#002E5D]">{p.title}</span><AdminBadge variant={p.status}>{p.status.replace(/_/g, ' ')}</AdminBadge></div>
            <p className="text-xs text-slate-500 mt-1">{p.user?.name} · Budget approuvé : {Number(p.budget?.approved_amount || p.budget?.total_estimated || 0).toLocaleString()} CDF</p>
          </Link>
        ))}
      </div>
    </GovernmentLayout>
  );
}
