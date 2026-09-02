import { useTranslation } from 'react-i18next';
import { useLocale } from '../context/LocaleContext';

function formatMonthLabel(period, locale) {
    const [year, month] = period.split('-').map(Number);
    const date = new Date(year, month - 1, 1);

    return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date);
}

export default function WalletPlanCreditsHistory({ history }) {
    const { t } = useTranslation();
    const { locale } = useLocale();

    if (!history || history.length === 0) return null;

    const max = Math.max(1, ...history.map((entry) => entry.used));

    return (
        <div>
            <h2 className="mt-8 text-sm font-medium text-muted">{t('walletPlanCreditsHistory.title')}</h2>
            <div className="mt-2 flex items-end gap-3 overflow-x-auto rounded-2xl border border-line p-4">
                {history.map((entry) => (
                    <div key={entry.period} className="flex flex-col items-center gap-1">
                        <div className="text-xs font-medium text-ink">{entry.used}</div>
                        <div
                            className="w-8 rounded-t bg-brand"
                            style={{ height: `${Math.max(4, (entry.used / max) * 64)}px` }}
                        />
                        <div className="text-xs whitespace-nowrap text-muted">
                            {formatMonthLabel(entry.period, locale)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
