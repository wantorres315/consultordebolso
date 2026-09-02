import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchAdminAccounts, approvePayment } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

function mapAccounts(accounts) {
    return accounts.map((account) => ({
        key: `account-${account.id}`,
        accountId: account.id,
        cliente: account.name,
        user: account.owner,
        planName: account.plan?.name ?? null,
        subscriptionStatus: account.subscription_status,
    }));
}

export default function ClientesPage() {
    const { t } = useTranslation();
    const { impersonate } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [impersonatingId, setImpersonatingId] = useState(null);
    const [approvingId, setApprovingId] = useState(null);

    useEffect(() => {
        fetchAdminAccounts()
            .then(({ data }) => setRows(mapAccounts(data.data)))
            .catch(() => setError(t('adminClientes.loadError')))
            .finally(() => setLoading(false));
    }, [t]);

    async function handleImpersonate(row) {
        setImpersonatingId(row.user.id);
        setError(null);

        try {
            await impersonate(row.user.id);
        } catch {
            setError(t('adminClientes.accessError'));
            setImpersonatingId(null);
        }
    }

    async function handleApprove(row) {
        setApprovingId(row.accountId);
        setError(null);

        try {
            await approvePayment(row.accountId);
            setRows((previous) =>
                previous.map((item) =>
                    item.accountId === row.accountId ? { ...item, subscriptionStatus: 'active' } : item,
                ),
            );
        } catch {
            setError(t('adminClientes.approveError'));
        } finally {
            setApprovingId(null);
        }
    }

    return (
        <div>
            <h1 className="text-xl font-semibold text-ink">{t('adminClientes.title')}</h1>

            {loading && <p className="mt-2 text-sm text-muted">{t('adminClientes.loading')}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {!loading && rows.length === 0 && !error && (
                <p className="mt-2 text-sm text-muted">{t('adminClientes.empty')}</p>
            )}

            {rows.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-line text-muted">
                                <th className="py-2 pr-4 font-medium">{t('adminClientes.colClient')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminClientes.colUser')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminClientes.colPlan')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminClientes.colSubscription')}</th>
                                <th className="py-2 pr-4 font-medium" />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.key} className="border-b border-line last:border-0">
                                    <td className="py-3 pr-4">
                                        <Link
                                            to={`/admin/clientes/${row.accountId}`}
                                            className="font-medium text-ink underline-offset-4 hover:underline"
                                        >
                                            {row.cliente}
                                        </Link>
                                    </td>
                                    <td className="py-3 pr-4">
                                        <div className="text-ink">{row.user.name}</div>
                                        <div className="text-muted">{row.user.email}</div>
                                    </td>
                                    <td className="py-3 pr-4 text-muted">{row.planName ?? '—'}</td>
                                    <td className="py-3 pr-4">
                                        {row.planName && (
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    row.subscriptionStatus === 'active'
                                                        ? 'bg-success text-white'
                                                        : 'bg-app text-muted'
                                                }`}
                                            >
                                                {row.subscriptionStatus === 'active'
                                                    ? t('adminClientes.statusActive')
                                                    : t('adminClientes.statusPending')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 pr-4 text-right whitespace-nowrap">
                                        {row.subscriptionStatus !== 'active' && (
                                            <button
                                                type="button"
                                                onClick={() => handleApprove(row)}
                                                disabled={approvingId === row.accountId}
                                                className="mr-2 rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-app disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {t('adminClientes.approvePayment')}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleImpersonate(row)}
                                            disabled={impersonatingId === row.user.id}
                                            className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {impersonatingId === row.user.id
                                                ? t('adminClientes.entering')
                                                : t('adminClientes.accessAsOwner')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
