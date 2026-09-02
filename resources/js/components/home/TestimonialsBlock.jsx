import { useLocale } from '../../context/LocaleContext';
import { resolveLocalizedText } from '../../lib/localizedContent';
import { getVideoEmbedUrl } from '../../lib/videoEmbed';

function initials(name) {
    return (name ?? '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
}

export default function TestimonialsBlock({ content }) {
    const { locale } = useLocale();
    const items = content.items ?? [];
    const title = resolveLocalizedText(content.title, locale);

    if (items.length === 0) return null;

    return (
        <section className="w-full max-w-6xl py-16">
            {title && <h2 className="text-center text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>}

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, index) => {
                    const embedUrl = item.video_url ? getVideoEmbedUrl(item.video_url) : null;
                    const quote = resolveLocalizedText(item.quote, locale);
                    const role = resolveLocalizedText(item.role, locale);

                    return (
                        <div key={index} className="rounded-3xl bg-surface p-6 shadow-sm shadow-black/5">
                            {embedUrl && (
                                <div className="mb-4 aspect-video w-full overflow-hidden rounded-2xl">
                                    <iframe
                                        src={embedUrl}
                                        title={item.name ?? `testimonial-video-${index}`}
                                        className="h-full w-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}

                            {quote && <p className="text-sm text-ink">&ldquo;{quote}&rdquo;</p>}

                            <div className="mt-4 flex items-center gap-3">
                                {item.avatar_url ? (
                                    <img
                                        src={item.avatar_url}
                                        alt={item.name || ''}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-medium text-white">
                                        {initials(item.name)}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-ink">{item.name}</p>
                                    {role && <p className="text-xs text-muted">{role}</p>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
