import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPlan, updatePlan } from '../lib/api';

const emptyForm = {
    name: '',
    monthly_price: '',
    annual_price: '',
    monthly_price_usd: '',
    annual_price_usd: '',
    monthly_price_eur: '',
    annual_price_eur: '',
    max_members: 1,
    max_wallet_plans: 1,
    is_active: true,
    is_featured: false,
};

export default function PlanFormModal({ plan, onClose, onSaved }) {
    const { t } = useTranslation();
    const [form, setForm] = useState(plan ? { ...emptyForm, ...plan } : emptyForm);
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
            const { data } = plan ? await updatePlan(plan.id, form) : await createPlan(form);
            onSaved(data);
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            } else {
                setErrors({ name: [t('common.genericError')] });
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-ink">
                        {plan ? t('planFormModal.editTitle') : t('planFormModal.newTitle')}
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
                        <label className="mb-1 block text-sm font-medium text-ink">{t('planFormModal.name')}</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink">
                                {t('planFormModal.monthlyPrice')}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="monthly_price"
                                value={form.monthly_price}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            {errors.monthly_price && (
                                <p className="mt-1 text-sm text-red-600">{errors.monthly_price[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink">
                                {t('planFormModal.annualPrice')}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="annual_price"
                                value={form.annual_price}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            {errors.annual_price && (
                                <p className="mt-1 text-sm text-red-600">{errors.annual_price[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink">
                                {t('planFormModal.monthlyPriceUsd')}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="monthly_price_usd"
                                value={form.monthly_price_usd ?? ''}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            {errors.monthly_price_usd && (
                                <p className="mt-1 text-sm text-red-600">{errors.monthly_price_usd[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink">
                                {t('planFormModal.annualPriceUsd')}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="annual_price_usd"
                                value={form.annual_price_usd ?? ''}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            {errors.annual_price_usd && (
                                <p className="mt-1 text-sm text-red-600">{errors.annual_price_usd[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink">
                                {t('planFormModal.monthlyPriceEur')}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="monthly_price_eur"
                                value={form.monthly_price_eur ?? ''}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            {errors.monthly_price_eur && (
                                <p className="mt-1 text-sm text-red-600">{errors.monthly_price_eur[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink">
                                {t('planFormModal.annualPriceEur')}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="annual_price_eur"
                                value={form.annual_price_eur ?? ''}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            {errors.annual_price_eur && (
                                <p className="mt-1 text-sm text-red-600">{errors.annual_price_eur[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink">
                                {t('planFormModal.maxMembers')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                name="max_members"
                                value={form.max_members}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            {errors.max_members && (
                                <p className="mt-1 text-sm text-red-600">{errors.max_members[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink">
                                {t('planFormModal.maxWalletPlans')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                name="max_wallet_plans"
                                value={form.max_wallet_plans}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            {errors.max_wallet_plans && (
                                <p className="mt-1 text-sm text-red-600">{errors.max_wallet_plans[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-ink">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-line"
                            />
                            {t('planFormModal.active')}
                        </label>

                        <label className="flex items-center gap-2 text-sm text-ink">
                            <input
                                type="checkbox"
                                name="is_featured"
                                checked={form.is_featured}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-line"
                            />
                            {t('planFormModal.featured')}
                        </label>
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
