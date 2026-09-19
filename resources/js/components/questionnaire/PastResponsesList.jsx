import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchQuestionnaireResponses } from '../../lib/api';
import { useLocale } from '../../context/LocaleContext';

export default function PastResponsesList({ questionnaireId, questionnaireTitle, onOpenResponse, onBack }) {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchQuestionnaireResponses(questionnaireId)
            .then(({ data }) => setResponses(data.filter((response) => response.status === 'finalized')))
            .catch(() => setError(t('questionnaireResponder.loadError')))
            .finally(() => setLoading(false));
    }, [questionnaireId, t]);

    return (
        <div>
            <button type="button" onClick={onBack} className="text-sm font-medium text-muted hover:text-ink">
                {t('questionnaireForm.back')}
            </button>

            <h2 className="mt-3 text-lg font-semibold text-ink">{questionnaireTitle}</h2>

            {loading && <p className="mt-2 text-sm text-muted">{t('common.loading')}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {!loading && responses.length === 0 && !error && (
                <p className="mt-2 text-sm text-muted">{t('questionnaireResponder.noHistory')}</p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {responses.map((response) => (
                    <button
                        key={response.id}
                        type="button"
                        onClick={() => onOpenResponse(response.id, true)}
                        className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5 text-left shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="text-sm font-medium text-ink">
                            {t('questionnaireResponder.sentOn', {
                                date: new Intl.DateTimeFormat(locale, {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                }).format(new Date(response.finalized_at)),
                            })}
                        </div>
                        <div className="text-xs text-muted">
                            {response.answered_count}/{response.total_questions}
                        </div>
                        <p className="line-clamp-4 text-sm text-muted">
                            {response.ai_response || t('questionnaireResponder.noAiResponse')}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
