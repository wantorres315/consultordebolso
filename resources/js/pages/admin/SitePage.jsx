import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createAdminHomeSection, fetchAdminHomeSections } from '../../lib/api';
import HomeSectionCard from '../../components/admin/home/HomeSectionCard';

const DEFAULT_CONTENT = {
    slider: { slides: [] },
    testimonials: { title: '', items: [] },
    videos: { title: '', items: [] },
    text: { title: '', body: '' },
    text_image: { title: '', body: '', image_url: '', image_position: 'left' },
    plans: {},
};

const TYPES = ['slider', 'testimonials', 'videos', 'text', 'text_image', 'plans'];

export default function SitePage() {
    const { t } = useTranslation();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adding, setAdding] = useState(false);

    const reload = useCallback(() => {
        return fetchAdminHomeSections()
            .then(({ data }) => setSections(data))
            .catch(() => setError(t('adminSite.loadError')));
    }, [t]);

    useEffect(() => {
        setLoading(true);
        reload().finally(() => setLoading(false));
    }, [reload]);

    async function handleAdd(type) {
        setAdding(true);

        try {
            await createAdminHomeSection({ type, content: DEFAULT_CONTENT[type] });
            await reload();
        } finally {
            setAdding(false);
        }
    }

    return (
        <div>
            <h1 className="text-xl font-semibold text-ink">{t('adminSite.title')}</h1>
            <p className="mt-1 text-sm text-muted">{t('adminSite.subtitle')}</p>

            {loading && <p className="mt-4 text-sm text-muted">{t('adminSite.loading')}</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {!loading && sections.length === 0 && !error && (
                <p className="mt-4 text-sm text-muted">{t('adminSite.empty')}</p>
            )}

            <div className="mt-6 flex flex-col gap-4">
                {sections.map((section, index) => (
                    <HomeSectionCard
                        key={section.id}
                        section={section}
                        isFirst={index === 0}
                        isLast={index === sections.length - 1}
                        onChanged={reload}
                    />
                ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {TYPES.map((type) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => handleAdd(type)}
                        disabled={adding}
                        className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-app disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {t('adminSite.addSection', { type: t(`adminSite.type.${type}`) })}
                    </button>
                ))}
            </div>
        </div>
    );
}
