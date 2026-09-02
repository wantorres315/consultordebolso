import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRoleHomePath } from '../router/roleHome';

function initials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
}

export default function UserMenu({ user, onLogout }) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-3">
            <Link to={getRoleHomePath(user)} className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-medium text-white">
                    {initials(user.name)}
                </div>
                <span className="hidden text-sm font-medium text-ink sm:inline">{user.name}</span>
            </Link>
            <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-app"
            >
                {t('userMenu.logout')}
            </button>
        </div>
    );
}
