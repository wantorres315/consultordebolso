import { useLocale } from '../../context/LocaleContext';
import { resolveLocalizedText } from '../../lib/localizedContent';
import { getVideoEmbedUrl } from '../../lib/videoEmbed';

export default function VideosBlock({ content }) {
    const { locale } = useLocale();
    const items = (content.items ?? []).filter((item) => item.url);
    const title = resolveLocalizedText(content.title, locale);

    if (items.length === 0) return null;

    return (
        <section className="w-full max-w-6xl py-16">
            {title && <h2 className="text-center text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>}

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {items.map((item, index) => {
                    const embedUrl = getVideoEmbedUrl(item.url);
                    const itemTitle = resolveLocalizedText(item.title, locale);

                    return (
                        <div key={index} className="overflow-hidden rounded-3xl bg-surface shadow-sm shadow-black/5">
                            <div className="aspect-video w-full">
                                {embedUrl && (
                                    <iframe
                                        src={embedUrl}
                                        title={itemTitle || `video-${index}`}
                                        className="h-full w-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                )}
                            </div>
                            {itemTitle && <p className="p-4 text-sm font-medium text-ink">{itemTitle}</p>}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
