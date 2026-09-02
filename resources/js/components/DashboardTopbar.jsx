import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-navy text-white' : 'text-muted hover:text-ink'
    }`;

export default function DashboardTopbar({ navItems = [] }) {
    const { user, logout } = useAuth();

    return (
        <header className="w-full">
            <nav className="flex flex-wrap items-center justify-between gap-4 py-6">
                <Logo />

                {navItems.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 rounded-full bg-surface p-1 shadow-sm shadow-black/5">
                        {navItems.map((item) => (
                            <NavLink key={item.to} to={item.to} className={linkClass}>
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    {user && <UserMenu user={user} onLogout={logout} />}
                </div>
            </nav>
        </header>
    );
}
