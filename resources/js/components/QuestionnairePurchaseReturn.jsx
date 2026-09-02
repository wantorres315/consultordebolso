import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchQuestionnaireResponse } from '../lib/api';

export default function QuestionnairePurchaseReturn({ backTo }) {
    const { t } = useTranslation();
    const { responseId } = useParams();
    const [status, setStatus] = useState('checking');

    useEffect(() => {
        fetchQuestionnaireResponse(responseId)
            .then(({ data }) => setStatus(data.response.purchase_status === 'paid' ? 'paid' : 'pending'))
            .catch(() => setStatus('error'));
    }, [responseId]);

    return (
        <div className="text-center">
            {status === 'checking' && <p className="text-sm text-muted">{t('questionnairePurchaseReturn.checking')}</p>}

            {status === 'paid' && (
                <>
                    <p className="text-sm text-ink">{t('questionnairePurchaseReturn.paid')}</p>
                    <Link
                        to={backTo}
                        className="mt-4 inline-block rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                    >
                        {t('questionnairePurchaseReturn.continue')}
                    </Link>
                </>
            )}

            {status === 'pending' && (
                <>
                    <p className="text-sm text-muted">{t('questionnairePurchaseReturn.pending')}</p>
                    <Link
                        to={backTo}
                        className="mt-4 inline-block text-sm font-medium text-ink underline underline-offset-4 hover:opacity-70"
                    >
                        {t('questionnairePurchaseReturn.backToList')}
                    </Link>
                </>
            )}

            {status === 'error' && <p className="text-sm text-red-600">{t('common.genericError')}</p>}
        </div>
    );
}
