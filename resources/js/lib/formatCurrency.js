/** Locale et devise par défaut du portail vendeur (RDC). */
export const DEFAULT_LOCALE = 'fr-CD';
export const DEFAULT_CURRENCY = 'CDF';
export const DEFAULT_SYMBOL = 'FC';

/**
 * Formate un montant selon la devise donnée.
 * Par défaut : franc congolais (CDF / FC).
 */
export function formatCurrency(amount, options = {}) {
    const {
        locale = DEFAULT_LOCALE,
        symbol = DEFAULT_SYMBOL,
        maximumFractionDigits = 0,
        minimumFractionDigits,
        currency,
    } = options;

    const resolvedSymbol = currency
        ? (currency.toUpperCase() === 'USD' ? '$' : currency.toUpperCase() === 'EUR' ? '€' : currency.toUpperCase() === 'CDF' ? 'FC' : currency)
        : symbol;

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

    return `${formatted} ${resolvedSymbol}`;
}

/** Montant avec 2 décimales (retraits, soldes). */
export function formatCurrencyDecimal(amount, options = {}) {
    return formatCurrency(amount, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
    });
}
