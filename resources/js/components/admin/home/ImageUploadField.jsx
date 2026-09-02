import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uploadAdminHomeSectionImage } from '../../../lib/api';
import LocalizedTextField from './LocalizedTextField';

export default function ImageUploadField({ value, onChange, label, altValue, onAltChange }) {
    const { t } = useTranslation();
    const inputId = useId();
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    async function handleSelect(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const { data } = await uploadAdminHomeSectionImage(file);
            onChange(data.url);
        } catch {
            setError(t('adminSite.imageUploadError'));
        } finally {
            setUploading(false);
        }
    }

    return (
        <div>
            {label && <label className="mb-1 block text-sm font-medium text-ink">{label}</label>}

            {value ? (
                <div className="relative inline-block">
                    <img src={value} alt="" className="h-28 w-28 rounded-xl border border-line object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        aria-label={t('attachmentPicker.remove')}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface text-ink shadow-sm shadow-black/10 hover:opacity-80"
                    >
                        <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-line text-xs font-medium text-muted hover:bg-app disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {uploading ? t('common.saving') : t('adminSite.uploadImage')}
                </button>
            )}

            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept="image/*"
                onChange={handleSelect}
                className="hidden"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

            {value && onAltChange && (
                <div className="mt-2 w-48">
                    <LocalizedTextField value={altValue} onChange={onAltChange} placeholder={t('adminSite.fieldImageAlt')} />
                </div>
            )}
        </div>
    );
}
