import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { fetchPublicPlan, createCheckout } from '../lib/api';
import { formatCurrency } from '../lib/currency';
import { getRoleHomePath } from '../router/roleHome';

export default function PagamentoPendentePage() {
    const { t } = useTranslation();
    const { user, loading } = useAuth();
    const [plan, setPlan] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const planId = user?.account?.plan_id;

    useEffect(() => {
        if (!planId) return;

        fetchPublicPlan(planId)
            .then(({ data }) => setPlan(data))
            .catch(() => setPlan(null));
    }, [planId]);

    if (loading) return null;
    if (!user) return <Navigate to="/" replace />;
    if (!planId || user.account.subscription_status === 'active') {
        return <Navigate to={getRoleHomePath(user)} replace />;
    }

    async function handlePay() {
        setSubmitting(true);
        setError(null);

        try {
            const { data } = await createCheckout();
            window.location.href = data.init_point;
        } catch {
            setError(t('common.genericError'));
            setSubmitting(false);
        }
    }

    const price =
        plan && (user.account.billing_period === 'annual' ? plan.annual_price : plan.monthly_price);

    return (
        <div className="flex min-h-screen flex-col items-center bg-app px-6 text-ink antialiased">
            <Header />

            <main className="flex w-full max-w-md flex-1 flex-col items-center justify-center py-12 text-center">
                <div className="w-full rounded-3xl bg-surface p-6 shadow-sm shadow-black/5">
                    <h1 className="text-lg font-semibold text-ink">{t('paymentPending.title')}</h1>
                    <p className="mt-2 text-sm text-muted">{t('paymentPending.subtitle')}</p>

                    {plan && (
                        <div className="mt-4 rounded-2xl bg-app p-4">
                            <p className="text-sm font-medium text-ink">{plan.name}</p>
                            <p className="mt-1 text-2xl font-semibold text-ink">
                                {formatCurrency(price, 'pt-BR')}
                            </p>
                        </div>
                    )}

                    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                    <button
                        type="button"
                        onClick={handlePay}
                        disabled={submitting}
                        className="mt-6 w-full rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? t('paymentPending.submitting') : t('paymentPending.pay')}
                    </button>

                    <p className="mt-3 text-xs text-muted">{t('paymentPending.manualNotice')}</p>
                </div>
            </main>
        </div>
    );
}
