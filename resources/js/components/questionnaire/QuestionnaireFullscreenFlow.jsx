import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { faArrowLeft, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { saveQuestionnaireAnswer, finalizeQuestionnaireResponse, createQuestionnaireResponsePurchase } from '../../lib/api';
import { enterFullscreen, exitFullscreen } from '../../lib/fullscreen';
import { formatCurrency } from '../../lib/currency';
import QuestionField from './QuestionField';

const emptyValue = { text: null, number: null, options: [], other: null };

function isAnswerEmpty(value) {
    if (!value) return true;

    const text = (value.text ?? '').toString().trim();
    const number = value.number ?? null;
    const options = value.options ?? [];
    const other = (value.other ?? '').toString().trim();

    return text === '' && number === null && options.length === 0 && other === '';
}

function flattenQuestions(sections) {
    return sections.flatMap((section) =>
        section.questions.map((question) => ({
            ...question,
            sectionId: section.id,
            sectionTitle: section.title,
            sectionObjective: section.objective,
        }))
    );
}

export default function QuestionnaireFullscreenFlow({ data, responseId, onExit, onFinalized }) {
    const { t } = useTranslation();

    const questions = useMemo(() => flattenQuestions(data.questionnaire.sections), [data]);

    function isFirstOfSection(idx) {
        return idx === 0 || questions[idx - 1].sectionId !== questions[idx]?.sectionId;
    }

    // index in [0, questions.length - 1] is a real question; index ===
    // questions.length is the "review & send" screen at the end.
    const initialIndex = useMemo(() => {
        const firstUnanswered = questions.findIndex((question) => isAnswerEmpty(question.answer?.value));
        return firstUnanswered === -1 ? questions.length : firstUnanswered;
    }, [questions]);

    const [index, setIndex] = useState(initialIndex);
    const [showingSectionIntro, setShowingSectionIntro] = useState(
        () => initialIndex < questions.length && isFirstOfSection(initialIndex)
    );
    const [value, setValue] = useState(() => ({ ...emptyValue, ...(questions[initialIndex]?.answer?.value ?? {}) }));
    const [otherChecked, setOtherChecked] = useState(Boolean(questions[initialIndex]?.answer?.value?.other));
    const [saving, setSaving] = useState(false);
    const [finalizing, setFinalizing] = useState(false);
    const [error, setError] = useState(null);
    const [credits, setCredits] = useState(data.wallet_plan_credits);
    const [sent, setSent] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);
    const [purchaseStatus, setPurchaseStatus] = useState(data.response.purchase_status ?? null);
    const [purchasing, setPurchasing] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        enterFullscreen();

        return () => exitFullscreen();
    }, []);

    if (questions.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-app px-6 text-center">
                <p className="text-sm text-muted">{t('questionnaireForm.empty')}</p>
                <button
                    type="button"
                    onClick={onExit}
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-app"
                >
                    {t('questionnaireForm.exit')}
                </button>
            </div>
        );
    }

    const isReview = index === questions.length;
    const question = questions[index];
    const isFirst = index === 0;

    function loadQuestion(nextIndex) {
        const nextQuestion = questions[nextIndex];
        setValue({ ...emptyValue, ...(nextQuestion?.answer?.value ?? {}) });
        setOtherChecked(Boolean(nextQuestion?.answer?.value?.other));
        setIndex(nextIndex);
        setShowingSectionIntro(false);
        setError(null);
    }

    function goForwardTo(nextIndex) {
        loadQuestion(nextIndex);

        if (nextIndex < questions.length && isFirstOfSection(nextIndex)) {
            setShowingSectionIntro(true);
        }
    }

    async function persistAnswer(questionId, nextValue) {
        setSaving(true);
        try {
            await saveQuestionnaireAnswer(responseId, questionId, nextValue);
            const target = questions.find((q) => q.id === questionId);
            if (target) target.answer = { value: nextValue };
        } catch {
            setError(t('common.genericError'));
        } finally {
            setSaving(false);
        }
    }

    function handleTextChange(event) {
        const nextValue = { ...value, text: event.target.value };
        setValue(nextValue);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => persistAnswer(question.id, nextValue), 500);
    }

    function handleNumberChange(event) {
        const raw = event.target.value;
        const nextValue = { ...value, number: raw === '' ? null : Number(raw) };
        setValue(nextValue);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => persistAnswer(question.id, nextValue), 500);
    }

    function handleOtherTextChange(event) {
        const nextValue = { ...value, other: event.target.value };
        setValue(nextValue);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => persistAnswer(question.id, nextValue), 500);
    }

    async function handleChoiceSelect(nextValue) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setValue(nextValue);
        await persistAnswer(question.id, nextValue);
        setTimeout(() => goForwardTo(index + 1), 350);
    }

    function handleSingleChoiceSelect(option) {
        setOtherChecked(false);
        handleChoiceSelect({ ...value, options: [option], other: null });
    }

    function handleMultiChoiceSelect(option) {
        setOtherChecked(false);
        handleChoiceSelect({ ...value, options: [option], other: null });
    }

    function handleOtherSelect() {
        // "Outro" reveals a text field to fill in — don't auto-advance, the
        // respondent still needs to type before moving on (see handleNext).
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOtherChecked(true);
        const nextValue = { ...value, options: [] };
        setValue(nextValue);
        persistAnswer(question.id, nextValue);
    }

    async function handleNext() {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        await persistAnswer(question.id, value);
        goForwardTo(index + 1);
    }

    function handleBack() {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        loadQuestion(index - 1);
    }

    async function handlePurchase() {
        setPurchasing(true);
        setError(null);

        try {
            const { data: result } = await createQuestionnaireResponsePurchase(responseId);
            window.location.href = result.init_point;
        } catch (purchaseError) {
            setError(purchaseError.response?.data?.message ?? t('common.genericError'));
            setPurchasing(false);
        }
    }

    async function handleFinalize() {
        setFinalizing(true);
        setError(null);

        try {
            const { data: result } = await finalizeQuestionnaireResponse(responseId);
            setCredits(result.wallet_plan_credits);
            setAiResponse(result.response.ai_response);
            setSent(true);
        } catch (submitError) {
            if (submitError.response?.status === 422 && submitError.response.data.missing_question_ids) {
                const missing = new Set(submitError.response.data.missing_question_ids);
                const firstMissingIndex = questions.findIndex((q) => missing.has(q.id));
                if (firstMissingIndex !== -1) loadQuestion(firstMissingIndex);
                setError(t('questionnaireForm.missingRequired'));
            } else if (submitError.response?.status === 422 && submitError.response.data.message) {
                setError(submitError.response.data.message);
            } else {
                setError(t('common.genericError'));
            }
        } finally {
            setFinalizing(false);
        }
    }

    if (sent) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-app px-6 py-10">
                <div className="w-full max-w-2xl text-center">
                    <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{t('questionnaireForm.sentTitle')}</h1>
                    <p className="mt-2 text-sm text-muted">{t('questionnaireForm.sentSubtitle')}</p>
                    {credits?.limit !== null && credits?.limit !== undefined && (
                        <p className="mt-1 text-sm text-muted">
                            {t('questionnaireForm.creditsRemaining', { count: credits.remaining })}
                        </p>
                    )}

                    {aiResponse && (
                        <div className="mt-6 rounded-2xl border border-line bg-surface p-5 text-left">
                            <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                                {t('questionnaireForm.aiResponseTitle')}
                            </p>
                            <p className="mt-2 whitespace-pre-line text-sm text-ink">{aiResponse}</p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={onFinalized}
                        className="mt-6 rounded-full bg-brand px-6 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                    >
                        {t('questionnaireForm.backToList')}
                    </button>
                </div>
            </div>
        );
    }

    const isChoiceType = !isReview && (question.type === 'single_choice' || question.type === 'multi_choice');
    const inputClass =
        'w-full rounded-xl border border-line bg-surface px-4 py-3 text-lg text-ink focus:border-brand focus:outline-none';
    const progressPct = (Math.min(index + 1, questions.length) / questions.length) * 100;
    const outOfCredits = credits?.limit !== null && credits?.limit !== undefined && credits?.remaining <= 0;
    const isPurchased = purchaseStatus === 'paid';
    const canBuyStandalone = outOfCredits && !isPurchased && Boolean(data.questionnaire.price);
    const canFinalize = !outOfCredits || isPurchased;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-app px-6 py-6">
            <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
                <button
                    type="button"
                    onClick={onExit}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
                >
                    <FontAwesomeIcon icon={faTimes} className="h-3.5 w-3.5" />
                    {t('questionnaireForm.exit')}
                </button>
                <span className="text-xs font-medium text-muted">
                    {isReview ? questions.length : index + 1} / {questions.length}
                </span>
            </div>

            <div className="mx-auto mt-3 h-1 w-full max-w-2xl overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progressPct}%` }} />
            </div>

            <div
                className={`mx-auto flex w-full max-w-2xl flex-1 flex-col ${
                    isReview ? 'overflow-y-auto py-4' : 'justify-center'
                }`}
            >
                {isReview ? (
                    <div>
                        <div className="text-center">
                            <h1 className="text-2xl font-semibold text-balance text-ink sm:text-3xl">
                                {t('questionnaireForm.reviewTitle')}
                            </h1>
                            <p className="mt-2 text-sm text-muted">{t('questionnaireForm.reviewSubtitle')}</p>
                            {credits && credits.limit !== null && (
                                <p className={`mt-2 text-sm ${outOfCredits && !isPurchased ? 'text-red-600' : 'text-muted'}`}>
                                    {outOfCredits
                                        ? isPurchased
                                            ? t('questionnaireForm.purchaseConfirmed')
                                            : t('questionnaireForm.noCreditsLeft')
                                        : t('questionnaireForm.creditsWillBeUsed', { count: credits.remaining - 1 })}
                                </p>
                            )}

                            {canBuyStandalone && (
                                <div className="mt-4 rounded-2xl border border-line bg-surface p-4 text-left">
                                    <p className="text-sm text-ink">
                                        {t('questionnaireForm.purchaseOffer', {
                                            price: formatCurrency(data.questionnaire.price, 'pt-BR'),
                                        })}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handlePurchase}
                                        disabled={purchasing}
                                        className="mt-3 rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {purchasing
                                            ? t('questionnaireForm.purchasing')
                                            : t('questionnaireForm.buyStandalone', {
                                                  price: formatCurrency(data.questionnaire.price, 'pt-BR'),
                                              })}
                                    </button>
                                    {purchaseStatus === 'pending' && (
                                        <p className="mt-2 text-xs text-muted">{t('questionnaireForm.purchasePending')}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col gap-4">
                            {data.questionnaire.sections.map((section) => (
                                <div key={section.id} className="rounded-2xl border border-line bg-surface p-2">
                                    <p className="px-2 pt-2 text-xs font-semibold tracking-wide text-brand uppercase">
                                        {section.title}
                                    </p>
                                    <div className="mt-1 flex flex-col divide-y divide-line">
                                        {section.questions.map((sectionQuestion) => {
                                            const flatIndex = questions.findIndex((q) => q.id === sectionQuestion.id);

                                            return (
                                                <button
                                                    key={sectionQuestion.id}
                                                    type="button"
                                                    onClick={() => loadQuestion(flatIndex)}
                                                    className="w-full text-left transition-colors hover:bg-app"
                                                >
                                                    <QuestionField question={questions[flatIndex]} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : showingSectionIntro ? (
                    <div className="text-center">
                        <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                            {t('questionnaireForm.sectionIntroLabel')}
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold text-balance text-ink sm:text-3xl">
                            {question.sectionTitle}
                        </h1>
                        {question.sectionObjective && (
                            <p className="mt-4 text-base text-muted">{question.sectionObjective}</p>
                        )}
                    </div>
                ) : (
                    <>
                        <h1 className="text-center text-2xl font-semibold text-balance text-ink sm:text-3xl">
                            {question.prompt}
                            {question.is_required && <span className="ml-1 text-red-600">*</span>}
                        </h1>
                        {question.help_text && (
                            <p className="mt-2 text-center text-sm text-muted">{question.help_text}</p>
                        )}

                        <div className="mt-8">
                            {question.type === 'text' && (
                                <input
                                    type="text"
                                    autoFocus
                                    value={value.text ?? ''}
                                    onChange={handleTextChange}
                                    className={inputClass}
                                />
                            )}

                            {question.type === 'textarea' && (
                                <textarea
                                    autoFocus
                                    value={value.text ?? ''}
                                    onChange={handleTextChange}
                                    rows={4}
                                    className={inputClass}
                                />
                            )}

                            {question.type === 'number' && (
                                <input
                                    type="number"
                                    autoFocus
                                    value={value.number ?? ''}
                                    onChange={handleNumberChange}
                                    className={inputClass}
                                />
                            )}

                            {question.type === 'currency' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-lg text-muted">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        autoFocus
                                        value={value.number ?? ''}
                                        onChange={handleNumberChange}
                                        className={inputClass}
                                    />
                                </div>
                            )}

                            {question.type === 'single_choice' && (
                                <div className="flex flex-col gap-3">
                                    {(question.options ?? []).map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handleSingleChoiceSelect(option)}
                                            className={`rounded-xl border px-4 py-3 text-left text-base transition-colors ${
                                                !otherChecked && (value.options ?? []).includes(option)
                                                    ? 'border-brand bg-brand/10 text-ink'
                                                    : 'border-line bg-surface text-ink hover:bg-app'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                    {question.allow_other && (
                                        <button
                                            type="button"
                                            onClick={handleOtherSelect}
                                            className={`rounded-xl border px-4 py-3 text-left text-base transition-colors ${
                                                otherChecked
                                                    ? 'border-brand bg-brand/10 text-ink'
                                                    : 'border-line bg-surface text-ink hover:bg-app'
                                            }`}
                                        >
                                            {t('questionField.other')}
                                        </button>
                                    )}
                                    {otherChecked && (
                                        <input
                                            type="text"
                                            autoFocus
                                            value={value.other ?? ''}
                                            onChange={handleOtherTextChange}
                                            className={inputClass}
                                        />
                                    )}
                                </div>
                            )}

                            {question.type === 'multi_choice' && (
                                <div className="flex flex-col gap-3">
                                    {(question.options ?? []).map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handleMultiChoiceSelect(option)}
                                            className="rounded-xl border border-line bg-surface px-4 py-3 text-left text-base text-ink transition-colors hover:bg-app"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                    {question.allow_other && (
                                        <button
                                            type="button"
                                            onClick={handleOtherSelect}
                                            className="rounded-xl border border-line bg-surface px-4 py-3 text-left text-base text-ink transition-colors hover:bg-app"
                                        >
                                            {t('questionField.other')}
                                        </button>
                                    )}
                                    {otherChecked && (
                                        <input
                                            type="text"
                                            autoFocus
                                            value={value.other ?? ''}
                                            onChange={handleOtherTextChange}
                                            className={inputClass}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
            </div>

            <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={isFirst}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-app disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
                    {t('questionnaireForm.previous')}
                </button>

                {isReview ? (
                    <button
                        type="button"
                        onClick={handleFinalize}
                        disabled={finalizing || !canFinalize}
                        className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {finalizing ? t('questionnaireForm.finalizing') : t('questionnaireForm.submitToConsultant')}
                    </button>
                ) : showingSectionIntro ? (
                    <button
                        type="button"
                        onClick={() => setShowingSectionIntro(false)}
                        className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
                    >
                        {t('questionnaireForm.next')}
                    </button>
                ) : (
                    (!isChoiceType || otherChecked) && (
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={saving}
                            className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {t('questionnaireForm.next')}
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
