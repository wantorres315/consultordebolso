import { useState } from 'react';
import { SUPPORTED_LOCALES } from '../../../i18n/config';
import { toLocalizedText } from '../../../lib/localizedContent';

const LOCALE_LABELS = { 'pt-BR': 'PT', en: 'EN', es: 'ES' };

export default function LocalizedTextField({ value, onChange, placeholder, multiline = false, rows = 3 }) {
    const [activeLocale, setActiveLocale] = useState('pt-BR');
    const localized = toLocalizedText(value);

    function handleChange(event) {
        onChange({ ...localized, [activeLocale]: event.target.value });
    }

    const fieldClass =
        'w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none';

    return (
        <div>
            <div className="mb-1 flex gap-1">
                {SUPPORTED_LOCALES.map((locale) => (
                    <button
                        key={locale}
                        type="button"
                        onClick={() => setActiveLocale(locale)}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                            activeLocale === locale ? 'bg-navy text-white' : 'bg-app text-muted hover:text-ink'
                        }`}
                    >
                        {LOCALE_LABELS[locale]}
                        {!localized[locale] && <span className="ml-1 opacity-70">○</span>}
                    </button>
                ))}
            </div>

            {multiline ? (
                <textarea
                    value={localized[activeLocale] ?? ''}
                    onChange={handleChange}
                    placeholder={placeholder}
                    rows={rows}
                    className={`resize-none ${fieldClass}`}
                />
            ) : (
                <input
                    type="text"
                    value={localized[activeLocale] ?? ''}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={fieldClass}
                />
            )}
        </div>
    );
}
