import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAdminPayments } from '../../../lib/api';
import { formatCurrency } from '../../../lib/currency';
import StatTile from '../../../components/StatTile';
import PaymentFormModal from '../../../components/PaymentFormModal';

const TYPE_LABEL_KEYS = {
    subscription: 'adminFinanceiro.typeSubscription',
    questionnaire_purchase: 'adminFinanceiro.typePurchase',
    manual: 'adminFinanceiro.typeManual',
};

export default function PagamentosPage() {
    const { t } = useTranslation();
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    function load() {
        return fetchAdminPayments()
            .then(({ data }) => {
                setPayments(data.payments.data);
                setSummary(data.summary);
            })
            .catch(() => setError(t('adminFinanceiro.loadError')));
    }

    useEffect(() => {
        load().finally(() => setLoading(false));
    }, [t]);

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-ink">{t('adminFinanceiro.pagamentosTitle')}</h1>
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                >
                    {t('adminFinanceiro.registerPayment')}
                </button>
            </div>

            {loading && <p className="mt-2 text-sm text-muted">{t('common.loading')}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {summary && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatTile
                        label={t('adminFinanceiro.totalRevenue')}
                        value={formatCurrency(summary.total, 'pt-BR')}
                    />
                    <StatTile
                        label={t('adminFinanceiro.revenueThisMonth')}
                        value={formatCurrency(summary.this_month, 'pt-BR')}
                    />
                    <StatTile
                        label={t('adminFinanceiro.subscriptionsRevenue')}
                        value={formatCurrency(summary.subscriptions_total, 'pt-BR')}
                    />
                    <StatTile
                        label={t('adminFinanceiro.purchasesRevenue')}
                        value={formatCurrency(summary.questionnaire_purchases_total, 'pt-BR')}
                    />
                    <StatTile
                        label={t('adminFinanceiro.manualRevenue')}
                        value={formatCurrency(summary.manual_total, 'pt-BR')}
                    />
                </div>
            )}

            {!loading && payments.length === 0 && !error && (
                <p className="mt-4 text-sm text-muted">{t('adminFinanceiro.paymentsEmpty')}</p>
            )}

            {payments.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-line text-muted">
                                <th className="py-2 pr-4 font-medium">{t('adminFinanceiro.colDate')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminFinanceiro.colAccount')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminFinanceiro.colDescription')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminFinanceiro.colType')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminFinanceiro.colMethod')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminFinanceiro.colAmount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id} className="border-b border-line last:border-0">
                                    <td className="py-3 pr-4 text-ink">
                                        {new Intl.DateTimeFormat('pt-BR', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        }).format(new Date(payment.paid_at))}
                                    </td>
                                    <td className="py-3 pr-4 text-ink">{payment.account?.name ?? '—'}</td>
                                    <td className="py-3 pr-4 text-muted">{payment.description ?? '—'}</td>
                                    <td className="py-3 pr-4 text-muted">
                                        {t(TYPE_LABEL_KEYS[payment.type] ?? 'adminFinanceiro.typeManual')}
                                    </td>
                                    <td className="py-3 pr-4 text-muted">
                                        {payment.method === 'manual'
                                            ? t('adminFinanceiro.methodManual')
                                            : t('adminFinanceiro.methodMercadoPago')}
                                    </td>
                                    <td className="py-3 pr-4 font-medium text-ink">
                                        {formatCurrency(payment.amount, 'pt-BR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <PaymentFormModal
                    onClose={() => setShowModal(false)}
                    onSaved={() => load()}
                />
            )}
        </div>
    );
}
