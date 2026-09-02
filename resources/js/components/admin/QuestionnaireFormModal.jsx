import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createAdminQuestionnaire, updateAdminQuestionnaire } from '../../lib/api';

const emptyForm = {
    title: '',
    description: '',
    price: '',
    is_active: true,
};

export default function QuestionnaireFormModal({ questionnaire, onClose, onSaved }) {
    const { t } = useTranslation();
    const [form, setForm] = useState(questionnaire ? { ...emptyForm, ...questionnaire } : emptyForm);
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
            const { data } = questionnaire
                ? await updateAdminQuestionnaire(questionnaire.id, form)
                : await createAdminQuestionnaire(form);
            onSaved(data);
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            } else {
                setErrors({ title: [t('common.genericError')] });
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
                        {questionnaire
                            ? t('questionnaireFormModal.editTitle')
                            : t('questionnaireFormModal.newTitle')}
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
                            {t('questionnaireFormModal.title')}
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink">
                            {t('questionnaireFormModal.description')}
                        </label>
                        <textarea
                            name="description"
                            value={form.description ?? ''}
                            onChange={handleChange}
                            rows={3}
                            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink">
                            {t('questionnaireFormModal.price')}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            value={form.price ?? ''}
                            onChange={handleChange}
                            placeholder={t('questionnaireFormModal.pricePlaceholder')}
                            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-muted">{t('questionnaireFormModal.priceHint')}</p>
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price[0]}</p>}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-ink">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-line"
                        />
                        {t('questionnaireFormModal.active')}
                    </label>

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
