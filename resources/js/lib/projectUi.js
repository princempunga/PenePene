export const PROJECT_STATUS_LABELS = {
    draft: 'Brouillon',
    submitted_experts: 'Chez les experts',
    revision_requested: 'Corrections demandées',
    approved: 'Approuvé',
    tutelage_pending: 'En tutelle',
    in_execution: 'En exécution',
    completed: 'Terminé',
    evaluated: 'Évalué',
    archived: 'Archivé',
    rejected: 'Rejeté',
};

export const PROJECT_STAGE_LABELS = {
    design: 'Conception',
    expert_review: 'Revue experts',
    tutelage: 'Tutelle & budget',
    execution: 'Exécution',
    evaluation: 'Évaluation',
    archived: 'Archivé',
};

export const PROJECT_STATUS_BADGE = {
    draft: 'inactive',
    submitted_experts: 'pending',
    revision_requested: 'pending',
    approved: 'verified',
    tutelage_pending: 'confirmed',
    in_execution: 'confirmed',
    completed: 'delivered',
    evaluated: 'verified',
    archived: 'inactive',
    rejected: 'rejected',
};

export const WORKFLOW_STEPS = [
    { key: 'design', label: 'Conception', icon: '1' },
    { key: 'expert_review', label: 'Experts', icon: '2' },
    { key: 'tutelage', label: 'Tutelle', icon: '3' },
    { key: 'execution', label: 'Exécution', icon: '4' },
    { key: 'evaluation', label: 'Évaluation', icon: '5' },
    { key: 'archived', label: 'Archives', icon: '6' },
];

export function statusLabel(status) {
    return PROJECT_STATUS_LABELS[status] || status?.replace(/_/g, ' ') || '—';
}

export function stageLabel(stage) {
    return PROJECT_STAGE_LABELS[stage] || stage?.replace(/_/g, ' ') || '—';
}

export function badgeVariant(status) {
    return PROJECT_STATUS_BADGE[status] || 'pending';
}

export function stageIndex(stage) {
    return WORKFLOW_STEPS.findIndex((s) => s.key === stage);
}

export function formatCurrency(amount, currency = 'CDF') {
    if (amount == null || amount === '') return '—';
    return `${Number(amount).toLocaleString('fr-FR')} ${currency}`;
}
