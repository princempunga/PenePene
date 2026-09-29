/** Locale et devise par défaut du portail vendeur. */
export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_SYMBOL = '$';

/**
 * Formate un montant selon la devise donnée.
 * Par défaut : dollar américain (USD / $).
 */
export function formatCurrency(amount, options = {}) {
    const {
        locale = DEFAULT_LOCALE,
        symbol = DEFAULT_SYMBOL,
        maximumFractionDigits = 2,
        minimumFractionDigits,
        currency = DEFAULT_CURRENCY,
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
        formatted = value.toLocaleString('en-US', formatOptions);
    }

    if (resolvedSymbol === '$') {
        return `$${formatted}`;
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
