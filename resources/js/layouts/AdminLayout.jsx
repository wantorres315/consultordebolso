import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardTopbar from '../components/DashboardTopbar';

export default function AdminLayout() {
    const { t } = useTranslation();

    const navItems = [
        { to: 'dashboard', label: t('adminLayout.overview') },
        { to: 'clientes', label: t('adminLayout.clients') },
        { to: 'financeiro', label: t('adminLayout.financial') },
        { to: 'planos', label: t('adminLayout.plans') },
        { to: 'questionarios', label: t('adminLayout.questionnaires') },
        { to: 'site', label: t('adminLayout.site') },
        { to: 'suporte', label: t('adminLayout.support') },
    ];

    return (
        <div className="flex min-h-screen flex-col items-center bg-app px-6 text-ink antialiased">
            <div className="w-full max-w-7xl">
                <DashboardTopbar navItems={navItems} />

                <main className="w-full pb-12">
                    <div className="rounded-3xl bg-surface p-8 shadow-sm shadow-black/5">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
