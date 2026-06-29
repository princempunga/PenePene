import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function ProjectCompletionChecklist({ checklist = [], compact = false }) {
  if (!checklist.length) return null;

  const required = checklist.filter((item) => !['b2', 'h', 'i'].includes(item.key));
  const optional = checklist.filter((item) => ['b2', 'h', 'i'].includes(item.key));
  const requiredDone = required.filter((item) => item.done).length;
  const ready = required.every((item) => item.done);

  const Item = ({ item }) => (
    <li className={`flex items-start gap-2 text-sm ${item.done ? 'text-emerald-700' : 'text-slate-600'}`}>
      {item.done
        ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
        : <Circle size={16} className="text-slate-300 shrink-0 mt-0.5" />}
      <span>
        <span className="font-mono text-xs text-slate-400 mr-1">{item.key})</span>
        {item.label}
      </span>
    </li>
  );

  return (
    <div className={`rounded-xl border ${ready ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/40'} ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Complétude du dossier</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ready ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {requiredDone}/{required.length} obligatoires
        </span>
      </div>
      {!compact && (
        <p className="text-xs text-slate-500 mb-3">
          Sections a) à i) requises avant soumission au groupe d&apos;experts (point 2).
        </p>
      )}
      <ul className="space-y-1.5">
        {required.map((item) => <Item key={item.key} item={item} />)}
      </ul>
      {optional.some((i) => i.done) || !compact ? (
        <details className="mt-3">
          <summary className="text-xs font-medium text-slate-500 cursor-pointer">Sections recommandées (b.ii, h, i)</summary>
          <ul className="space-y-1.5 mt-2">
            {optional.map((item) => <Item key={item.key} item={item} />)}
          </ul>
        </details>
      ) : null}
      {!ready && !compact && (
        <p className="text-xs text-amber-700 mt-3">Complétez les sections obligatoires avant de soumettre aux experts.</p>
      )}
    </div>
  );
}
