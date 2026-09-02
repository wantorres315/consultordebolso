export const SUPPORTED_LOCALES = ['pt-BR', 'en', 'es'];

export const DEFAULT_LOCALE = 'pt-BR';

export const LOCALE_TO_CURRENCY = {
    'pt-BR': 'BRL',
    en: 'USD',
    es: 'EUR',
};

export const LOCALE_TO_BACKEND = {
    'pt-BR': 'pt_BR',
    en: 'en',
    es: 'es',
};

export function normalizeLocale(value) {
    if (SUPPORTED_LOCALES.includes(value)) return value;

    const language = value?.split('-')[0];

    if (language === 'en') return 'en';
    if (language === 'es') return 'es';
    if (language === 'pt') return 'pt-BR';

    return DEFAULT_LOCALE;
}
