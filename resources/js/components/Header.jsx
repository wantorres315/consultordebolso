import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ onOpenAuth }) {
    const { t } = useTranslation();
    const { user, loading, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-40 -mx-6 w-[calc(100%+3rem)] px-6 transition-all duration-300 ${
                scrolled ? 'border-b border-line bg-surface/90 shadow-sm backdrop-blur-md' : 'border-b border-transparent bg-transparent'
            }`}
        >
            <nav
                className={`mx-auto flex w-full max-w-6xl items-center justify-between gap-4 transition-all duration-300 ${
                    scrolled ? 'py-3' : 'py-6'
                }`}
            >
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
