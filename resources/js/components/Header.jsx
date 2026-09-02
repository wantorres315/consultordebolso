import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ onOpenAuth }) {
    const { t } = useTranslation();
    const { user, loading, logout } = useAuth();

    return (
        <header className="w-full max-w-6xl">
            <nav className="flex items-center justify-between gap-4 py-6">
                <Logo />

                <div className="flex items-center gap-3 text-sm">
                    <LanguageSwitcher />
                    <ThemeToggle />

                    {loading ? null : user ? (
                        <UserMenu user={user} onLogout={logout} />
                    ) : (
                        <button
                            type="button"
                            onClick={onOpenAuth}
                            className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                        >
                            {t('header.login')}
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
}
