import React from 'react';
import { Link } from '@inertiajs/react';

export default function AdminPagination({ paginator }) {
    if (!paginator?.links?.length) return null;

    return (
        <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div>
                {paginator.from || 0} – {paginator.to || 0} sur {paginator.total} résultats
            </div>
            <div className="flex flex-wrap gap-1">
                {paginator.links.map((link, i) => (
                    <Link
                        key={i}
                        href={link.url || '#'}
                        className={`rounded-lg border px-3 py-1 transition ${
                            link.active
                                ? 'border-[#002E5D] bg-[#002E5D] text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-[#0056B3]/30 hover:bg-slate-50'
                        } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}
