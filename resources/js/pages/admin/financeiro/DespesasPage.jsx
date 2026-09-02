import { useEffect, useState } from 'react';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { fetchAdminExpenses, deleteExpense } from '../../../lib/api';
import { formatCurrency } from '../../../lib/currency';
import StatTile from '../../../components/StatTile';
import IconButton from '../../../components/IconButton';
import ExpenseFormModal from '../../../components/ExpenseFormModal';

export default function DespesasPage() {
    const { t } = useTranslation();
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalExpense, setModalExpense] = useState(undefined);

    function load() {
        return fetchAdminExpenses()
            .then(({ data }) => {
                setExpenses(data.expenses.data);
                setSummary(data.summary);
            })
            .catch(() => setError(t('adminFinanceiro.loadError')));
    }

    useEffect(() => {
        load().finally(() => setLoading(false));
    }, [t]);

    function handleSaved() {
        load();
    }

    async function handleDelete(expense) {
        if (!window.confirm(t('adminFinanceiro.confirmDelete', { description: expense.description }))) return;

        try {
            await deleteExpense(expense.id);
            load();
        } catch {
            setError(t('adminFinanceiro.deleteError'));
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-ink">{t('adminFinanceiro.despesasTitle')}</h1>
                <button
                    type="button"
                    onClick={() => setModalExpense(null)}
                    className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                >
                    {t('adminFinanceiro.newExpense')}
                </button>
            </div>

            {loading && <p className="mt-2 text-sm text-muted">{t('common.loading')}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {summary && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatTile
                        label={t('adminFinanceiro.totalExpenses')}
                        value={formatCurrency(summary.total, 'pt-BR')}
                    />
                    <StatTile
                        label={t('adminFinanceiro.expensesThisMonth')}
                        value={formatCurrency(summary.this_month, 'pt-BR')}
                    />
                </div>
            )}

            {!loading && expenses.length === 0 && !error && (
                <p className="mt-4 text-sm text-muted">{t('adminFinanceiro.expensesEmpty')}</p>
            )}

            {expenses.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-line text-muted">
                                <th className="py-2 pr-4 font-medium">{t('adminFinanceiro.colDate')}</th>
                                <th className="py-2 pr-4 font-medium">{t('expenseFormModal.description')}</th>
                                <th className="py-2 pr-4 font-medium">{t('expenseFormModal.category')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminFinanceiro.colAmount')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminFinanceiro.colCreatedBy')}</th>
                                <th className="py-2 pr-4 font-medium" />
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="border-b border-line last:border-0">
                                    <td className="py-3 pr-4 text-ink">
                                        {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(
                                            new Date(`${expense.expense_date}T00:00:00`)
                                        )}
                                    </td>
                                    <td className="py-3 pr-4 text-ink">{expense.description}</td>
                                    <td className="py-3 pr-4 text-muted">{expense.category ?? '—'}</td>
                                    <td className="py-3 pr-4 font-medium text-ink">
                                        {formatCurrency(expense.amount, 'pt-BR')}
                                    </td>
                                    <td className="py-3 pr-4 text-muted">{expense.creator?.name ?? '—'}</td>
                                    <td className="py-3 pr-4 text-right whitespace-nowrap">
                                        <IconButton
                                            icon={faPen}
                                            label={t('common.edit')}
                                            onClick={() => setModalExpense(expense)}
                                        />
                                        <IconButton
                                            icon={faTrash}
                                            label={t('common.delete')}
                                            tone="danger"
                                            onClick={() => handleDelete(expense)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalExpense !== undefined && (
                <ExpenseFormModal
                    expense={modalExpense}
                    onClose={() => setModalExpense(undefined)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
