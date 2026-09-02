import { useLocale } from '../../context/LocaleContext';
import { resolveLocalizedText } from '../../lib/localizedContent';

export default function TextImageBlock({ content }) {
    const { locale } = useLocale();
    const title = resolveLocalizedText(content.title, locale);
    const body = resolveLocalizedText(content.body, locale);
    const imageAlt = resolveLocalizedText(content.image_alt, locale);

    if (!title && !body && !content.image_url) return null;

    const imageOnRight = content.image_position === 'right';

    return (
        <section className="w-full max-w-6xl py-16">
            <div
                className={`flex flex-col items-center gap-8 sm:gap-12 ${
                    imageOnRight ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
            >
                {content.image_url && (
                    <img
                        src={content.image_url}
                        alt={imageAlt || title}
                        className="w-full max-w-md rounded-3xl object-cover sm:flex-1"
                    />
                )}

                <div className="sm:flex-1">
                    {title && <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>}
                    {body && <p className="mt-4 whitespace-pre-wrap text-muted">{body}</p>}
                </div>
            </div>
        </section>
    );
}
