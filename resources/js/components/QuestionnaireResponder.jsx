import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import QuestionnaireList from './questionnaire/QuestionnaireList';
import PastResponsesList from './questionnaire/PastResponsesList';
import QuestionnaireForm from './questionnaire/QuestionnaireForm';

export default function QuestionnaireResponder() {
    const { t } = useTranslation();
    const [view, setView] = useState('list');
    const [activeResponseId, setActiveResponseId] = useState(null);
    const [activeReadOnly, setActiveReadOnly] = useState(false);
    const [historyQuestionnaire, setHistoryQuestionnaire] = useState(null);

    function openResponse(responseId, readOnly) {
        setActiveResponseId(responseId);
        setActiveReadOnly(readOnly);
        setView('form');
    }

    function viewHistory(questionnaireId, title) {
        setHistoryQuestionnaire({ id: questionnaireId, title });
        setView('history');
    }

    return (
        <div>
            <h1 className="text-xl font-semibold text-ink">{t('questionnaireResponder.title')}</h1>

            <div className="mt-4">
                {view === 'list' && <QuestionnaireList onOpenResponse={openResponse} onViewHistory={viewHistory} />}

                {view === 'history' && historyQuestionnaire && (
                    <PastResponsesList
                        questionnaireId={historyQuestionnaire.id}
                        questionnaireTitle={historyQuestionnaire.title}
                        onOpenResponse={openResponse}
                        onBack={() => setView('list')}
                    />
                )}

                {view === 'form' && activeResponseId && (
                    <QuestionnaireForm
                        responseId={activeResponseId}
                        forceReadOnly={activeReadOnly}
                        onExit={() => setView('list')}
                        onFinalized={() => setView('list')}
                    />
                )}
            </div>
        </div>
    );
}
