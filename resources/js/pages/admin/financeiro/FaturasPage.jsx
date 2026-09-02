import { useTranslation } from 'react-i18next';

export default function FaturasPage() {
    const { t } = useTranslation();

    return (
        <div>
            <h1 className="text-xl font-semibold text-ink">{t('adminFinanceiro.faturasTitle')}</h1>
            <p className="mt-2 text-sm text-muted">{t('common.underConstruction')}</p>
        </div>
    );
}
