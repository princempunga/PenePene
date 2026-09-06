import React, { useState, useEffect, createContext, useContext } from 'react';

// Taux de conversion de référence (1 USD = 2800 CDF)
export const USD_TO_CDF_RATE = 2800;

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
    const [currency, setCurrencyState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('app_currency') || 'CDF';
        }
        return 'CDF';
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
     * @param {string} sourceCurrency Devise d'origine du montant ('CDF', 'USD', etc.)
     */
    const formatAmount = (amount, sourceCurrency = 'CDF') => {
        const val = parseFloat(amount || 0);
        const src = (sourceCurrency || 'CDF').toUpperCase();
        const target = currency.toUpperCase();

        let convertedValue = val;

        if (src === 'CDF' && target === 'USD') {
            convertedValue = val / USD_TO_CDF_RATE;
        } else if (src === 'USD' && target === 'CDF') {
            convertedValue = val * USD_TO_CDF_RATE;
        }

        if (target === 'USD') {
            return `$ ${convertedValue.toLocaleString('en-US', {
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
            currency: 'CDF',
            setCurrency: () => {},
            formatAmount: (val, src = 'CDF') => `${src || 'CDF'} ${parseFloat(val || 0).toLocaleString()}`,
            rate: USD_TO_CDF_RATE,
        };
    }
    return context;
}
