import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchAccount } from '../../lib/api';
import StatTile from '../../components/StatTile';
import WalletPlanCreditsHistory from '../../components/WalletPlanCreditsHistory';
import { useLocale } from '../../context/LocaleContext';

function formatCycleDate(value, locale) {
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
        new Date(value)
    );
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAccount()
            .then(({ data }) => setData(data))
            .catch(() => setError(t('donoDashboard.loadError')));
    }, [t]);

    return (
        <div>
            <h1 className="text-xl font-semibold text-ink">{t('donoDashboard.overview')}</h1>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {data && (
                <>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatTile
                            label={t('donoDashboard.members')}
                            value={`${data.seats.used}/${data.seats.max}`}
                        />
                        <StatTile
                            label={t('donoDashboard.pendingInvites')}
                            value={data.account.pending_invitations?.length ?? 0}
                        />
                        <StatTile
                            label={t('donoDashboard.walletPlanCredits')}
                            value={
                                data.wallet_plan_credits.limit === null
                                    ? '—'
                                    : `${data.wallet_plan_credits.used}/${data.wallet_plan_credits.limit}`
                            }
                        />
                    </div>

                    {data.billing_cycle && (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4">
                            <div>
                                <p className="text-sm font-medium text-ink">{t('donoDashboard.cycleTitle')}</p>
                                <p className="mt-0.5 text-sm text-muted">
                                    {t('donoDashboard.cycleRange', {
                                        start: formatCycleDate(data.billing_cycle.started_at, locale),
                                        end: formatCycleDate(data.billing_cycle.ends_at, locale),
                                    })}
                                </p>
                            </div>
                            <Link
                                to="/dono/perguntas"
                                className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                            >
                                {t('donoDashboard.buyMoreWalletPlans')}
                            </Link>
                        </div>
                    )}

                    <WalletPlanCreditsHistory history={data.wallet_plan_credits_history} />

                    <h2 className="mt-8 text-sm font-medium text-muted">{t('donoDashboard.members')}</h2>

                    <ul className="mt-2 divide-y divide-line">
                        <li className="py-3 text-sm">
                            <div className="text-ink">
                                {data.account.owner.name}
                                <span className="ml-2 rounded-full bg-app px-2 py-0.5 text-xs font-medium text-muted">
                                    {t('donoDashboard.ownerBadge')}
                                </span>
                            </div>
                            <div className="text-muted">{data.account.owner.email}</div>
                        </li>
                        {data.account.members.map((member) => (
                            <li key={member.id} className="py-3 text-sm">
                                <div className="text-ink">{member.name}</div>
                                <div className="text-muted">{member.email}</div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
