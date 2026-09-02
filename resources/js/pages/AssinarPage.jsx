import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { fetchPublicPlan } from '../lib/api';
import { formatCurrency, getPlanPrice } from '../lib/currency';
import { getRoleHomePath } from '../router/roleHome';

const emptyForm = {
    account_name: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

export default function AssinarPage() {
    const { t } = useTranslation();
    const { planId } = useParams();
    const navigate = useNavigate();
    const { signup } = useAuth();
    const { locale } = useLocale();

    const [plan, setPlan] = useState(undefined);
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    useEffect(() => {
        fetchPublicPlan(planId)
            .then(({ data }) => setPlan(data))
            .catch(() => setPlan(null));
    }, [planId]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const user = await signup({
                ...form,
                plan_id: plan.id,
                billing_period: billingPeriod,
            });
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
        <div className="flex min-h-screen flex-col items-center bg-app px-6 text-ink antialiased">
            <Header onOpenAuth={() => setAuthOpen(true)} />

            <main className="flex w-full max-w-md flex-1 flex-col items-center justify-center py-12">
                {plan === undefined && <p className="text-sm text-muted">{t('common.loading')}</p>}

                {plan === null && (
                    <div className="text-center">
                        <p className="text-sm text-muted">{t('assinar.notFound')}</p>
                        <Link
                            to="/planos"
                            className="mt-4 inline-block text-sm font-medium text-ink underline underline-offset-4 hover:opacity-70"
                        >
                            {t('assinar.backToPlans')}
                        </Link>
                    </div>
                )}

                {plan && (
                    <div className="w-full rounded-3xl bg-surface p-6 shadow-sm shadow-black/5">
                        <div className="mb-6 text-center">
                            <h1 className="text-lg font-semibold text-ink">{plan.name}</h1>
                            <div className="mt-3 inline-flex items-center rounded-full border border-line p-0.5 text-xs font-medium">
                                <button
                                    type="button"
                                    onClick={() => setBillingPeriod('monthly')}
                                    className={`rounded-full px-3 py-1 transition-colors ${
                                        billingPeriod === 'monthly' ? 'bg-navy text-white' : 'text-muted hover:text-ink'
                                    }`}
                                >
                                    {t('assinar.monthly')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBillingPeriod('annual')}
                                    className={`rounded-full px-3 py-1 transition-colors ${
                                        billingPeriod === 'annual' ? 'bg-navy text-white' : 'text-muted hover:text-ink'
                                    }`}
                                >
                                    {t('assinar.annual')}
                                </button>
                            </div>
                            <p className="mt-3 text-2xl font-semibold text-ink">
                                {formatCurrency(getPlanPrice(plan, locale, billingPeriod), locale)}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                                {t('assinar.companySection')}
                            </p>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink">
                                    {t('assinar.companyName')}
                                </label>
                                <input
                                    type="text"
                                    name="account_name"
                                    value={form.account_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                                />
                                {errors.account_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.account_name[0]}</p>
                                )}
                            </div>

                            <p className="mt-2 text-xs font-semibold tracking-wide text-muted uppercase">
                                {t('assinar.ownerSection')}
                            </p>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink">{t('assinar.name')}</label>
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
                                <label className="mb-1 block text-sm font-medium text-ink">{t('assinar.email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink">
                                    {t('assinar.password')}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink">
                                    {t('assinar.passwordConfirmation')}
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
                                {submitting ? t('assinar.submitting') : t('assinar.submit')}
                            </button>

                            <p className="text-center text-xs text-muted">{t('assinar.pendingNotice')}</p>
                        </form>
                    </div>
                )}
            </main>

            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        </div>
    );
}
