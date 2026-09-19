import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import IconButton from './IconButton';

export default function MonthNavigator({ month, onPrevious, onNext }) {
    const { t, i18n } = useTranslation();
    const label = new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(month);

    return (
        <div className="flex items-center justify-center gap-4">
            <IconButton icon={faChevronLeft} label={t('adminFinanceiro.previousMonth')} onClick={onPrevious} />
            <span className="min-w-[10rem] text-center text-sm font-medium text-ink capitalize">{label}</span>
            <IconButton icon={faChevronRight} label={t('adminFinanceiro.nextMonth')} onClick={onNext} />
        </div>
    );
}
