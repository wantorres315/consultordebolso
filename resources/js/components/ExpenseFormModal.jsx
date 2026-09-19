import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createExpense, createRecurringExpense, updateExpense } from '../lib/api';
import CategorySelect from './CategorySelect';

function todayLocalDateString() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${today.getFullYear()}-${month}-${day}`;
}

function buildEmptyForm(defaultDate) {
    return {
        description: '',
        category_id: '',
        amount: '',
        expense_date: defaultDate ?? todayLocalDateString(),
        notes: '',
        recurring: false,
        months: 12,
    };
}

export default function ExpenseFormModal({ expense, defaultDate, onClose, onSaved }) {
    const { t } = useTranslation();
    const [form, setForm] = useState(() => {
        const emptyForm = buildEmptyForm(defaultDate);
        return expense ? { ...emptyForm, ...expense } : emptyForm;
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;
        setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const categoryId = form.category_id || null;

            if (expense) {
                const { data } = await updateExpense(expense.id, { ...form, category_id: categoryId });
                onSaved(data);
            } else if (form.recurring) {
                const { data } = await createRecurringExpense({
                    description: form.description,
                    category_id: categoryId,
                    amount: form.amount,
                    start_date: form.expense_date,
                    months: form.months,
                    notes: form.notes,
                });
                onSaved(data.expenses[0]);
            } else {
                const { data } = await createExpense({ ...form, category_id: categoryId });
                onSaved(data);
            }
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                const responseErrors = error.response.data.errors ?? {};
                if (responseErrors.start_date) responseErrors.expense_date = responseErrors.start_date;
                setErrors(responseErrors);
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

                    <CategorySelect
                        type="expense"
                        label={t('expenseFormModal.category')}
                        value={form.category_id}
                        onChange={(categoryId) => setForm((previous) => ({ ...previous, category_id: categoryId }))}
                        error={errors.category_id}
                    />

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
                                {form.recurring ? t('expenseFormModal.startDate') : t('expenseFormModal.date')}
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

                    {!expense && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-ink">
                                <input
                                    type="checkbox"
                                    name="recurring"
                                    checked={form.recurring}
                                    onChange={handleChange}
                                    className="rounded border-line text-brand focus:ring-brand"
                                />
                                {t('expenseFormModal.recurring')}
                            </label>

                            {form.recurring && (
                                <div className="mt-2">
                                    <label className="mb-1 block text-sm font-medium text-ink">
                                        {t('expenseFormModal.months')}
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="2"
                                        max="120"
                                        name="months"
                                        value={form.months}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                                    />
                                    {errors.months && <p className="mt-1 text-sm text-red-600">{errors.months[0]}</p>}
                                    <p className="mt-1 text-xs text-muted">{t('expenseFormModal.recurringHelp')}</p>
                                </div>
                            )}
                        </div>
                    )}

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
