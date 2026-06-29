import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import GovernmentLayout from '@/Layouts/GovernmentLayout';
import { ArrowLeft } from 'lucide-react';

export default function TutelageShow({ project }) {
  const docForm = useForm({ file: null, type: 'budget_proforma' });
  const tutelageForm = useForm({ tutelage_service: project.tutelage_record?.tutelage_service || '' });

  return (
    <GovernmentLayout title={project.title} subtitle="Tutelle & décaissement">
      <Head title={project.title} />
      <Link href="/government/tutelage/projects" className="inline-flex items-center gap-1 text-sm text-[#0056B3] mb-4 hover:underline"><ArrowLeft size={16} /> Retour</Link>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 text-sm space-y-3">
          <p><strong>Concepteur / PM :</strong> {project.user?.name}</p>
          <p><strong>Budget approuvé :</strong> {Number(project.budget?.approved_amount || 0).toLocaleString()} CDF</p>
          <p className="text-xs text-slate-500">Proformats budgétaires, factures justificatives et décaissement selon les normes légales.</p>

          <h3 className="font-semibold pt-2">Documents</h3>
          {project.documents?.map(d => (
            <a key={d.id} href={`/storage/${d.path}`} target="_blank" rel="noreferrer" className="block text-[#0056B3] hover:underline">{d.name} ({d.type})</a>
          ))}
          <form onSubmit={e => { e.preventDefault(); docForm.post(`/government/tutelage/projects/${project.id}/documents`, { forceFormData: true }); }} className="space-y-2 pt-2">
            <select value={docForm.data.type} onChange={e => docForm.setData('type', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm">
              <option value="budget_proforma">Proformat budget</option>
              <option value="invoice">Facture justificative</option>
              <option value="justification">Justificatif de fonds</option>
            </select>
            <input type="file" onChange={e => docForm.setData('file', e.target.files[0])} className="text-sm" />
            <button type="submit" className="px-3 py-1.5 bg-[#0056B3] text-white rounded-lg text-xs font-medium">Joindre</button>
          </form>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <form onSubmit={e => { e.preventDefault(); tutelageForm.post(`/government/tutelage/projects/${project.id}/submit`); }}>
            <label className="text-sm font-medium">Service de tutelle</label>
            <input value={tutelageForm.data.tutelage_service} onChange={e => tutelageForm.setData('tutelage_service', e.target.value)} className="w-full border-gray-300 rounded-lg mb-3" placeholder="Ex: Ministère du Budget" />
            <button type="submit" className="w-full py-2 bg-[#0056B3] text-white rounded-lg text-sm font-medium">Transmettre à la tutelle</button>
          </form>

          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-medium">Décaissement</p>
            {['pending', 'partial', 'completed'].map(s => (
              <button key={s} onClick={() => router.patch(`/government/tutelage/projects/${project.id}/disbursement`, { disbursement_status: s })}
                className="block w-full py-2 border rounded-lg text-sm capitalize hover:bg-slate-50">{s}</button>
            ))}
          </div>

          {project.status !== 'in_execution' && (
            <button onClick={() => router.post(`/government/tutelage/projects/${project.id}/execution`)} className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
              Autoriser la mise en œuvre
            </button>
          )}
        </div>
      </div>
    </GovernmentLayout>
  );
}
