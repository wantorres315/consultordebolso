import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchSupportTickets } from '../../lib/api';
import SupportTicketFormModal from '../../components/SupportTicketFormModal';

export default function SuportePage() {
    const { t, i18n } = useTranslation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchSupportTickets()
            .then(({ data }) => setTickets(data.data))
            .catch(() => setError(t('donoSuporte.loadError')))
            .finally(() => setLoading(false));
    }, [t]);

    function handleCreated(ticket) {
        setTickets((previous) => [{ ...ticket, messages_count: 1 }, ...previous]);
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-ink">{t('donoSuporte.title')}</h1>
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                >
                    {t('donoSuporte.newTicket')}
                </button>
            </div>

            {loading && <p className="mt-2 text-sm text-muted">{t('donoSuporte.loading')}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {!loading && tickets.length === 0 && !error && (
                <p className="mt-2 text-sm text-muted">{t('donoSuporte.empty')}</p>
            )}

            {tickets.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-line text-muted">
                                <th className="py-2 pr-4 font-medium">{t('donoSuporte.colSubject')}</th>
                                <th className="py-2 pr-4 font-medium">{t('donoSuporte.colMessages')}</th>
                                <th className="py-2 pr-4 font-medium">{t('donoSuporte.colUpdatedAt')}</th>
                                <th className="py-2 pr-4 font-medium">{t('donoSuporte.colStatus')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} className="border-b border-line last:border-0">
                                    <td className="py-3 pr-4">
                                        <Link
                                            to={`/dono/suporte/${ticket.id}`}
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
                                                ? t('donoSuporte.statusClosed')
                                                : t('donoSuporte.statusOpen')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && <SupportTicketFormModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
        </div>
    );
}
