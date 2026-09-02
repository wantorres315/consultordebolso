import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchQuestionnaireResponse } from '../../lib/api';
import QuestionnaireReadOnlyView from './QuestionnaireReadOnlyView';
import QuestionnaireFullscreenFlow from './QuestionnaireFullscreenFlow';

export default function QuestionnaireForm({ responseId, forceReadOnly, onExit, onFinalized }) {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchQuestionnaireResponse(responseId)
            .then(({ data }) => setData(data))
            .catch(() => setError(t('questionnaireForm.loadError')))
            .finally(() => setLoading(false));
    }, [responseId, t]);

    if (loading) return <p className="text-sm text-muted">{t('common.loading')}</p>;
    if (error) return <p className="text-sm text-red-600">{error}</p>;
    if (!data) return null;

    const readOnly = forceReadOnly || data.response.status === 'finalized';

    if (readOnly) {
        return (
            <div>
                <button type="button" onClick={onExit} className="text-sm font-medium text-muted hover:text-ink">
                    {t('questionnaireForm.back')}
                </button>
                <div className="mt-3">
                    <QuestionnaireReadOnlyView data={data} />
                </div>
            </div>
        );
    }

    return (
        <QuestionnaireFullscreenFlow
            data={data}
            responseId={responseId}
            onExit={onExit}
            onFinalized={onFinalized}
        />
    );
}
