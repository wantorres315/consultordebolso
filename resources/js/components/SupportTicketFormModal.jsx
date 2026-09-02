import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createSupportTicket } from '../lib/api';
import AttachmentPicker from './AttachmentPicker';

export default function SupportTicketFormModal({ onClose, onCreated }) {
    const { t } = useTranslation();
    const [form, setForm] = useState({ subject: '', message: '' });
    const [attachments, setAttachments] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const { data } = await createSupportTicket({ ...form, attachments });
            onCreated(data);
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            } else {
                setErrors({ subject: [t('common.genericError')] });
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-ink">{t('supportTicketFormModal.title')}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted hover:text-ink"
                        aria-label={t('common.close')}
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink">
                            {t('supportTicketFormModal.subject')}
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject[0]}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink">
                            {t('supportTicketFormModal.message')}
                        </label>
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full resize-none rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message[0]}</p>}
                    </div>

                    <AttachmentPicker files={attachments} onChange={setAttachments} disabled={submitting} />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-2 rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? t('common.saving') : t('supportTicketFormModal.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
}
