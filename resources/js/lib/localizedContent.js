import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../i18n/config';

export function emptyLocalizedText() {
    return Object.fromEntries(SUPPORTED_LOCALES.map((locale) => [locale, '']));
}

export function toLocalizedText(value) {
    if (value && typeof value === 'object') return { ...emptyLocalizedText(), ...value };

    // Back-compat: content saved before translations existed stored plain strings.
    return { ...emptyLocalizedText(), [DEFAULT_LOCALE]: value ?? '' };
}

export function resolveLocalizedText(value, locale) {
    if (!value) return '';
    if (typeof value === 'string') return value;

    return value[locale] || value[DEFAULT_LOCALE] || Object.values(value).find(Boolean) || '';
}
