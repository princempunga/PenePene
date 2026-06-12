export const ORDER_STATUS_LABELS_FR = {
    all: 'Toutes',
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    rejected: 'Refusée',
};

/** Libellés français par défaut pour StatusBadge (commandes, produits, paiements, etc.). */
export const DEFAULT_STATUS_LABELS_FR = {
    ...ORDER_STATUS_LABELS_FR,
    active: 'Actif',
    inactive: 'Inactif',
    paid: 'Payé',
    refunded: 'Remboursé',
    completed: 'Terminé',
    open: 'Ouvert',
    in_progress: 'En cours',
    resolved: 'Résolu',
    closed: 'Fermé',
    verified: 'Approuvé',
    none: 'Aucun',
};
