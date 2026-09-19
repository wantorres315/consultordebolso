import { useLocale } from '../../context/LocaleContext';
import { resolveLocalizedText } from '../../lib/localizedContent';
import { getVideoEmbedUrl } from '../../lib/videoEmbed';

export default function VideoCard({ item, index }) {
    const { locale } = useLocale();
    const embedUrl = getVideoEmbedUrl(item.url);
    const itemTitle = resolveLocalizedText(item.title, locale);

    return (
        <div className="overflow-hidden rounded-3xl bg-surface shadow-sm shadow-black/5">
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
}
