import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAdminFinancialSummary } from '../../../lib/api';
import { formatCurrency } from '../../../lib/currency';
import useMonthNavigator from '../../../hooks/useMonthNavigator';
import StatTile from '../../../components/StatTile';
import MonthNavigator from '../../../components/MonthNavigator';

const TYPE_LABEL_KEYS = {
    subscription: 'adminFinanceiro.typeSubscription',
    questionnaire_purchase: 'adminFinanceiro.typePurchase',
    manual: 'adminFinanceiro.typeManual',
};

export default function ResumoPage() {
    const { t, i18n } = useTranslation();
    const { month, range: monthRange, goToPreviousMonth, goToNextMonth } = useMonthNavigator();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const monthLabel = useMemo(
        () => new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(month),
        [month, i18n.language]
    );

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetchAdminFinancialSummary(monthRange)
            .then(({ data }) => setSummary(data))
            .catch(() => setError(t('adminFinanceiro.loadError')))
            .finally(() => setLoading(false));
    }, [t, monthRange.from, monthRange.to]);

    return (
        <div>
            <h1 className="text-xl font-semibold text-ink">{t('adminFinanceiro.resumoTitle')}</h1>

            <div className="mt-6">
                <MonthNavigator month={month} onPrevious={goToPreviousMonth} onNext={goToNextMonth} />
            </div>

            {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
            {loading && <p className="mt-4 text-center text-sm text-muted">{t('common.loading')}</p>}

            {!loading && summary && (
                <>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatTile
                            label={t('adminFinanceiro.revenueInMonth')}
                            value={formatCurrency(summary.revenue_total, 'pt-BR')}
                        />
                        <StatTile
                            label={t('adminFinanceiro.expensesInMonth', { month: monthLabel })}
                            value={formatCurrency(summary.expenses_total, 'pt-BR')}
                        />
                        <StatTile
                            label={t('adminFinanceiro.balance')}
                            value={formatCurrency(summary.balance, 'pt-BR')}
                            tone={summary.balance < 0 ? 'danger' : 'success'}
                        />
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <div>
                            <h2 className="text-sm font-semibold text-ink">{t('adminFinanceiro.revenueByType')}</h2>
                            {Object.keys(summary.revenue_by_type).length === 0 ? (
                                <p className="mt-2 text-sm text-muted">{t('adminFinanceiro.noDataMonth')}</p>
                            ) : (
                                <table className="mt-2 w-full text-left text-sm">
                                    <tbody>
                                        {Object.entries(summary.revenue_by_type).map(([type, total]) => (
                                            <tr key={type} className="border-b border-line last:border-0">
                                                <td className="py-2 pr-4 text-ink">
                                                    {t(TYPE_LABEL_KEYS[type] ?? 'adminFinanceiro.typeManual')}
                                                </td>
                                                <td className="py-2 text-right font-medium text-ink">
                                                    {formatCurrency(total, 'pt-BR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-ink">
                                {t('adminFinanceiro.expensesByCategory')}
                            </h2>
                            {summary.expenses_by_category.length === 0 ? (
                                <p className="mt-2 text-sm text-muted">{t('adminFinanceiro.noDataMonth')}</p>
                            ) : (
                                <table className="mt-2 w-full text-left text-sm">
                                    <tbody>
                                        {summary.expenses_by_category.map((row) => (
                                            <tr
                                                key={row.category_id ?? 'none'}
                                                className="border-b border-line last:border-0"
                                            >
                                                <td className="py-2 pr-4 text-ink">
                                                    {row.category_name ?? t('categorySelect.none')}
                                                </td>
                                                <td className="py-2 text-right font-medium text-ink">
                                                    {formatCurrency(row.total, 'pt-BR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
