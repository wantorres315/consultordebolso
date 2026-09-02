import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath } from '../router/roleHome';

export default function AuthModal({ onClose }) {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const user = await login(form);
            onClose();
            navigate(getRoleHomePath(user));
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(
                    error.response.data.errors ?? {
                        email: [error.response.data.message],
                    },
                );
            } else {
                setErrors({ email: [t('common.genericError')] });
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-ink">{t('auth.title')}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted hover:text-ink"
                        aria-label={t('common.close')}
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink">{t('auth.email')}</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink">{t('auth.password')}</label>
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

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-2 rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? t('auth.submitting') : t('auth.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
}
