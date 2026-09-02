import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardTopbar from '../components/DashboardTopbar';
import ImpersonationBanner from '../components/ImpersonationBanner';

export default function DonoLayout() {
    const { t } = useTranslation();

    const navItems = [
        { to: 'dashboard', label: t('donoLayout.overview') },
        { to: 'usuarios', label: t('donoLayout.users') },
        { to: 'perguntas', label: t('donoLayout.questions') },
        { to: 'suporte', label: t('donoLayout.support') },
    ];

    return (
        <div className="flex min-h-screen flex-col items-center bg-app px-6 text-ink antialiased">
            <div className="w-full max-w-6xl">
                <DashboardTopbar navItems={navItems} />

                <main className="w-full pb-12">
                    <ImpersonationBanner />
                    <div className="rounded-3xl bg-surface p-8 shadow-sm shadow-black/5">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
