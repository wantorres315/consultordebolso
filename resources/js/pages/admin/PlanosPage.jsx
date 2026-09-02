import { useEffect, useState } from 'react';
import { faPen, faStar, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import { fetchPlans, deletePlan } from '../../lib/api';
import { formatCurrency } from '../../lib/currency';
import PlanFormModal from '../../components/PlanFormModal';
import IconButton from '../../components/IconButton';

export default function PlanosPage() {
    const { t } = useTranslation();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalPlan, setModalPlan] = useState(undefined);

    useEffect(() => {
        fetchPlans()
            .then(({ data }) => setPlans(data))
            .catch(() => setError(t('adminPlanos.loadError')))
            .finally(() => setLoading(false));
    }, [t]);

    function handleSaved(plan) {
        setPlans((previous) => {
            const exists = previous.some((item) => item.id === plan.id);

            return exists
                ? previous.map((item) => (item.id === plan.id ? plan : item))
                : [plan, ...previous];
        });
    }

    async function handleDelete(plan) {
        if (!window.confirm(t('adminPlanos.confirmDelete', { name: plan.name }))) return;

        try {
            await deletePlan(plan.id);
            setPlans((previous) => previous.filter((item) => item.id !== plan.id));
        } catch {
            setError(t('adminPlanos.deleteError'));
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-ink">{t('adminPlanos.title')}</h1>
                <button
                    type="button"
                    onClick={() => setModalPlan(null)}
                    className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                >
                    {t('adminPlanos.newPlan')}
                </button>
            </div>

            {loading && <p className="mt-2 text-sm text-muted">{t('adminPlanos.loading')}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {!loading && plans.length === 0 && !error && (
                <p className="mt-2 text-sm text-muted">{t('adminPlanos.empty')}</p>
            )}

            {plans.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-line text-muted">
                                <th className="py-2 pr-4 font-medium">{t('adminPlanos.colName')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminPlanos.colMonthlyBrl')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminPlanos.colAnnualBrl')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminPlanos.colMonthlyUsd')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminPlanos.colAnnualUsd')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminPlanos.colMonthlyEur')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminPlanos.colAnnualEur')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminPlanos.colMembers')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminPlanos.colWalletPlans')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminPlanos.colStatus')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminPlanos.colFeatured')}</th>
                                <th className="py-2 pr-4 font-medium" />
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan) => (
                                <tr key={plan.id} className="border-b border-line last:border-0">
                                    <td className="py-3 pr-4 text-ink">{plan.name}</td>
                                    <td className="py-3 pr-4 text-ink">
                                        {formatCurrency(plan.monthly_price, 'pt-BR')}
                                    </td>
                                    <td className="py-3 pr-4 text-ink">
                                        {formatCurrency(plan.annual_price, 'pt-BR')}
                                    </td>
                                    <td className="py-3 pr-4 text-ink">
                                        {plan.monthly_price_usd != null
                                            ? formatCurrency(plan.monthly_price_usd, 'en')
                                            : '—'}
                                    </td>
                                    <td className="py-3 pr-4 text-ink">
                                        {plan.annual_price_usd != null
                                            ? formatCurrency(plan.annual_price_usd, 'en')
                                            : '—'}
                                    </td>
                                    <td className="py-3 pr-4 text-ink">
                                        {plan.monthly_price_eur != null
                                            ? formatCurrency(plan.monthly_price_eur, 'es')
                                            : '—'}
                                    </td>
                                    <td className="py-3 pr-4 text-ink">
                                        {plan.annual_price_eur != null
                                            ? formatCurrency(plan.annual_price_eur, 'es')
                                            : '—'}
                                    </td>
                                    <td className="py-3 pr-4 text-muted">{plan.max_members}</td>
                                    <td className="py-3 pr-4 text-muted">{plan.max_wallet_plans}</td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                plan.is_active ? 'bg-success text-white' : 'bg-app text-muted'
                                            }`}
                                        >
                                            {plan.is_active ? t('common.active') : t('common.inactive')}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4">
                                        {plan.is_featured && (
                                            <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5 text-brand" />
                                        )}
                                    </td>
                                    <td className="py-3 pr-4 text-right whitespace-nowrap">
                                        <IconButton
                                            icon={faPen}
                                            label={t('common.edit')}
                                            onClick={() => setModalPlan(plan)}
                                        />
                                        <IconButton
                                            icon={faTrash}
                                            label={t('common.delete')}
                                            tone="danger"
                                            onClick={() => handleDelete(plan)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalPlan !== undefined && (
                <PlanFormModal
                    plan={modalPlan}
                    onClose={() => setModalPlan(undefined)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
