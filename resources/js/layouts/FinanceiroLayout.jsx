import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const tabClass = ({ isActive }) =>
    `border-b-2 pb-3 text-sm font-medium transition-colors ${
        isActive ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-ink'
    }`;

export default function FinanceiroLayout() {
    const { t } = useTranslation();

    return (
        <div>
            <div className="mb-6 flex items-center gap-6 border-b border-line">
                <NavLink to="despesas" className={tabClass}>
                    {t('financeiroLayout.expenses')}
                </NavLink>
                <NavLink to="faturas" className={tabClass}>
                    {t('financeiroLayout.invoices')}
                </NavLink>
                <NavLink to="pagamentos" className={tabClass}>
                    {t('financeiroLayout.payments')}
                </NavLink>
            </div>

            <Outlet />
        </div>
    );
}
