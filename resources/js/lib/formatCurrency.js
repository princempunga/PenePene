/** Locale et devise par défaut du portail vendeur (RDC). */
export const DEFAULT_LOCALE = 'fr-CD';
export const DEFAULT_CURRENCY = 'CDF';
export const DEFAULT_SYMBOL = 'FC';

/**
 * Formate un montant en franc congolais (CDF / FC).
 * Exemple : 1 234 567 FC
 */
export function formatCurrency(amount, options = {}) {
    const {
        locale = DEFAULT_LOCALE,
        symbol = DEFAULT_SYMBOL,
        maximumFractionDigits = 0,
        minimumFractionDigits,
    } = options;

    const value = parseFloat(amount || 0);
    const formatOptions = { maximumFractionDigits };

    if (minimumFractionDigits !== undefined) {
        formatOptions.minimumFractionDigits = minimumFractionDigits;
    }

    let formatted;
    try {
        formatted = value.toLocaleString(locale, formatOptions);
    } catch {
        formatted = value.toLocaleString('fr-FR', formatOptions);
    }

    return `${formatted} ${symbol}`;
}

/** Montant avec 2 décimales (retraits, soldes). */
export function formatCurrencyDecimal(amount, options = {}) {
    return formatCurrency(amount, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
    });
}
