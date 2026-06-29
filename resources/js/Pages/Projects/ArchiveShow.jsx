import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { Copy, ArrowLeft } from 'lucide-react';

export default function ProjectArchiveShow({ project }) {
  return (
    <BuyerLayout title={project.title} subtitle="Archive publique">
      <Head title={project.title} />
      <div className="max-w-4xl mx-auto">
        <Link href="/projects/archive" className="inline-flex items-center gap-1 text-sm text-[#0056B3] mb-4 hover:underline"><ArrowLeft size={16} /> Archives</Link>
        <div className="bg-white rounded-xl border p-6 mb-4">
          <h1 className="text-xl font-bold text-[#002E5D] mb-2">{project.title}</h1>
          <p className="text-sm text-slate-500 mb-4">{project.division?.name}</p>
          {project.interests?.map(i => <p key={i.id} className="text-sm mb-1"><strong>{i.type}:</strong> {i.description}</p>)}
          {project.final_report && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold mb-2">Leçons apprises</h3>
              <p className="text-sm text-slate-600">{project.final_report.lessons_learned}</p>
            </div>
          )}
        </div>
        <button onClick={() => router.post(`/projects/archive/${project.id}/copy`)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0056B3] text-white rounded-lg font-medium"><Copy size={16} /> Adapter ce projet</button>
      </div>
    </BuyerLayout>
  );
}
