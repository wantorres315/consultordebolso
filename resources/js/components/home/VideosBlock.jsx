import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../../context/LocaleContext';
import { resolveLocalizedText } from '../../lib/localizedContent';
import VideoCard from './VideoCard';

const HOME_LIMIT = 2;

export default function VideosBlock({ content }) {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const items = (content.items ?? []).filter((item) => item.url);
    const title = resolveLocalizedText(content.title, locale);

    if (items.length === 0) return null;

    const visibleItems = items.slice(0, HOME_LIMIT);

    return (
        <section className="w-full max-w-6xl py-16">
            {title && <h2 className="text-center text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>}

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {visibleItems.map((item, index) => (
                    <VideoCard key={index} item={item} index={index} />
                ))}
            </div>

            {items.length > HOME_LIMIT && (
                <div className="mt-8 text-center">
                    <Link
                        to="/videos"
                        className="inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-app transition hover:opacity-90"
                    >
                        {t('videosPage.viewAll')}
                    </Link>
                </div>
            )}
        </section>
    );
}
