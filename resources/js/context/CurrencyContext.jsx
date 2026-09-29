import React, { useState, useEffect, createContext, useContext } from 'react';

// Taux de conversion de référence (1 USD = 2800 CDF)
export const USD_TO_CDF_RATE = 2800;

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
    const [currency, setCurrencyState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('app_currency') || 'USD';
        }
        return 'USD';
    });

    const setCurrency = (newCurrency) => {
        setCurrencyState(newCurrency);
        if (typeof window !== 'undefined') {
            localStorage.setItem('app_currency', newCurrency);
            window.dispatchEvent(new CustomEvent('currency-changed', { detail: { currency: newCurrency } }));
        }
    };

    /**
     * Convertit et formate n'importe quel montant selon la devise sélectionnée.
     * @param {number} amount Montant de base
     * @param {string} sourceCurrency Devise d'origine du montant ('USD', 'CDF', etc.)
     */
    const formatAmount = (amount, sourceCurrency = 'USD') => {
        const val = parseFloat(amount || 0);
        const src = (sourceCurrency || 'USD').toUpperCase();
        const target = currency.toUpperCase();

        let convertedValue = val;

        if (src === 'CDF' && target === 'USD') {
            convertedValue = val / USD_TO_CDF_RATE;
        } else if (src === 'USD' && target === 'CDF') {
            convertedValue = val * USD_TO_CDF_RATE;
        }

        if (target === 'USD') {
            return `$${convertedValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
        }

        return `CDF ${Math.round(convertedValue).toLocaleString('fr-FR')}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, rate: USD_TO_CDF_RATE }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) {
        // Fallback si hors du provider
        return {
            currency: 'USD',
            setCurrency: () => {},
            formatAmount: (val, src = 'USD') => `$${parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            rate: USD_TO_CDF_RATE,
        };
    }
    return context;
}
