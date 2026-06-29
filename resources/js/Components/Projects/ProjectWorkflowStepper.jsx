import React from 'react';
import { Check } from 'lucide-react';
import { WORKFLOW_STEPS, stageIndex } from '@/lib/projectUi';

export default function ProjectWorkflowStepper({ currentStage, compact = false }) {
    const current = stageIndex(currentStage);

    return (
        <div className={`${compact ? 'py-2' : 'py-4'}`}>
            <div className="flex items-center justify-between gap-1">
                {WORKFLOW_STEPS.map((step, idx) => {
                    const done = idx < current;
                    const active = idx === current;
                    return (
                        <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center min-w-0 flex-1">
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                    done ? 'bg-emerald-500 text-white shadow-sm' :
                                    active ? 'bg-[#0056B3] text-white ring-4 ring-[#0056B3]/20 shadow-md' :
                                    'bg-slate-100 text-slate-400'
                                }`}>
                                    {done ? <Check size={14} strokeWidth={3} /> : step.icon}
                                </div>
                                {!compact && (
                                    <p className={`mt-2 text-[10px] sm:text-xs font-medium text-center leading-tight truncate w-full px-0.5 ${
                                        active ? 'text-[#0056B3]' : done ? 'text-emerald-700' : 'text-slate-400'
                                    }`}>
                                        {step.label}
                                    </p>
                                )}
                            </div>
                            {idx < WORKFLOW_STEPS.length - 1 && (
                                <div className={`h-0.5 flex-1 min-w-2 max-w-8 mb-5 rounded-full ${idx < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
