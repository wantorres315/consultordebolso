import { Outlet } from 'react-router-dom';
import DashboardTopbar from '../components/DashboardTopbar';
import ImpersonationBanner from '../components/ImpersonationBanner';

export default function MembroLayout() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-app px-6 text-ink antialiased">
            <div className="w-full max-w-6xl">
                <DashboardTopbar />

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
