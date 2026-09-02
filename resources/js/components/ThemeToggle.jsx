import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? t('themeToggle.enableLight') : t('themeToggle.enableDark')}
            title={isDark ? t('themeToggle.lightMode') : t('themeToggle.darkMode')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-app"
        >
            <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="h-4 w-4" />
        </button>
    );
}
