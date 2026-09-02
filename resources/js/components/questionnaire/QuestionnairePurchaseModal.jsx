import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../lib/currency';

export default function QuestionnairePurchaseModal({ questionnaires, buyingId, onBuy, onClose }) {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-ink">{t('questionnaireResponder.buyModalTitle')}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted hover:text-ink"
                        aria-label={t('common.close')}
                    >
                        &times;
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {questionnaires.map((questionnaire) => (
                        <div
                            key={questionnaire.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-line p-4"
                        >
                            <div>
                                <p className="text-sm font-medium text-ink">{questionnaire.title}</p>
                                <p className="text-sm text-muted">{formatCurrency(questionnaire.price, 'pt-BR')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onBuy(questionnaire)}
                                disabled={buyingId === questionnaire.id}
                                className="shrink-0 rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {buyingId === questionnaire.id
                                    ? t('questionnaireForm.purchasing')
                                    : t('questionnaireResponder.buyAction')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
