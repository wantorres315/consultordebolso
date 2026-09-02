import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../i18n/config';
import { useLocale } from '../context/LocaleContext';

const LOCALE_LABEL = {
    'pt-BR': 'PT',
    en: 'EN',
    es: 'ES',
};

export default function LanguageSwitcher() {
    const { t } = useTranslation();
    const { locale, setLocale } = useLocale();

    return (
        <div
            role="group"
            aria-label={t('languageSwitcher.label')}
            className="inline-flex items-center rounded-full border border-line p-0.5 text-xs font-medium"
        >
            {SUPPORTED_LOCALES.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => setLocale(option)}
                    aria-pressed={locale === option}
                    className={`rounded-full px-2.5 py-1 transition-colors ${
                        locale === option ? 'bg-navy text-white' : 'text-muted hover:text-ink'
                    }`}
                >
                    {LOCALE_LABEL[option]}
                </button>
            ))}
        </div>
    );
}
