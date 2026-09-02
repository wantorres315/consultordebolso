import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import PricingCard from '../components/PricingCard';
import AuthModal from '../components/AuthModal';
import { fetchPublicPlans } from '../lib/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function PlanosPublicPage() {
    const { t } = useTranslation();
    const [authOpen, setAuthOpen] = useState(false);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useDocumentMeta({
        title: `${t('planosPublicPage.title')} · ${import.meta.env.VITE_APP_NAME}`,
        description: t('planosPublicPage.subtitle'),
    });

    useEffect(() => {
        fetchPublicPlans()
            .then(({ data }) => setPlans(data))
            .catch(() => setPlans([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center bg-app px-6 text-ink antialiased">
            <Header onOpenAuth={() => setAuthOpen(true)} />

            <main className="w-full max-w-6xl py-16">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{t('planosPublicPage.title')}</h1>
                    <p className="mt-2 text-muted">{t('planosPublicPage.subtitle')}</p>
                </div>

                {loading && <p className="mt-10 text-center text-sm text-muted">{t('planosPublicPage.loading')}</p>}
                {!loading && plans.length === 0 && (
                    <p className="mt-10 text-center text-sm text-muted">{t('planosPublicPage.empty')}</p>
                )}

                {plans.length > 0 && (
                    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <PricingCard key={plan.id} plan={plan} />
                        ))}
                    </div>
                )}
            </main>

            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        </div>
    );
}
