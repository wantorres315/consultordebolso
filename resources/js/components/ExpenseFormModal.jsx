import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createExpense, updateExpense } from '../lib/api';

const emptyForm = {
    description: '',
    category: '',
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    notes: '',
};

export default function ExpenseFormModal({ expense, onClose, onSaved }) {
    const { t } = useTranslation();
    const [form, setForm] = useState(expense ? { ...emptyForm, ...expense } : emptyForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const { data } = expense ? await updateExpense(expense.id, form) : await createExpense(form);
            onSaved(data);
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            } else {
                setErrors({ description: [t('common.genericError')] });
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4" onClick={onClose}>
            <div
                className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-ink">
                        {expense ? t('expenseFormModal.editTitle') : t('expenseFormModal.newTitle')}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted hover:text-ink"
                        aria-label={t('common.close')}
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink">
                            {t('expenseFormModal.description')}
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink">
                            {t('expenseFormModal.category')}
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={form.category ?? ''}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category[0]}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink">
                                {t('expenseFormModal.amount')}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount[0]}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink">
                                {t('expenseFormModal.date')}
                            </label>
                            <input
                                type="date"
                                name="expense_date"
                                value={form.expense_date}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            {errors.expense_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.expense_date[0]}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink">
                            {t('expenseFormModal.notes')}
                        </label>
                        <textarea
                            name="notes"
                            value={form.notes ?? ''}
                            onChange={handleChange}
                            rows={3}
                            className="w-full resize-none rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes[0]}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-2 rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? t('common.saving') : t('common.save')}
                    </button>
                </form>
            </div>
        </div>
    );
}
