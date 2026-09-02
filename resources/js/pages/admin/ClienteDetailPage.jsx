import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchAdminAccount, approvePayment } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import StatTile from '../../components/StatTile';
import WalletPlanCreditsHistory from '../../components/WalletPlanCreditsHistory';

export default function ClienteDetailPage() {
    const { t } = useTranslation();
    const { accountId } = useParams();
    const { impersonate } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [approving, setApproving] = useState(false);
    const [impersonatingId, setImpersonatingId] = useState(null);

    useEffect(() => {
        fetchAdminAccount(accountId)
            .then(({ data }) => setData(data))
            .catch(() => setError(t('adminClienteDetail.loadError')))
            .finally(() => setLoading(false));
    }, [accountId, t]);

    async function handleApprove() {
        setApproving(true);
        setError(null);

        try {
            await approvePayment(accountId);
            setData((previous) => ({
                ...previous,
                account: { ...previous.account, subscription_status: 'active' },
            }));
        } catch {
            setError(t('adminClientes.approveError'));
        } finally {
            setApproving(false);
        }
    }

    async function handleImpersonate(user) {
        setImpersonatingId(user.id);
        setError(null);

        try {
            await impersonate(user.id);
        } catch {
            setError(t('adminClientes.accessError'));
            setImpersonatingId(null);
        }
    }

    return (
        <div>
            <Link
                to="/admin/clientes"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
                {t('adminClienteDetail.back')}
            </Link>

            {loading && <p className="mt-4 text-sm text-muted">{t('adminClienteDetail.loading')}</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {data && (
                <>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold text-ink">{data.account.name}</h1>
                            <p className="mt-1 text-sm text-muted">
                                {data.account.plan?.name ?? t('adminClienteDetail.noPlan')}
                                {data.account.plan && (
                                    <span
                                        className={`ml-2 rounded-full px-3 py-1 text-xs font-medium ${
                                            data.account.subscription_status === 'active'
                                                ? 'bg-success text-white'
                                                : 'bg-app text-muted'
                                        }`}
                                    >
                                        {data.account.subscription_status === 'active'
                                            ? t('adminClientes.statusActive')
                                            : t('adminClientes.statusPending')}
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {data.account.plan && data.account.subscription_status !== 'active' && (
                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={approving}
                                    className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-app disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {t('adminClientes.approvePayment')}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleImpersonate(data.account.owner)}
                                disabled={impersonatingId === data.account.owner.id}
                                className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {impersonatingId === data.account.owner.id
                                    ? t('adminClientes.entering')
                                    : t('adminClientes.accessAsOwner')}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatTile
                            label={t('adminClienteDetail.membersUsage')}
                            value={`${data.seats.used}/${data.seats.max}`}
                        />
                        <StatTile
                            label={t('adminClienteDetail.pendingInvites')}
                            value={data.account.pending_invitations?.length ?? 0}
                        />
                        <StatTile
                            label={t('adminClienteDetail.walletPlanCredits')}
                            value={
                                data.wallet_plan_credits.limit === null
                                    ? '—'
                                    : `${data.wallet_plan_credits.used}/${data.wallet_plan_credits.limit}`
                            }
                        />
                    </div>

                    <WalletPlanCreditsHistory history={data.wallet_plan_credits_history} />

                    <h2 className="mt-8 text-sm font-medium text-muted">{t('adminClienteDetail.usersTitle')}</h2>
                    <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-line text-muted">
                                    <th className="py-2 pr-4 font-medium">{t('adminClientes.colUser')}</th>
                                    <th className="py-2 pr-4 font-medium">{t('adminClienteDetail.colRole')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-line">
                                    <td className="py-3 pr-4">
                                        <div className="text-ink">{data.account.owner.name}</div>
                                        <div className="text-muted">{data.account.owner.email}</div>
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span className="rounded-full bg-navy px-3 py-1 text-xs font-medium text-white">
                                            {t('adminClienteDetail.roleOwner')}
                                        </span>
                                    </td>
                                </tr>
                                {data.account.members.map((member) => (
                                    <tr key={member.id} className="border-b border-line last:border-0">
                                        <td className="py-3 pr-4">
                                            <div className="text-ink">{member.name}</div>
                                            <div className="text-muted">{member.email}</div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className="rounded-full bg-app px-3 py-1 text-xs font-medium text-muted">
                                                {t('adminClienteDetail.roleMember')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h2 className="mt-8 text-sm font-medium text-muted">
                        {t('adminClienteDetail.questionnairesTitle')}
                    </h2>
                    <p className="mt-2 text-sm text-muted">{t('common.underConstruction')}</p>
                </>
            )}
        </div>
    );
}
