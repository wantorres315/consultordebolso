import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';
import VideoCard from '../components/home/VideoCard';
import { fetchHomeSections } from '../lib/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function VideosPage() {
    const { t } = useTranslation();
    const [authOpen, setAuthOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useDocumentMeta({
        title: `${t('videosPage.title')} · ${import.meta.env.VITE_APP_NAME}`,
        description: t('videosPage.subtitle'),
    });

    useEffect(() => {
        fetchHomeSections()
            .then(({ data }) =>
                setItems(
                    data
                        .filter((section) => section.type === 'videos')
                        .flatMap((section) => section.content?.items ?? [])
                        .filter((item) => item.url),
                ),
            )
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center bg-app px-6 text-ink antialiased">
            <Header onOpenAuth={() => setAuthOpen(true)} />

            <main className="w-full max-w-6xl py-16">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{t('videosPage.title')}</h1>
                    <p className="mt-2 text-muted">{t('videosPage.subtitle')}</p>
                </div>

                {loading && <p className="mt-10 text-center text-sm text-muted">{t('videosPage.loading')}</p>}
                {!loading && items.length === 0 && (
                    <p className="mt-10 text-center text-sm text-muted">{t('videosPage.empty')}</p>
                )}

                {items.length > 0 && (
                    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item, index) => (
                            <VideoCard key={index} item={item} index={index} />
                        ))}
                    </div>
                )}
            </main>

            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        </div>
    );
}
