import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAccount, createAccountInvitation, deleteAccountInvitation } from '../../lib/api';

export default function UsuariosPage() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState(null);
    const [cancelingId, setCancelingId] = useState(null);

    function load() {
        return fetchAccount()
            .then(({ data }) => setData(data))
            .catch(() => setError(t('donoUsuarios.loadError')));
    }

    useEffect(() => {
        setLoading(true);
        load().finally(() => setLoading(false));
    }, [t]);

    async function handleInvite(event) {
        event.preventDefault();
        setInviting(true);
        setInviteError(null);

        try {
            await createAccountInvitation(name, email);
            setName('');
            setEmail('');
            await load();
        } catch (err) {
            setInviteError(
                err.response?.data?.message ??
                    err.response?.data?.errors?.name?.[0] ??
                    err.response?.data?.errors?.email?.[0] ??
                    t('common.genericError')
            );
        } finally {
            setInviting(false);
        }
    }

    async function handleCancelInvitation(invitationId) {
        setCancelingId(invitationId);
        setError(null);

        try {
            await deleteAccountInvitation(invitationId);
            await load();
        } catch {
            setError(t('donoUsuarios.cancelError'));
        } finally {
            setCancelingId(null);
        }
    }

    const canInviteMore = data ? data.seats.used < data.seats.max : false;
    const pendingInvitations = data?.account.pending_invitations ?? [];

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-ink">{t('donoUsuarios.title')}</h1>
                {data && (
                    <span className="text-sm text-muted">
                        {t('donoUsuarios.seats', { used: data.seats.used, max: data.seats.max })}
                    </span>
                )}
            </div>

            {loading && <p className="mt-2 text-sm text-muted">{t('donoUsuarios.loading')}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {data && (
                <>
                    {canInviteMore ? (
                        <form onSubmit={handleInvite} className="mt-4 flex flex-wrap gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                placeholder={t('donoUsuarios.namePlaceholder')}
                                className="flex-1 rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                placeholder={t('donoUsuarios.invitePlaceholder')}
                                className="flex-1 rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={inviting}
                                className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {inviting ? t('donoUsuarios.inviting') : t('donoUsuarios.invite')}
                            </button>
                        </form>
                    ) : (
                        <p className="mt-4 text-sm text-muted">{t('donoUsuarios.limitReached')}</p>
                    )}
                    {inviteError && <p className="mt-1 text-sm text-red-600">{inviteError}</p>}

                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-line text-muted">
                                    <th className="py-2 pr-4 font-medium">{t('donoUsuarios.colMember')}</th>
                                    <th className="py-2 pr-4 font-medium">{t('donoUsuarios.colStatus')}</th>
                                    <th className="py-2 pr-4 font-medium" />
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-line">
                                    <td className="py-3 pr-4">
                                        <div className="text-ink">
                                            {data.account.owner.name}
                                            <span className="ml-2 rounded-full bg-app px-2 py-0.5 text-xs font-medium text-muted">
                                                {t('donoDashboard.ownerBadge')}
                                            </span>
                                        </div>
                                        <div className="text-muted">{data.account.owner.email}</div>
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span className="rounded-full bg-success px-3 py-1 text-xs font-medium text-white">
                                            {t('donoUsuarios.statusActive')}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4" />
                                </tr>
                                {data.account.members.map((member) => (
                                    <tr key={`member-${member.id}`} className="border-b border-line">
                                        <td className="py-3 pr-4">
                                            <div className="text-ink">{member.name}</div>
                                            <div className="text-muted">{member.email}</div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className="rounded-full bg-success px-3 py-1 text-xs font-medium text-white">
                                                {t('donoUsuarios.statusActive')}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4" />
                                    </tr>
                                ))}
                                {pendingInvitations.map((invitation) => (
                                    <tr key={`invitation-${invitation.id}`} className="border-b border-line last:border-0">
                                        <td className="py-3 pr-4">
                                            <div className="text-ink">{invitation.name}</div>
                                            <div className="text-muted">{invitation.email}</div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className="rounded-full bg-app px-3 py-1 text-xs font-medium text-muted">
                                                {t('donoUsuarios.statusPending')}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleCancelInvitation(invitation.id)}
                                                disabled={cancelingId === invitation.id}
                                                className="text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {t('donoUsuarios.cancelInvite')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
