import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchPublicPlans } from '../lib/api';
import PricingCard from './PricingCard';

export default function PlanosSection() {
    const { t } = useTranslation();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublicPlans()
            .then(({ data }) => setPlans(data))
            .catch(() => setPlans([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading || plans.length === 0) return null;

    const showAllLink = plans.length > 3;
    const featured = plans.filter((plan) => plan.is_featured);
    const visiblePlans = showAllLink ? (featured.length > 0 ? featured : plans.slice(0, 3)) : plans;

    return (
        <section className="w-full max-w-6xl py-16">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{t('plansSection.title')}</h2>
                <p className="mt-2 text-muted">{t('plansSection.subtitle')}</p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePlans.map((plan) => (
                    <PricingCard key={plan.id} plan={plan} />
                ))}
            </div>

            {showAllLink && (
                <div className="mt-8 text-center">
                    <Link
                        to="/planos"
                        className="text-sm font-medium text-ink underline underline-offset-4 hover:opacity-70"
                    >
                        {t('plansSection.viewAll')}
                    </Link>
                </div>
            )}
        </section>
    );
}
