import { LOCALE_TO_CURRENCY } from '../i18n/config';

const PRICE_FIELD_SUFFIX = {
    'pt-BR': '',
    en: '_usd',
    es: '_eur',
};

export function getCurrencyForLocale(locale) {
    return LOCALE_TO_CURRENCY[locale] ?? LOCALE_TO_CURRENCY['pt-BR'];
}

export function formatCurrency(amount, locale) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: getCurrencyForLocale(locale),
    }).format(amount ?? 0);
}

export function getPlanPrice(plan, locale, period) {
    const suffix = PRICE_FIELD_SUFFIX[locale] ?? '';
    const field = `${period}_price${suffix}`;

    return plan[field] ?? plan[`${period}_price`];
}
