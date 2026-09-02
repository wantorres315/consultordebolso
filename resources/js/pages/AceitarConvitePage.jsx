import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { fetchInvitation, acceptInvitation } from '../lib/api';
import { getRoleHomePath } from '../router/roleHome';

export default function AceitarConvitePage() {
    const { t } = useTranslation();
    const { token } = useParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [invitation, setInvitation] = useState(undefined);
    const [form, setForm] = useState({ name: '', password: '', password_confirmation: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    useEffect(() => {
        fetchInvitation(token)
            .then(({ data }) => {
                setInvitation(data.invitation);
                setForm((previous) => ({ ...previous, name: data.invitation.name ?? '' }));
            })
            .catch(() => setInvitation(null));
    }, [token]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await acceptInvitation(token, form);
            const user = await refreshUser();
            navigate(getRoleHomePath(user));
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(
                    error.response.data.errors ?? {
                        name: [error.response.data.message],
                    }
                );
            } else {
                setErrors({ name: [t('common.genericError')] });
            }
        } finally {
            setSubmitting(false);
        }
    }

    const canAccept = invitation && !invitation.expired && !invitation.accepted;

    return (
        <div className="flex min-h-screen flex-col items-center bg-app px-6 text-ink antialiased">
            <Header onOpenAuth={() => setAuthOpen(true)} />

            <main className="flex w-full max-w-md flex-1 flex-col items-center justify-center py-12 text-center">
                {invitation === undefined && <p className="text-sm text-muted">{t('common.loading')}</p>}

                {invitation === null && <p className="text-sm text-muted">{t('acceptInvite.notFound')}</p>}

                {invitation && invitation.expired && (
                    <p className="text-sm text-muted">{t('acceptInvite.expired')}</p>
                )}

                {invitation && invitation.accepted && (
                    <p className="text-sm text-muted">{t('acceptInvite.alreadyAccepted')}</p>
                )}

                {canAccept && (
                    <div className="w-full rounded-3xl bg-surface p-6 text-left shadow-sm shadow-black/5">
                        <h1 className="text-lg font-semibold text-ink">{t('acceptInvite.title')}</h1>
                        <p className="mt-1 text-sm text-muted">
                            {t('acceptInvite.subtitle', { account: invitation.account_name })}
                        </p>

                        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink">
                                    {t('acceptInvite.email')}
                                </label>
                                <input
                                    type="email"
                                    value={invitation.email}
                                    disabled
                                    className="w-full rounded-xl border border-line bg-app px-3 py-2 text-sm text-muted"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink">
                                    {t('acceptInvite.name')}
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink">
                                    {t('acceptInvite.password')}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink">
                                    {t('acceptInvite.passwordConfirmation')}
                                </label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={form.password_confirmation}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-2 rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? t('acceptInvite.submitting') : t('acceptInvite.submit')}
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        </div>
    );
}
