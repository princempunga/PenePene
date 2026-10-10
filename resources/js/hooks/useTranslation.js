import { usePage } from '@inertiajs/react';

function resolveKey(translations, key) {
    const parts = key.split('.');
    let value = translations;

    for (const part of parts) {
        if (value == null || typeof value !== 'object') {
            return undefined;
        }
        value = value[part];
    }

    return value;
}

export default function useTranslation() {
    const { locale, translations = {}, availableLocales = {} } = usePage().props;

    const t = (key, fallbackOrReplacements = {}) => {
        let value = resolveKey(translations, key);

        if (value === undefined) {
            // If the second argument is a string, use it as a fallback
            if (typeof fallbackOrReplacements === 'string') {
                return fallbackOrReplacements;
            }
            return key;
        }

        // If the second argument is a string, there are no replacements
        const replacements = typeof fallbackOrReplacements === 'string' ? {} : fallbackOrReplacements;

        if (typeof value !== 'string') {
            return value;
        }

        return Object.entries(replacements).reduce(
            (text, [placeholder, replacement]) => text.replace(`:${placeholder}`, String(replacement)),
            value,
        );
    };

    return { t, locale, availableLocales };
}
