import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../lib/currency';

function displayValue(question, value, t) {
    if (!value) return '—';

    if (question.type === 'text' || question.type === 'textarea') {
        return value.text || '—';
    }

    if (question.type === 'number') {
        return value.number ?? '—';
    }

    if (question.type === 'currency') {
        return value.number != null ? formatCurrency(value.number, 'pt-BR') : '—';
    }

    const options = value.options ?? [];
    const parts = [...options];
    if (value.other) parts.push(`${t('questionField.other')}: ${value.other}`);

    return parts.length > 0 ? parts.join(', ') : '—';
}

export default function QuestionField({ question }) {
    const { t } = useTranslation();

    return (
        <div className="rounded-2xl p-4">
            <label className="block text-sm font-medium text-ink">{question.prompt}</label>
            {question.help_text && <p className="mt-0.5 text-xs text-muted">{question.help_text}</p>}
            <p className="mt-2 text-sm text-ink">{displayValue(question, question.answer?.value, t)}</p>
        </div>
    );
}
