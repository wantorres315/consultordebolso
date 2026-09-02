import { useTranslation } from 'react-i18next';

export default function PlansSectionEditor() {
    const { t } = useTranslation();

    return <p className="text-sm text-muted">{t('adminSite.plansNotice')}</p>;
}
