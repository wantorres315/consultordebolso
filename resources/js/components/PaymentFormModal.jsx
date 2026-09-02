import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createManualPayment, fetchAdminAccounts } from '../lib/api';

const emptyForm = {
    account_id: '',
    description: '',
    amount: '',
    paid_at: new Date().toISOString().slice(0, 10),
    notes: '',
};

export default function PaymentFormModal({ onClose, onSaved }) {
    const { t } = useTranslation();
    const [form, setForm] = useState(emptyForm);
    const [accounts, setAccounts] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAdminAccounts()
            .then(({ data }) => setAccounts(data.data))
            .catch(() => {});
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const { data } = await createManualPayment({
                ...form,
                account_id: form.account_id || null,
            });
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
                    <h2 className="text-lg font-semibold text-ink">{t('paymentFormModal.title')}</h2>
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
                            {t('paymentFormModal.account')}
                        </label>
                        <select
                            name="account_id"
                            value={form.account_id}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        >
                            <option value="">{t('paymentFormModal.noAccount')}</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>
                        {errors.account_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.account_id[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink">
                            {t('paymentFormModal.description')}
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder={t('paymentFormModal.descriptionPlaceholder')}
                            required
                            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink">
                                {t('paymentFormModal.amount')}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
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
                                {t('paymentFormModal.date')}
                            </label>
                            <input
                                type="date"
                                name="paid_at"
                                value={form.paid_at}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            {errors.paid_at && <p className="mt-1 text-sm text-red-600">{errors.paid_at[0]}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink">
                            {t('paymentFormModal.notes')}
                        </label>
                        <textarea
                            name="notes"
                            value={form.notes}
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
