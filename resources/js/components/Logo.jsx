import { Link } from 'react-router-dom';

export default function Logo() {
    return (
        <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-ink">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="6" width="18" height="13" rx="3" />
                    <path d="M3 10h18" />
                    <circle cx="16.5" cy="14.5" r="1.25" fill="currentColor" stroke="none" />
                </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight text-ink">Consultor de Bolso</span>
        </Link>
    );
}
