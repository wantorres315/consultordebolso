import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import QuestionField from './QuestionField';
import { useLocale } from '../../context/LocaleContext';

export default function QuestionnaireReadOnlyView({ data }) {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const [tab, setTab] = useState(data.response.ai_response ? 'ai' : 'answers');

    return (
        <div>
            <h2 className="text-lg font-semibold text-ink">{data.questionnaire.title}</h2>
            <p className="mt-1 text-sm text-muted">{t('questionnaireForm.readOnlyNotice')}</p>
            {data.response.finalized_at && (
                <p className="mt-1 text-sm text-muted">
                    {t('questionnaireResponder.sentOn', {
                        date: new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
                            new Date(data.response.finalized_at)
                        ),
                    })}
                </p>
            )}

            <div className="mt-4 inline-flex items-center rounded-full border border-line p-0.5 text-sm font-medium">
                <button
                    type="button"
                    onClick={() => setTab('ai')}
                    disabled={!data.response.ai_response}
                    className={`rounded-full px-4 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        tab === 'ai' ? 'bg-navy text-white' : 'text-muted hover:text-ink'
                    }`}
                >
                    {t('questionnaireForm.aiResponseTitle')}
                </button>
                <button
                    type="button"
                    onClick={() => setTab('answers')}
                    className={`rounded-full px-4 py-1.5 transition-colors ${
                        tab === 'answers' ? 'bg-navy text-white' : 'text-muted hover:text-ink'
                    }`}
                >
                    {t('questionnaireResponder.answersTab')}
                </button>
            </div>

            {tab === 'ai' && data.response.ai_response && (
                <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
                    <p className="whitespace-pre-line text-sm text-ink">{data.response.ai_response}</p>
                </div>
            )}

            {tab === 'answers' && (
                <div className="mt-4 flex flex-col gap-4">
                    {data.questionnaire.sections.map((section) => (
                        <div key={section.id} className="rounded-2xl border border-line p-4">
                            <h3 className="text-base font-semibold text-ink">{section.title}</h3>
                            {section.objective && <p className="mt-1 text-sm text-muted">{section.objective}</p>}

                            <div className="mt-3 flex flex-col divide-y divide-line">
                                {section.questions.map((question) => (
                                    <QuestionField key={question.id} question={question} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
