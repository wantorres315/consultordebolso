import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faArrowLeft, faFile, faPaperPlane, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    fetchSupportTicket,
    sendSupportTicketMessage,
    supportTicketAttachmentUrl,
    updateSupportTicketStatus,
} from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatFileSize } from '../lib/fileSize';
import AttachmentPicker from './AttachmentPicker';

function isImage(mimeType) {
    return typeof mimeType === 'string' && mimeType.startsWith('image/');
}

function EventRow({ message, t, i18n }) {
    return (
        <div className="flex items-center justify-center gap-2 py-1 text-xs text-muted">
            <span>
                {t(message.event === 'closed' ? 'supportThread.eventClosedBy' : 'supportThread.eventReopenedBy', {
                    name: message.user?.is_platform_admin ? t('supportThread.support') : message.user?.name,
                })}
            </span>
            <span>·</span>
            <span>
                {new Date(message.created_at).toLocaleString(i18n.language, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                })}
            </span>
        </div>
    );
}

function MessageAttachments({ attachments, onOpenImage }) {
    if (!attachments?.length) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((attachment) =>
                isImage(attachment.mime_type) ? (
                    <button
                        key={attachment.id}
                        type="button"
                        onClick={() => onOpenImage(attachment)}
                        className="block"
                    >
                        <img
                            src={supportTicketAttachmentUrl(attachment.id)}
                            alt={attachment.original_name}
                            className="h-24 w-24 rounded-xl border border-line/40 object-cover"
                        />
                    </button>
                ) : (
                    <a
                        key={attachment.id}
                        href={supportTicketAttachmentUrl(attachment.id)}
                        className="flex items-center gap-2 rounded-xl border border-line/40 bg-black/5 px-3 py-2 text-xs"
                    >
                        <FontAwesomeIcon icon={faFile} className="h-3.5 w-3.5" />
                        <span className="max-w-[10rem] truncate">{attachment.original_name}</span>
                        <span className="opacity-70">{formatFileSize(attachment.size)}</span>
                    </a>
                )
            )}
        </div>
    );
}

function ImageLightbox({ attachment, onClose, t }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-4"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label={t('common.close')}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink hover:opacity-80"
            >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
            </button>
            <img
                src={supportTicketAttachmentUrl(attachment.id)}
                alt={attachment.original_name}
                onClick={(event) => event.stopPropagation()}
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-xl"
            />
        </div>
    );
}

export default function SupportTicketThread({ ticketId, backTo, backLabel, showAccount = false }) {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reply, setReply] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [sending, setSending] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [lightboxAttachment, setLightboxAttachment] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        fetchSupportTicket(ticketId)
            .then(({ data }) => setTicket(data))
            .catch(() => setError(t('supportThread.loadError')))
            .finally(() => setLoading(false));
    }, [ticketId, t]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: 'nearest' });
    }, [ticket?.messages?.length]);

    async function handleSend(event) {
        event.preventDefault();
        if (!reply.trim() && attachments.length === 0) return;

        setSending(true);
        setError(null);

        try {
            const { data: message } = await sendSupportTicketMessage(ticketId, reply.trim(), attachments);
            setTicket((previous) => ({ ...previous, messages: [...previous.messages, message] }));
            setReply('');
            setAttachments([]);
        } catch {
            setError(t('supportThread.sendError'));
        } finally {
            setSending(false);
        }
    }

    async function handleToggleStatus() {
        const nextStatus = ticket.status === 'closed' ? 'open' : 'closed';
        setUpdatingStatus(true);
        setError(null);

        try {
            const { data } = await updateSupportTicketStatus(ticketId, nextStatus);
            setTicket((previous) => ({
                ...previous,
                status: data.status,
                messages: [
                    ...previous.messages,
                    {
                        id: `status-${Date.now()}`,
                        event: nextStatus === 'closed' ? 'closed' : 'reopened',
                        user,
                        created_at: new Date().toISOString(),
                    },
                ],
            }));
        } catch {
            setError(t('supportThread.statusError'));
        } finally {
            setUpdatingStatus(false);
        }
    }

    return (
        <div>
            <Link to={backTo} className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
                <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
                {backLabel}
            </Link>

            {loading && <p className="mt-4 text-sm text-muted">{t('supportThread.loading')}</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {ticket && (
                <>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold text-ink">{ticket.subject}</h1>
                            {showAccount && ticket.account && (
                                <p className="mt-1 text-sm text-muted">{ticket.account.name}</p>
                            )}
                            <p className="mt-1 text-xs text-muted">
                                {t('supportThread.openedOn', {
                                    date: new Date(ticket.created_at).toLocaleString(i18n.language, {
                                        dateStyle: 'short',
                                        timeStyle: 'short',
                                    }),
                                    name: ticket.opened_by?.name,
                                })}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    ticket.status === 'closed' ? 'bg-app text-muted' : 'bg-success text-white'
                                }`}
                            >
                                {ticket.status === 'closed' ? t('supportThread.statusClosed') : t('supportThread.statusOpen')}
                            </span>
                            <button
                                type="button"
                                onClick={handleToggleStatus}
                                disabled={updatingStatus}
                                className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-app disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {ticket.status === 'closed' ? t('supportThread.reopen') : t('supportThread.close')}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                        {ticket.messages.map((message) => {
                            if (message.event) {
                                return <EventRow key={message.id} message={message} t={t} i18n={i18n} />;
                            }

                            const isAdminMessage = Boolean(message.user?.is_platform_admin);
                            const isOwnMessage = message.user?.id === user?.id;

                            return (
                                <div
                                    key={message.id}
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                                        isOwnMessage
                                            ? 'ml-auto bg-brand text-brand-ink'
                                            : isAdminMessage
                                              ? 'bg-navy text-white'
                                              : 'bg-app text-ink'
                                    }`}
                                >
                                    <div className="mb-1 flex items-center justify-between gap-4 text-xs opacity-80">
                                        <span>{isAdminMessage ? t('supportThread.support') : message.user?.name}</span>
                                        <span>
                                            {new Date(message.created_at).toLocaleString(i18n.language, {
                                                dateStyle: 'short',
                                                timeStyle: 'short',
                                            })}
                                        </span>
                                    </div>
                                    {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}
                                    <MessageAttachments
                                        attachments={message.attachments}
                                        onOpenImage={setLightboxAttachment}
                                    />
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {ticket.status === 'closed' ? (
                        <p className="mt-6 text-sm text-muted">{t('supportThread.closedNotice')}</p>
                    ) : (
                        <form onSubmit={handleSend} className="mt-6 flex flex-col gap-2">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={reply}
                                    onChange={(event) => setReply(event.target.value)}
                                    placeholder={t('supportThread.replyPlaceholder')}
                                    rows={2}
                                    className="w-full resize-none rounded-2xl border border-line px-4 py-3 text-sm text-ink focus:border-brand focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || (!reply.trim() && attachments.length === 0)}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                    aria-label={t('supportThread.send')}
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <AttachmentPicker files={attachments} onChange={setAttachments} disabled={sending} />
                        </form>
                    )}
                </>
            )}

            {lightboxAttachment && (
                <ImageLightbox attachment={lightboxAttachment} onClose={() => setLightboxAttachment(null)} t={t} />
            )}
        </div>
    );
}
