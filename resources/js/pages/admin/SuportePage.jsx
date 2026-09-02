import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchAdminSupportTickets } from '../../lib/api';

export default function SuportePage() {
    const { t, i18n } = useTranslation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        setLoading(true);
        fetchAdminSupportTickets(1, statusFilter || undefined)
            .then(({ data }) => setTickets(data.data))
            .catch(() => setError(t('adminSuporte.loadError')))
            .finally(() => setLoading(false));
    }, [statusFilter, t]);

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-xl font-semibold text-ink">{t('adminSuporte.title')}</h1>
                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-full border border-line px-4 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                >
                    <option value="">{t('adminSuporte.filterAll')}</option>
                    <option value="open">{t('adminSuporte.statusOpen')}</option>
                    <option value="closed">{t('adminSuporte.statusClosed')}</option>
                </select>
            </div>

            {loading && <p className="mt-2 text-sm text-muted">{t('adminSuporte.loading')}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {!loading && tickets.length === 0 && !error && (
                <p className="mt-2 text-sm text-muted">{t('adminSuporte.empty')}</p>
            )}

            {tickets.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-line text-muted">
                                <th className="py-2 pr-4 font-medium">{t('adminSuporte.colClient')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminSuporte.colSubject')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminSuporte.colMessages')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminSuporte.colUpdatedAt')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminSuporte.colStatus')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} className="border-b border-line last:border-0">
                                    <td className="py-3 pr-4 text-ink">{ticket.account?.name}</td>
                                    <td className="py-3 pr-4">
                                        <Link
                                            to={`/admin/suporte/${ticket.id}`}
                                            className="font-medium text-ink underline-offset-4 hover:underline"
                                        >
                                            {ticket.subject}
                                        </Link>
                                    </td>
                                    <td className="py-3 pr-4 text-muted">{ticket.messages_count}</td>
                                    <td className="py-3 pr-4 text-muted">
                                        {ticket.last_message_at
                                            ? new Date(ticket.last_message_at).toLocaleString(i18n.language, {
                                                  dateStyle: 'short',
                                                  timeStyle: 'short',
                                              })
                                            : '—'}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                ticket.status === 'closed' ? 'bg-app text-muted' : 'bg-success text-white'
                                            }`}
                                        >
                                            {ticket.status === 'closed'
                                                ? t('adminSuporte.statusClosed')
                                                : t('adminSuporte.statusOpen')}
                                        </span>
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
