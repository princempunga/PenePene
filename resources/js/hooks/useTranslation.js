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

    const t = (key, replacements = {}) => {
        let value = resolveKey(translations, key);

        if (value === undefined) {
            return key;
        }

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
