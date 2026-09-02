import { useLocale } from '../../context/LocaleContext';
import { resolveLocalizedText } from '../../lib/localizedContent';

export default function TextBlock({ content }) {
    const { locale } = useLocale();
    const title = resolveLocalizedText(content.title, locale);
    const body = resolveLocalizedText(content.body, locale);

    if (!title && !body) return null;

    return (
        <section className="w-full max-w-3xl py-16 text-center">
            {title && <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>}
            {body && <p className="mt-4 whitespace-pre-wrap text-muted">{body}</p>}
        </section>
    );
}
