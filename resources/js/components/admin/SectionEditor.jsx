import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { faArrowDown, faArrowUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
    updateAdminSection,
    deleteAdminSection,
    moveAdminSectionUp,
    moveAdminSectionDown,
} from '../../lib/api';
import IconButton from '../IconButton';
import QuestionEditor from './QuestionEditor';

export default function SectionEditor({ section, isFirst, isLast, onChanged }) {
    const { t } = useTranslation();
    const [form, setForm] = useState({ title: section.title, objective: section.objective ?? '' });
    const [submitting, setSubmitting] = useState(false);
    const [addingQuestion, setAddingQuestion] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSave() {
        setSubmitting(true);

        try {
            await updateAdminSection(section.id, form);
            onChanged();
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        const totalAnswers = section.questions.reduce((sum, question) => sum + (question.answers_count ?? 0), 0);
        const warning =
            totalAnswers > 0
                ? t('adminQuestionarioBuilder.confirmDeleteSectionWithAnswers', { count: totalAnswers })
                : t('adminQuestionarioBuilder.confirmDeleteSection');

        if (!window.confirm(warning)) return;

        await deleteAdminSection(section.id);
        onChanged();
    }

    async function handleMoveUp() {
        await moveAdminSectionUp(section.id);
        onChanged();
    }

    async function handleMoveDown() {
        await moveAdminSectionDown(section.id);
        onChanged();
    }

    return (
        <div className="rounded-3xl bg-surface p-6 shadow-sm shadow-black/5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 flex flex-col gap-2">
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-line px-3 py-2 text-sm font-semibold text-ink focus:border-brand focus:outline-none"
                    />
                    <textarea
                        name="objective"
                        value={form.objective}
                        onChange={handleChange}
                        rows={2}
                        placeholder={t('adminQuestionarioBuilder.objectivePlaceholder')}
                        className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                    />
                </div>

                <div className="flex shrink-0 items-start gap-1">
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
            </div>

            <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="mt-2 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-app disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting ? t('common.saving') : t('common.save')}
            </button>

            <div className="mt-4 flex flex-col gap-3">
                {section.questions.map((question, index) => (
                    <QuestionEditor
                        key={question.id}
                        question={question}
                        sectionId={section.id}
                        isFirst={index === 0}
                        isLast={index === section.questions.length - 1}
                        onChanged={onChanged}
                    />
                ))}

                {addingQuestion && (
                    <QuestionEditor
                        isNew
                        sectionId={section.id}
                        onChanged={onChanged}
                        onCancelNew={() => setAddingQuestion(false)}
                    />
                )}
            </div>

            {!addingQuestion && (
                <button
                    type="button"
                    onClick={() => setAddingQuestion(true)}
                    className="mt-3 text-sm font-medium text-ink underline-offset-4 hover:underline"
                >
                    {t('adminQuestionarioBuilder.addQuestion')}
                </button>
            )}
        </div>
    );
}
