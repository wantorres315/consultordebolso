import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath } from '../router/roleHome';

export default function PagamentoRetornoPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [stillPending, setStillPending] = useState(false);

    useEffect(() => {
        refreshUser()
            .then((user) => {
                if (!user) {
                    navigate('/', { replace: true });
                    return;
                }

                if (!user.account?.plan_id || user.account.subscription_status === 'active') {
                    navigate(getRoleHomePath(user), { replace: true });
                    return;
                }

                setStillPending(true);
            })
            .catch(() => navigate('/', { replace: true }));
    }, [navigate, refreshUser]);

    return (
        <div className="flex min-h-screen flex-col items-center bg-app px-6 text-ink antialiased">
            <Header />

            <main className="flex w-full max-w-md flex-1 flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted">
                    {stillPending ? t('paymentReturn.stillPending') : t('paymentReturn.checking')}
                </p>
            </main>
        </div>
    );
}
