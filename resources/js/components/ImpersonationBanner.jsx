import { Trans, useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function ImpersonationBanner() {
    const { t } = useTranslation();
    const { impersonating, user, stopImpersonating } = useAuth();

    if (!impersonating) return null;

    return (
        <div className="mb-4 flex w-full items-center justify-between gap-4 rounded-2xl bg-navy px-5 py-3 text-sm text-white">
            <span>
                <Trans
                    i18nKey="impersonationBanner.message"
                    values={{ name: user?.name }}
                    components={{ strong: <strong /> }}
                />
            </span>
            <button
                type="button"
                onClick={stopImpersonating}
                className="shrink-0 rounded-full bg-brand px-4 py-1.5 font-medium text-brand-ink transition-opacity hover:opacity-90"
            >
                {t('impersonationBanner.back')}
            </button>
        </div>
    );
}
