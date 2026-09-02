import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { faPaperclip, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatFileSize } from '../lib/fileSize';

const ACCEPT = '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt';
const MAX_FILES = 5;

export default function AttachmentPicker({ files, onChange, disabled = false }) {
    const { t } = useTranslation();
    const inputId = useId();
    const inputRef = useRef(null);

    function handleSelect(event) {
        const selected = Array.from(event.target.files ?? []);
        onChange([...files, ...selected].slice(0, MAX_FILES));
        event.target.value = '';
    }

    function handleRemove(index) {
        onChange(files.filter((_, i) => i !== index));
    }

    return (
        <div>
            <input
                ref={inputRef}
                id={inputId}
                type="file"
                multiple
                accept={ACCEPT}
                onChange={handleSelect}
                disabled={disabled || files.length >= MAX_FILES}
                className="hidden"
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || files.length >= MAX_FILES}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
                <FontAwesomeIcon icon={faPaperclip} className="h-3.5 w-3.5" />
                {t('attachmentPicker.attach')}
            </button>

            {files.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                    {files.map((file, index) => (
                        <li
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-2 rounded-full bg-app px-3 py-1 text-xs text-ink"
                        >
                            <span className="max-w-[10rem] truncate">{file.name}</span>
                            <span className="text-muted">{formatFileSize(file.size)}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                disabled={disabled}
                                aria-label={t('attachmentPicker.remove')}
                                className="text-muted hover:text-ink"
                            >
                                <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
