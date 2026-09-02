import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAdminDashboard } from '../../lib/api';
import StatTile from '../../components/StatTile';

export default function DashboardPage() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdminDashboard()
            .then(({ data }) => setData(data))
            .catch(() => setError(t('adminDashboard.loadError')));
    }, [t]);

    return (
        <div>
            <h1 className="text-xl font-semibold text-ink">{t('adminDashboard.overview')}</h1>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {data && (
                <>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatTile label={t('adminDashboard.clients')} value={data.accounts_count} />
                        <StatTile label={t('adminDashboard.members')} value={data.members_count} />
                        <StatTile
                            label={t('adminDashboard.pendingInvites')}
                            value={data.pending_invitations_count}
                        />
                    </div>

                    <h2 className="mt-8 text-sm font-medium text-muted">{t('adminDashboard.recentAccounts')}</h2>

                    {data.recent_accounts.length === 0 ? (
                        <p className="mt-2 text-sm text-muted">{t('adminDashboard.empty')}</p>
                    ) : (
                        <ul className="mt-2 divide-y divide-line">
                            {data.recent_accounts.map((account) => (
                                <li key={account.id} className="flex items-center justify-between py-3 text-sm">
                                    <span className="text-ink">{account.name}</span>
                                    <span className="text-muted">
                                        {account.owner?.name} · {account.owner?.email}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}
