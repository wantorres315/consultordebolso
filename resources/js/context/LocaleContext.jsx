import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import i18next from '../i18n';
import { LOCALE_TO_CURRENCY, SUPPORTED_LOCALES, normalizeLocale } from '../i18n/config';

const LocaleContext = createContext(null);

function getInitialLocale() {
    const stored = localStorage.getItem('locale');
    if (SUPPORTED_LOCALES.includes(stored)) return stored;

    return normalizeLocale(navigator.language);
}

export function LocaleProvider({ children }) {
    const [locale, setLocaleState] = useState(getInitialLocale);

    useEffect(() => {
        localStorage.setItem('locale', locale);
        i18next.changeLanguage(locale);
    }, [locale]);

    const setLocale = useCallback((next) => {
        if (SUPPORTED_LOCALES.includes(next)) setLocaleState(next);
    }, []);

    return (
        <LocaleContext.Provider value={{ locale, setLocale, currency: LOCALE_TO_CURRENCY[locale] }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);

    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }

    return context;
}
