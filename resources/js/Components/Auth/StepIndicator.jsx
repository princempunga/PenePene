import React from 'react';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep, accent = 'amber' }) {
    const activeColor = accent === 'amber' ? 'bg-amber-600 border-amber-600 text-white' : 'bg-blue-600 border-blue-600 text-white';
    const doneColor = accent === 'amber' ? 'bg-amber-100 border-amber-600 text-amber-700' : 'bg-blue-100 border-blue-600 text-blue-700';
    const idleColor = 'bg-white border-gray-200 text-gray-400';

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between gap-2">
                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isDone = stepNum < currentStep;
                    const isActive = stepNum === currentStep;

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center min-w-0 flex-1">
                                <div
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                                        isDone ? doneColor : isActive ? activeColor : idleColor
                                    }`}
                                >
                                    {isDone ? <Check size={18} /> : stepNum}
                                </div>
                                <p className={`mt-2 text-[10px] sm:text-xs font-semibold text-center leading-tight ${
                                    isActive ? 'text-gray-900' : isDone ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                    {step.label}
                                </p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`h-0.5 flex-1 mb-6 rounded-full transition-colors ${
                                    stepNum < currentStep
                                        ? accent === 'amber' ? 'bg-amber-400' : 'bg-blue-400'
                                        : 'bg-gray-200'
                                }`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
