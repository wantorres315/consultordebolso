import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { fetchAdminQuestionnaires, deleteAdminQuestionnaire } from '../../lib/api';
import QuestionnaireFormModal from '../../components/admin/QuestionnaireFormModal';
import IconButton from '../../components/IconButton';
import { formatCurrency } from '../../lib/currency';

export default function QuestionariosPage() {
    const { t } = useTranslation();
    const [questionnaires, setQuestionnaires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalQuestionnaire, setModalQuestionnaire] = useState(undefined);

    useEffect(() => {
        fetchAdminQuestionnaires()
            .then(({ data }) => setQuestionnaires(data))
            .catch(() => setError(t('adminQuestionarios.loadError')))
            .finally(() => setLoading(false));
    }, [t]);

    function handleSaved(questionnaire) {
        setQuestionnaires((previous) => {
            const exists = previous.some((item) => item.id === questionnaire.id);

            return exists
                ? previous.map((item) => (item.id === questionnaire.id ? { ...item, ...questionnaire } : item))
                : [questionnaire, ...previous];
        });
    }

    async function handleDelete(questionnaire) {
        if (!window.confirm(t('adminQuestionarios.confirmDelete', { title: questionnaire.title }))) return;

        try {
            await deleteAdminQuestionnaire(questionnaire.id);
            setQuestionnaires((previous) => previous.filter((item) => item.id !== questionnaire.id));
        } catch (error) {
            setError(error.response?.data?.message ?? t('adminQuestionarios.deleteError'));
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-ink">{t('adminQuestionarios.title')}</h1>
                <button
                    type="button"
                    onClick={() => setModalQuestionnaire(null)}
                    className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                >
                    {t('adminQuestionarios.newQuestionnaire')}
                </button>
            </div>

            {loading && <p className="mt-2 text-sm text-muted">{t('adminQuestionarios.loading')}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {!loading && questionnaires.length === 0 && !error && (
                <p className="mt-2 text-sm text-muted">{t('adminQuestionarios.empty')}</p>
            )}

            {questionnaires.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-line text-muted">
                                <th className="py-2 pr-4 font-medium">{t('adminQuestionarios.colTitle')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminQuestionarios.colSections')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminQuestionarios.colResponses')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminQuestionarios.colPrice')}</th>
                                <th className="py-2 pr-4 font-medium">{t('adminQuestionarios.colStatus')}</th>
                                <th className="py-2 pr-4 font-medium" />
                            </tr>
                        </thead>
                        <tbody>
                            {questionnaires.map((questionnaire) => (
                                <tr key={questionnaire.id} className="border-b border-line last:border-0">
                                    <td className="py-3 pr-4">
                                        <Link
                                            to={`/admin/questionarios/${questionnaire.id}`}
                                            className="font-medium text-ink underline-offset-4 hover:underline"
                                        >
                                            {questionnaire.title}
                                        </Link>
                                    </td>
                                    <td className="py-3 pr-4 text-muted">{questionnaire.sections_count}</td>
                                    <td className="py-3 pr-4 text-muted">{questionnaire.responses_count}</td>
                                    <td className="py-3 pr-4 text-muted">
                                        {questionnaire.price ? formatCurrency(questionnaire.price, 'pt-BR') : '—'}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                questionnaire.is_active ? 'bg-success text-white' : 'bg-app text-muted'
                                            }`}
                                        >
                                            {questionnaire.is_active ? t('common.active') : t('common.inactive')}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-right whitespace-nowrap">
                                        <IconButton
                                            icon={faPen}
                                            label={t('common.edit')}
                                            onClick={() => setModalQuestionnaire(questionnaire)}
                                        />
                                        <IconButton
                                            icon={faTrash}
                                            label={t('common.delete')}
                                            tone="danger"
                                            onClick={() => handleDelete(questionnaire)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalQuestionnaire !== undefined && (
                <QuestionnaireFormModal
                    questionnaire={modalQuestionnaire}
                    onClose={() => setModalQuestionnaire(undefined)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
