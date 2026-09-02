import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchAdminQuestionnaire, createAdminSection } from '../../lib/api';
import QuestionnaireFormModal from '../../components/admin/QuestionnaireFormModal';
import SectionEditor from '../../components/admin/SectionEditor';

export default function QuestionarioBuilderPage() {
    const { t } = useTranslation();
    const { questionnaireId } = useParams();

    const [questionnaire, setQuestionnaire] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addingSection, setAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');

    const reload = useCallback(() => {
        return fetchAdminQuestionnaire(questionnaireId)
            .then(({ data }) => setQuestionnaire(data))
            .catch(() => setError(t('adminQuestionarioBuilder.loadError')));
    }, [questionnaireId, t]);

    useEffect(() => {
        setLoading(true);
        reload().finally(() => setLoading(false));
    }, [reload]);

    async function handleAddSection(event) {
        event.preventDefault();
        if (!newSectionTitle.trim()) return;

        await createAdminSection(questionnaireId, { title: newSectionTitle.trim() });
        setNewSectionTitle('');
        setAddingSection(false);
        reload();
    }

    return (
        <div>
            <Link
                to="/admin/questionarios"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
                {t('adminQuestionarioBuilder.back')}
            </Link>

            {loading && <p className="mt-4 text-sm text-muted">{t('adminQuestionarioBuilder.loading')}</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {questionnaire && (
                <>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold text-ink">{questionnaire.title}</h1>
                            {questionnaire.description && (
                                <p className="mt-1 text-sm text-muted">{questionnaire.description}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditModalOpen(true)}
                            className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-app"
                        >
                            {t('common.edit')}
                        </button>
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                        {questionnaire.sections.map((section, index) => (
                            <SectionEditor
                                key={section.id}
                                section={section}
                                isFirst={index === 0}
                                isLast={index === questionnaire.sections.length - 1}
                                onChanged={reload}
                            />
                        ))}
                    </div>

                    {addingSection ? (
                        <form onSubmit={handleAddSection} className="mt-4 flex gap-2">
                            <input
                                type="text"
                                value={newSectionTitle}
                                onChange={(event) => setNewSectionTitle(event.target.value)}
                                placeholder={t('adminQuestionarioBuilder.sectionTitlePlaceholder')}
                                autoFocus
                                className="flex-1 rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                            >
                                {t('common.save')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddingSection(false)}
                                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-app"
                            >
                                {t('common.close')}
                            </button>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setAddingSection(true)}
                            className="mt-4 rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-app"
                        >
                            {t('adminQuestionarioBuilder.addSection')}
                        </button>
                    )}

                    {editModalOpen && (
                        <QuestionnaireFormModal
                            questionnaire={questionnaire}
                            onClose={() => setEditModalOpen(false)}
                            onSaved={reload}
                        />
                    )}
                </>
            )}
        </div>
    );
}
