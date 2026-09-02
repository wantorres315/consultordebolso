import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../context/LocaleContext';
import { formatCurrency, getPlanPrice } from '../lib/currency';

export default function PricingCard({ plan }) {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const featured = plan.is_featured;

    return (
        <div
            className={`relative flex flex-col rounded-3xl p-6 shadow-sm shadow-black/5 ${
                featured ? 'bg-navy text-white' : 'bg-surface text-ink'
            }`}
        >
            {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-ink">
                    {t('pricingCard.mostPopular')}
                </span>
            )}

            <h3 className="text-lg font-semibold">{plan.name}</h3>

            <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold">
                    {formatCurrency(getPlanPrice(plan, locale, 'monthly'), locale)}
                </span>
                <span className={`text-sm ${featured ? 'text-white/70' : 'text-muted'}`}>
                    {t('pricingCard.perMonth')}
                </span>
            </div>
            <p className={`mt-1 text-sm ${featured ? 'text-white/70' : 'text-muted'}`}>
                {t('pricingCard.or')} {formatCurrency(getPlanPrice(plan, locale, 'annual'), locale)}
                {t('pricingCard.perYear')}
            </p>

            <ul className="mt-6 flex flex-col gap-2 text-sm">
                <li className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-brand" />
                    {t('pricingCard.members', { count: plan.max_members })}
                </li>
                <li className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-brand" />
                    {t('pricingCard.walletPlans', { count: plan.max_wallet_plans })}
                </li>
            </ul>

            <Link
                to={`/assinar/${plan.id}`}
                className={`mt-6 rounded-full px-5 py-2 text-center text-sm font-medium transition-opacity hover:opacity-90 ${
                    featured ? 'bg-brand text-brand-ink' : 'bg-navy text-white'
                }`}
            >
                {t('pricingCard.subscribe')}
            </Link>
        </div>
    );
}
