import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    fetchQuestionnaires,
    startOrResumeQuestionnaireResponse,
    createQuestionnaireResponsePurchase,
} from '../../lib/api';
import { enterFullscreen } from '../../lib/fullscreen';
import { formatCurrency } from '../../lib/currency';
import QuestionnairePurchaseModal from './QuestionnairePurchaseModal';

export default function QuestionnaireList({ onOpenResponse, onViewHistory }) {
    const { t } = useTranslation();
    const [questionnaires, setQuestionnaires] = useState([]);
    const [credits, setCredits] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startingId, setStartingId] = useState(null);
    const [buyingId, setBuyingId] = useState(null);
    const [showBuyModal, setShowBuyModal] = useState(false);

    useEffect(() => {
        fetchQuestionnaires()
            .then(({ data }) => {
                setQuestionnaires(data.questionnaires);
                setCredits(data.wallet_plan_credits);
            })
            .catch(() => setError(t('questionnaireResponder.loadError')))
            .finally(() => setLoading(false));
    }, [t]);

    const outOfCredits = credits?.limit !== null && credits?.limit !== undefined && credits?.remaining <= 0;

    async function handleStart(questionnaire) {
        enterFullscreen();

        if (questionnaire.draft_response_id) {
            onOpenResponse(questionnaire.draft_response_id, false);
            return;
        }

        setStartingId(questionnaire.id);
        try {
            const { data } = await startOrResumeQuestionnaireResponse(questionnaire.id);
            onOpenResponse(data.id, false);
        } catch {
            setError(t('common.genericError'));
        } finally {
            setStartingId(null);
        }
    }

    async function handleBuyStandalone(questionnaire) {
        setBuyingId(questionnaire.id);
        setError(null);

        try {
            const { data: response } = await startOrResumeQuestionnaireResponse(questionnaire.id);
            const { data: purchase } = await createQuestionnaireResponsePurchase(response.id);
            window.location.href = purchase.init_point;
        } catch (purchaseError) {
            setShowBuyModal(false);
            setError(purchaseError.response?.data?.message ?? t('common.genericError'));
            setBuyingId(null);
        }
    }

    if (loading) return <p className="text-sm text-muted">{t('common.loading')}</p>;
    if (error) return <p className="text-sm text-red-600">{error}</p>;
    if (questionnaires.length === 0) {
        return <p className="text-sm text-muted">{t('questionnaireResponder.empty')}</p>;
    }

    const purchasableQuestionnaires = questionnaires.filter((q) => q.is_active && q.price);

    return (
        <div>
            {purchasableQuestionnaires.length > 0 && (
                <div className="mb-4 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setShowBuyModal(true)}
                        className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                    >
                        {t('questionnaireResponder.buyMoreHeader')}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {questionnaires.map((questionnaire) => {
                    const blocked = outOfCredits && questionnaire.is_active;

                    return (
                        <div
                            key={questionnaire.id}
                            className="flex flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div>
                                <h3 className="text-base font-semibold text-ink">{questionnaire.title}</h3>
                                {questionnaire.description && (
                                    <p className="mt-1 text-sm text-muted">{questionnaire.description}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    {(questionnaire.draft_response_id || questionnaire.is_active) && !blocked && (
                                        <button
                                            type="button"
                                            onClick={() => handleStart(questionnaire)}
                                            disabled={startingId === questionnaire.id}
                                            className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {questionnaire.draft_response_id
                                                ? t('questionnaireResponder.continue')
                                                : t('questionnaireResponder.respond')}
                                        </button>
                                    )}

                                    {questionnaire.finalized_count > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => onViewHistory(questionnaire.id, questionnaire.title)}
                                            className="text-sm font-medium text-ink underline-offset-4 hover:underline"
                                        >
                                            {t('questionnaireResponder.viewHistory', {
                                                count: questionnaire.finalized_count,
                                            })}
                                        </button>
                                    )}
                                </div>

                                {blocked && (
                                    <div className="rounded-xl bg-app p-3">
                                        {questionnaire.price ? (
                                            <>
                                                <p className="text-sm text-ink">
                                                    {t('questionnaireResponder.purchaseOffer', {
                                                        price: formatCurrency(questionnaire.price, 'pt-BR'),
                                                    })}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleBuyStandalone(questionnaire)}
                                                    disabled={buyingId === questionnaire.id}
                                                    className="mt-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-app disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {buyingId === questionnaire.id
                                                        ? t('questionnaireForm.purchasing')
                                                        : t('questionnaireResponder.buyStandalone', {
                                                              price: formatCurrency(questionnaire.price, 'pt-BR'),
                                                          })}
                                                </button>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted">
                                                {t('questionnaireResponder.noCreditsLeft')}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {showBuyModal && (
                <QuestionnairePurchaseModal
                    questionnaires={purchasableQuestionnaires}
                    buyingId={buyingId}
                    onBuy={handleBuyStandalone}
                    onClose={() => setShowBuyModal(false)}
                />
            )}
        </div>
    );
}
