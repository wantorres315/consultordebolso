import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function IconButton({ icon, label, onClick, tone = 'default', disabled = false }) {
    const toneClass = tone === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-ink hover:bg-app';

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${toneClass}`}
        >
            <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
        </button>
    );
}
