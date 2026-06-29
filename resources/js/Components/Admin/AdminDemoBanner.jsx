import React from 'react';
import { usePage } from '@inertiajs/react';
import { FlaskConical } from 'lucide-react';

export default function AdminDemoBanner() {
    const { usingDemoData } = usePage().props;

    if (!usingDemoData) {
        return null;
    }

    return (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3.5 text-sm text-amber-900 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <FlaskConical size={18} />
            </span>
            <div>
                <p className="font-bold">Données de démonstration</p>
                <p className="mt-0.5 text-amber-800/90">
                    Ces chiffres et listes sont fictifs. Les actions (approbation, export, etc.) ne modifient pas la base réelle.
                </p>
            </div>
        </div>
    );
}
