import { useTranslation } from 'react-i18next';
import HomeSections from './home/HomeSections';

export default function Home() {
    const { t } = useTranslation();

    return (
        <main className="flex w-full flex-1 flex-col items-center">
            <h1 className="sr-only">{t('seo.siteHeading')}</h1>
            <HomeSections />
        </main>
    );
}
