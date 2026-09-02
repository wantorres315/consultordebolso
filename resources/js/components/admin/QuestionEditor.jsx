import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { faArrowDown, faArrowUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
    createAdminQuestion,
    updateAdminQuestion,
    deleteAdminQuestion,
    moveAdminQuestionUp,
    moveAdminQuestionDown,
} from '../../lib/api';
import IconButton from '../IconButton';

const TYPES = ['text', 'textarea', 'number', 'currency', 'single_choice', 'multi_choice'];

const emptyForm = {
    prompt: '',
    help_text: '',
    type: 'text',
    options: [],
    allow_other: false,
    is_required: true,
};

export default function QuestionEditor({ question, sectionId, isFirst, isLast, onChanged, isNew, onCancelNew }) {
    const { t } = useTranslation();
    const [form, setForm] = useState(question ? { ...emptyForm, ...question, options: question.options ?? [] } : emptyForm);
    const [optionDraft, setOptionDraft] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;
        setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
    }

    function addOption() {
        const trimmed = optionDraft.trim();
        if (!trimmed) return;

        setForm((previous) => ({ ...previous, options: [...previous.options, trimmed] }));
        setOptionDraft('');
    }

    function removeOption(index) {
        setForm((previous) => ({ ...previous, options: previous.options.filter((_, i) => i !== index) }));
    }

    async function handleSave() {
        setSubmitting(true);
        setErrors({});

        const payload = { ...form, options: form.options.length > 0 ? form.options : null };

        try {
            if (isNew) {
                await createAdminQuestion(sectionId, payload);
                onCancelNew();
            } else {
                await updateAdminQuestion(question.id, payload);
            }
            onChanged();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            } else {
                setErrors({ prompt: [t('common.genericError')] });
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        const warning =
            question.answers_count > 0
                ? t('adminQuestionarioBuilder.confirmDeleteQuestionWithAnswers', { count: question.answers_count })
                : t('adminQuestionarioBuilder.confirmDeleteQuestion');

        if (!window.confirm(warning)) return;

        await deleteAdminQuestion(question.id);
        onChanged();
    }

    async function handleMoveUp() {
        await moveAdminQuestionUp(question.id);
        onChanged();
    }

    async function handleMoveDown() {
        await moveAdminQuestionDown(question.id);
        onChanged();
    }

    const isChoiceType = form.type === 'single_choice' || form.type === 'multi_choice';

    return (
        <div className="rounded-2xl border border-line p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 flex flex-col gap-2">
                    <input
                        type="text"
                        name="prompt"
                        value={form.prompt}
                        onChange={handleChange}
                        placeholder={t('adminQuestionarioBuilder.promptPlaceholder')}
                        className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                    />
                    {errors.prompt && <p className="text-sm text-red-600">{errors.prompt[0]}</p>}

                    <input
                        type="text"
                        name="help_text"
                        value={form.help_text ?? ''}
                        onChange={handleChange}
                        placeholder={t('adminQuestionarioBuilder.helpTextPlaceholder')}
                        className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                    />

                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        >
                            {TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {t(`questionField.type.${type}`)}
                                </option>
                            ))}
                        </select>

                        <label className="flex items-center gap-2 text-sm text-ink">
                            <input
                                type="checkbox"
                                name="is_required"
                                checked={form.is_required}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-line"
                            />
                            {t('adminQuestionarioBuilder.required')}
                        </label>

                        {isChoiceType && (
                            <label className="flex items-center gap-2 text-sm text-ink">
                                <input
                                    type="checkbox"
                                    name="allow_other"
                                    checked={form.allow_other}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-line"
                                />
                                {t('adminQuestionarioBuilder.allowOther')}
                            </label>
                        )}
                    </div>

                    {isChoiceType && (
                        <div className="rounded-xl bg-app p-3">
                            <p className="mb-2 text-xs font-medium text-muted">
                                {t('adminQuestionarioBuilder.options')}
                            </p>
                            <ul className="flex flex-col gap-1">
                                {form.options.map((option, index) => (
                                    <li key={`${option}-${index}`} className="flex items-center justify-between gap-2 text-sm text-ink">
                                        <span>{option}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            {t('common.delete')}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 flex gap-2">
                                <input
                                    type="text"
                                    value={optionDraft}
                                    onChange={(event) => setOptionDraft(event.target.value)}
                                    placeholder={t('adminQuestionarioBuilder.addOptionPlaceholder')}
                                    className="flex-1 rounded-xl border border-line px-3 py-1.5 text-sm text-ink focus:border-brand focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface"
                                >
                                    {t('adminQuestionarioBuilder.addOption')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                    {!isNew && (
                        <div className="flex gap-1">
                            <IconButton
                                icon={faArrowUp}
                                label={t('adminQuestionarioBuilder.moveUp')}
                                onClick={handleMoveUp}
                                disabled={isFirst}
                            />
                            <IconButton
                                icon={faArrowDown}
                                label={t('adminQuestionarioBuilder.moveDown')}
                                onClick={handleMoveDown}
                                disabled={isLast}
                            />
                            <IconButton icon={faTrash} label={t('common.delete')} tone="danger" onClick={handleDelete} />
                        </div>
                    )}
                    <div className="flex gap-2">
                        {isNew && (
                            <button
                                type="button"
                                onClick={onCancelNew}
                                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-app"
                            >
                                {t('common.close')}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={submitting}
                            className="rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? t('common.saving') : t('common.save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
