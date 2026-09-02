import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, normalizeLocale } from './config';
import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';
import es from './locales/es.json';

function getInitialLocale() {
    const stored = localStorage.getItem('locale');
    if (SUPPORTED_LOCALES.includes(stored)) return stored;

    return normalizeLocale(navigator.language);
}

i18next.use(initReactI18next).init({
    resources: {
        'pt-BR': { translation: ptBR },
        en: { translation: en },
        es: { translation: es },
    },
    lng: getInitialLocale(),
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
});

export default i18next;
